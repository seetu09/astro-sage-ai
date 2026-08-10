import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.MOONSHOT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { reply: "API key not configured. Please add MOONSHOT_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a knowledgeable and compassionate Vedic astrologer with deep expertise in Jyotish Shastra. 
You provide insights based on Vedic astrology principles including:
- Birth chart (Kundali) analysis
- Planetary positions and their effects
- Nakshatra and Rashi interpretations
- Dasha periods and transits
- Remedies (gemstones, mantras, yantras)
- Compatibility analysis
- Career, love, health, and spiritual guidance

Always be respectful, culturally sensitive, and encouraging. Use Sanskrit terms where appropriate but explain them clearly. 
If asked about specific predictions, provide guidance while emphasizing free will and karma. 
Keep responses concise but insightful (2-4 paragraphs max).`;

    const res = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Moonshot API error:", error);
      return NextResponse.json(
        { reply: "I apologize, but the cosmic energies are turbulent right now. Please try again shortly." },
        { status: 200 }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "The stars are silent today. Please ask again.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "A disturbance in the cosmic realm prevented me from answering. Please try again." },
      { status: 200 }
    );
  }
}
