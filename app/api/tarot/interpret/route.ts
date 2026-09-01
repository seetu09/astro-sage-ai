import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getCardById, type DrawnCard, type TarotTopic } from "@/lib/tarot-data";

const DEV_MODE = process.env.NODE_ENV !== "production";

interface InterpretRequest {
  topic: TarotTopic;
  cards: DrawnCard[];
}

const POSITION_NAMES: Record<DrawnCard["position"], string> = {
  past: "Past",
  present: "Present",
  future: "Future / Outcome",
};

function buildMockInterpretation(req: InterpretRequest): string {
  const { topic, cards } = req;
  const cardDetails = cards.map((c) => {
    const card = getCardById(c.cardId);
    return {
      position: POSITION_NAMES[c.position],
      name: card?.name ?? "Unknown Card",
      orientation: c.reversed ? "reversed" : "upright",
      meaning: c.reversed ? card?.reversed : card?.upright,
    };
  });

  const topicIntro: Record<TarotTopic, string> = {
    love: "Your love reading reveals the emotional currents flowing through your relationships.",
    career: "Your career reading highlights the professional energies shaping your path forward.",
    general: "Your general reading offers insight into the broader themes of your life journey.",
  };

  const bullets = cardDetails.map(
    (c) => `• **${c.position} — ${c.name} (${c.orientation})**: ${c.meaning}.`
  );

  const conclusions = [
    "Trust the journey. The cards suggest that patience and self-awareness will guide you toward clarity.",
    "Stay grounded in your values. The universe is aligning to support your growth if you remain open.",
    "Embrace the lessons of each phase. Your past experiences are the foundation for a brighter future.",
  ];

  return `${topicIntro[topic]}\n\n${bullets.join("\n")}\n\n**Conclusion**: ${conclusions[Math.floor(Math.random() * conclusions.length)]}`;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit — protect Moonshot spend (30 req / 60s / IP).
    const { allowed, retryAfter } = checkRateLimit(
      `tarot:${getClientIp(request)}`,
      30,
      60_000
    );
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const body: InterpretRequest = await request.json();

    if (!body.cards || !Array.isArray(body.cards) || body.cards.length !== 3) {
      return NextResponse.json({ error: "Exactly 3 drawn cards are required" }, { status: 400 });
    }

    if (!body.topic || !["love", "career", "general"].includes(body.topic)) {
      return NextResponse.json({ error: "Valid topic is required (love, career, general)" }, { status: 400 });
    }

    if (DEV_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return NextResponse.json({ interpretation: buildMockInterpretation(body) });
    }

    // Production: call LLM API
    const cardDescriptions = body.cards
      .map((c) => {
        const card = getCardById(c.cardId);
        return `${POSITION_NAMES[c.position]}: ${card?.name} (${c.reversed ? "reversed" : "upright"}) - ${c.reversed ? card?.reversed : card?.upright}`;
      })
      .join("; ");

    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MOONSHOT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "system",
            content:
              "You are an expert tarot reader. Provide a concise interpretation under 180 words. Use exactly 3 bold bullet points (one per card position) and end with a practical conclusion. Be encouraging and constructive.",
          },
          {
            role: "user",
            content: `Topic: ${body.topic}. Drawn cards: ${cardDescriptions}. Provide the interpretation.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const interpretation = data?.choices?.[0]?.message?.content;
    // Validate the LLM output — only serve it if it's a non-empty string.
    // Malformed / empty output falls back to the deterministic mock reading.
    if (typeof interpretation === "string" && interpretation.trim()) {
      return NextResponse.json({ interpretation: interpretation.trim() });
    }
    return NextResponse.json({ interpretation: buildMockInterpretation(body) });
  } catch {
    return NextResponse.json({ error: "Failed to generate interpretation" }, { status: 500 });
  }
}