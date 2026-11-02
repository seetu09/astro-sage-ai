import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getCardById, type DrawnCard, type TarotTopic } from "@/lib/tarot-data";
import { getUserFromAuthHeader } from "@/lib/serverWallet";

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
     // Rate limit — protect Gemini spend (30 req / 60s / IP).
     const { allowed, retryAfter } = await checkRateLimit(
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

    const user = getUserFromAuthHeader(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body: InterpretRequest = await request.json();

    const TarotInterpretSchema = z.object({
      topic: z.string().min(1, "topic is required").refine((val) => ["love", "career", "general"].includes(val), "Invalid topic"),
      cards: z.array(z.object({
        cardId: z.string().min(1, "cardId is required"),
        position: z.string().min(1, "position is required"),
        reversed: z.boolean(),
      })),
    });

    const parsed = TarotInterpretSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const parsedBody = parsed.data;

    if (!parsedBody.cards || !Array.isArray(parsedBody.cards) || parsedBody.cards.length !== 3) {
      return NextResponse.json({ error: "Exactly 3 drawn cards are required" }, { status: 400 });
    }

    if (!parsedBody.topic || !["love", "career", "general"].includes(parsedBody.topic)) {
      return NextResponse.json({ error: "Valid topic is required (love, career, general)" }, { status: 400 });
    }

    if (DEV_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return NextResponse.json({ interpretation: buildMockInterpretation(parsedBody as unknown as InterpretRequest) });
    }

     // Production: call LLM API
     const cardDescriptions = parsedBody.cards
       .map((c) => {
         const card = getCardById(c.cardId as unknown as number);
         return `${POSITION_NAMES[c.position as "past" | "present" | "future"]}: ${card?.name} (${c.reversed ? "reversed" : "upright"}) - ${c.reversed ? card?.reversed : card?.upright}`;
       })
       .join("; ");

     const response = await fetch(
       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
       {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           systemInstruction: {
             parts: [
               {
                 text: "You are an expert tarot reader. Provide a concise interpretation under 180 words. Use exactly 3 bold bullet points (one per card position) and end with a practical conclusion. Be encouraging and constructive.",
               },
             ],
           },
           contents: [
             {
               role: "user",
               parts: [
                 {
                   text: `Topic: ${parsedBody.topic}. Drawn cards: ${cardDescriptions}. Provide the interpretation.`,
                 },
               ],
             },
           ],
           generationConfig: {
             temperature: 0.7,
             maxOutputTokens: 300,
             responseMimeType: "text/plain",
           },
         }),
       }
     );

     const data = await response.json();
     const interpretation = data?.candidates?.[0]?.content?.parts?.[0]?.text;
     // Validate the LLM output — only serve it if it's a non-empty string.
     // Malformed / empty output falls back to the deterministic mock reading.
    if (typeof interpretation === "string" && interpretation.trim()) {
      return NextResponse.json({ interpretation: interpretation.trim() });
    }
    return NextResponse.json({ interpretation: buildMockInterpretation(parsedBody as unknown as InterpretRequest) });
  } catch {
    return NextResponse.json({ error: "Failed to generate interpretation" }, { status: 500 });
  }
}