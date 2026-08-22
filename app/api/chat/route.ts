import { NextRequest, NextResponse } from 'next/server';

// --- System prompt: grounded Vedic Astrologer persona with safety guardrails ---
const SYSTEM_PROMPT = `You are a grounded, insightful Vedic Astrologer (Jyotish Guru). You offer thoughtful astrological guidance rooted in Vedic tradition — drawing on grahas (planets), rashis (signs), bhavas (houses), nakshatras, dashas (planetary periods), and gochara (transits) where relevant. Stay warm, balanced, and honest about astrology's reflective nature: empower the seeker with insight rather than fostering fear or dependency.

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
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Friendly guard if the Gemini key isn't configured in this environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: "The astrologer's AI service isn't configured yet. Please add GEMINI_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    // Live Gemini Flash call via native fetch (SSE streaming — alt=sse yields incremental data events)
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `${SYSTEM_PROMPT}\n\nRespond in ${language === 'hi' ? 'Hindi' : 'English'}.` }],
          },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            // Disable hidden "thinking" tokens so the full budget goes to visible text
            // and streaming starts immediately (supported by gemini-2.5-flash)
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    if (!geminiResponse.ok || !geminiResponse.body) {
      let upstreamDetail = '';
      try {
        upstreamDetail = await geminiResponse.text();
      } catch {
        // Ignore unreadable error bodies
      }
      console.error(`Gemini API error (${geminiResponse.status}): ${upstreamDetail.slice(0, 500)}`);

      // Upstream rate limit — relay a friendly message and honor Retry-After when present
      if (geminiResponse.status === 429) {
        const retryAfter = geminiResponse.headers.get('retry-after');
        return NextResponse.json(
          { error: 'The astrologer is receiving too many questions right now. Please wait a moment and try again.' },
          retryAfter
            ? { status: 429, headers: { 'Retry-After': retryAfter } }
            : { status: 429 }
        );
      }

      // Invalid key / malformed request — configuration problem on our side
      if (geminiResponse.status === 400 || geminiResponse.status === 403) {
        return NextResponse.json(
          { error: "We couldn't reach the astrologer due to an API configuration issue. Please verify GEMINI_API_KEY is valid." },
          { status: 500 }
        );
      }

      // Any other upstream failure
      return NextResponse.json(
        { error: 'The astrologer is unavailable right now. Please try again shortly.' },
        { status: 502 }
      );
    }

    // Parse Gemini SSE and re-emit plain text deltas for the client
    const upstream = geminiResponse.body;
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
              if (!payload || payload === '[DONE]') continue;
              try {
                const json = JSON.parse(payload);

                // If Gemini blocked the prompt outright, surface a gentle note
                const blockReason: string | undefined = json.promptFeedback?.blockReason;
                if (blockReason && !json.candidates?.length) {
                  controller.enqueue(encoder.encode("I'm unable to reflect on that question right now. Please try rephrasing it."));
                  continue;
                }

                const parts = json.candidates?.[0]?.content?.parts ?? [];
                for (const part of parts) {
                  if (typeof part.text === 'string' && part.text) {
                    controller.enqueue(encoder.encode(part.text));
                  }
                }
              } catch {
                // Skip malformed SSE chunks
              }
            }
          }
        } catch (error) {
          console.error('Error while streaming Gemini response:', error);
          try {
            controller.enqueue(encoder.encode('\n\n(The connection was interrupted mid-answer. Please ask again.)'));
          } catch {
            // Controller already closed
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