import { NextRequest, NextResponse } from 'next/server';

const DEV_MODE = true;

// --- System prompt with safety guardrails ---
const SYSTEM_PROMPT = `You are a grounded, compassionate Vedic astrology guide. You offer thoughtful astrological insights rooted in Vedic tradition, staying warm, balanced, and honest about astrology's reflective nature.

SAFETY BOUNDARY — you must refuse to make definitive predictions on:
- Medical emergencies or critical health diagnoses
- Pregnancy outcomes
- Active legal disputes

When a user raises these sensitive topics, politely acknowledge their concern, explain that this falls outside responsible astrology, and steer them toward certified professionals: doctors for health matters, psychologists or therapists for mental well-being, and legal professionals for legal matters. Never diagnose, never predict medical outcomes, and never advise on ongoing court cases.`;

// --- IP-based rate limiting: max 15 requests / 60s per IP (in-memory sliding window) ---
const RATE_LIMIT = 15;
const RATE_WINDOW_MS = 60_000;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();

  // Periodically purge expired entries to prevent memory growth
  if (rateLimitMap.size > 1000) {
    rateLimitMap.forEach((entry, key) => {
      if (entry.resetAt < now) rateLimitMap.delete(key);
    });
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

// --- Wrap plain text deltas into a streaming Response ---
function textStream(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' } });
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit check — protect API costs from bot abuse
    const { allowed, retryAfter } = checkRateLimit(getClientIp(request));
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before asking another question.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const { message, language = 'en' } = await request.json();
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    if (DEV_MODE) {
      const mockResponses = {
        en: ["The stars indicate transformation. Jupiter suggests career growth. Focus on long-term goals.", "Your Moon sign reveals deep emotions. Excellent time for meditation and spiritual practices.", "Venus is favorable for love. New romantic opportunities may arise for singles.", "Saturn emphasizes health routines. Establish better habits for diet and exercise.", "Mercury retrograde affects communication. Be mindful in conversations."],
        hi: ["सितारे परिवर्तन का संकेत देते हैं। बृहस्पति करियर विकास का संकेत देता है।", "आपका चंद्र राशि गहरी भावनाओं का खुलासा करता है। ध्यान के लिए उत्कृष्ट समय।", "शुक्र प्रेम के लिए अनुकूल है। अकेले लोगों के लिए नए रोमांटिक अवसर।", "शनि स्वास्थ्य दिनचर्या पर जोर देता है। आहार और व्यायाम के लिए बेहतर आदतें बनाएं।", "बुध वक्री संचार को प्रभावित करता है। बातचीत में सचेत रहें।"],
      };
      const responses = mockResponses[language as keyof typeof mockResponses] || mockResponses.en;
      const text = responses[Math.floor(Math.random() * responses.length)];

      // Simulate token-by-token streaming
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const encoder = new TextEncoder();
          const words = text.split(' ');
          for (let i = 0; i < words.length; i++) {
            controller.enqueue(encoder.encode((i > 0 ? ' ' : '') + words[i]));
            await new Promise((resolve) => setTimeout(resolve, 30));
          }
          controller.close();
        },
      });
      return textStream(stream);
    }

    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}` },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\nRespond in ${language === 'hi' ? 'Hindi' : 'English'}.` },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }

    // Parse Moonshot SSE and re-emit plain text deltas for the client
    const upstream = response.body;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = upstream.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = '';
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const payload = trimmed.slice(5).trim();
              if (payload === '[DONE]') continue;
              try {
                const json = JSON.parse(payload);
                const delta: string | undefined = json.choices?.[0]?.delta?.content;
                if (delta) controller.enqueue(encoder.encode(delta));
              } catch {
                // Skip malformed SSE chunks
              }
            }
          }
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });
    return textStream(stream);
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}