import { NextRequest, NextResponse } from 'next/server';

const DEV_MODE = true;

export async function POST(request: NextRequest) {
  try {
    const { message, language = 'en' } = await request.json();
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    if (DEV_MODE) {
      const mockResponses = {
        en: ["The stars indicate transformation. Jupiter suggests career growth. Focus on long-term goals.", "Your Moon sign reveals deep emotions. Excellent time for meditation and spiritual practices.", "Venus is favorable for love. New romantic opportunities may arise for singles.", "Saturn emphasizes health routines. Establish better habits for diet and exercise.", "Mercury retrograde affects communication. Be mindful in conversations."],
        hi: ["सितारे परिवर्तन का संकेत देते हैं। बृहस्पति करियर विकास का संकेत देता है।", "आपका चंद्र राशि गहरी भावनाओं का खुलासा करता है। ध्यान के लिए उत्कृष्ट समय।", "शुक्र प्रेम के लिए अनुकूल है। अकेले लोगों के लिए नए रोमांटिक अवसर।", "शनि स्वास्थ्य दिनचर्या पर जोर देता है। आहार और व्यायाम के लिए बेहतर आदतें बनाएं।", "बुध वक्री संचार को प्रभावित करता है। बातचीत में सचेत रहें।"],
      };
      const responses = mockResponses[language as keyof typeof mockResponses] || mockResponses.en;
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return NextResponse.json({ response: responses[Math.floor(Math.random() * responses.length)] });
    }

    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}` },
      body: JSON.stringify({ model: 'moonshot-v1-8k', messages: [{ role: 'system', content: `You are an expert Vedic astrologer. Respond in ${language === 'hi' ? 'Hindi' : 'English'}.` }, { role: 'user', content: message }], temperature: 0.7, max_tokens: 500 }),
    });
    const data = await response.json();
    return NextResponse.json({ response: data.choices[0].message.content });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
