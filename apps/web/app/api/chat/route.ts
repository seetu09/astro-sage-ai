import { NextRequest, NextResponse } from "next/server";

// ============================================================
// DEV MODE — Set to true to use mock responses (no API calls)
// Set to false once you top up Moonshot and want real AI
// ============================================================
const DEV_MODE = true;

// Realistic mock responses based on keywords in the user's message
function getMockResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  // Career-related
  if (msg.includes("career") || msg.includes("job") || msg.includes("work") || msg.includes("profession") || msg.includes("business")) {
    return `Your 10th house of career is strongly illuminated by Saturn's current transit, indicating a period of disciplined growth and long-term rewards. If you are experiencing delays, do not despair — Saturn teaches patience and perseverance.

For those in creative or leadership roles, the Sun's influence in your chart suggests recognition is coming, particularly after September. If considering a job change, the period between the 15th and 30th of this month is favorable for new beginnings.

A suitable remedy during this time is to chant the *Shani Stotra* on Saturdays and consider wearing a blue sapphire only after proper consultation with a qualified astrologer.`;
  }

  // Love / Relationships
  if (msg.includes("love") || msg.includes("relationship") || msg.includes("marriage") || msg.includes("partner") || msg.includes("spouse") || msg.includes("boyfriend") || msg.includes("girlfriend")) {
    return `Venus, the planet of love and harmony, is currently transiting through a favorable house in your chart. This brings warmth and understanding into your relationships. If you are seeking a partner, the energy is supportive for meaningful connections in the coming weeks.

For those already in a relationship, this is an excellent time to deepen emotional bonds. Mercury's influence encourages open and honest communication — speak your truth with kindness.

If marriage is on your mind, the period after the next full moon is particularly auspicious. Consider offering white flowers to Goddess Lakshmi on Fridays to strengthen Venus's blessings in your life.`;
  }

  // Health
  if (msg.includes("health") || msg.includes("wellness") || msg.includes("sick") || msg.includes("disease") || msg.includes("body") || msg.includes("fitness")) {
    return `Your 1st house (Lagna) and 6th house of health are under the gentle gaze of Jupiter, which is a protective influence. However, Mars may be causing minor inflammation or energy fluctuations — pay attention to your diet and avoid excessive heat-inducing foods.

This is an ideal time to establish a consistent routine. Practices like *Pranayama* and *Surya Namaskar* will align your physical energy with cosmic rhythms. Sleep disturbances, if any, should resolve by the end of this month.

A beneficial remedy is to drink water from a copper vessel each morning and chant the *Maha Mrityunjaya Mantra* 108 times on Tuesdays for vitality and protection.`;
  }

  // Finance / Money
  if (msg.includes("money") || msg.includes("finance") || msg.includes("wealth") || msg.includes("income") || msg.includes("investment") || msg.includes("property")) {
    return `Jupiter, the great benefic and significator of wealth, is casting a favorable aspect on your 2nd house of accumulated wealth and 11th house of gains. This indicates a period of financial stability and potential unexpected gains, possibly through ancestral property or long-term investments.

However, Rahu's presence warns against speculative or get-rich-quick schemes. Stick to disciplined saving and well-researched decisions. A significant financial opportunity may present itself around the 20th of this month — evaluate it carefully.

To enhance prosperity, place a *Kuber Yantra* in the northeast corner of your home and chant *"Om Shreem Hreem Kleem Shreem Kleem Vitteshvaraya Namah"* 108 times on Wednesdays.`;
  }

  // Birth chart / Kundali
  if (msg.includes("birth chart") || msg.includes("kundali") || msg.includes("horoscope") || msg.includes("janam kundli") || msg.includes("natal chart") || msg.includes("rashi") || msg.includes("nakshatra")) {
    return `Your birth chart is a sacred map of your soul's journey across lifetimes. The Ascendant (Lagna) represents your physical self and approach to life, while the Moon sign (Chandra Rashi) governs your mind and emotions. The Sun sign reflects your soul's core purpose.

The placement of planets in different houses and their relationships (Yogas and Doshas) reveal your karmic patterns. For example, a strong *Gaja Kesari Yoga* (Jupiter-Moon conjunction) brings wisdom and recognition, while *Kaal Sarp Dosha* may create feelings of being held back.

To provide a detailed analysis, I would need your exact birth date, time, and place. Would you like to generate your full Kundali using our Free Kundali tool? It reveals your ascendant, moon sign, planetary positions, and current Dasha period.`;
  }

  // Spiritual / General
  if (msg.includes("spiritual") || msg.includes("meditation") || msg.includes("dharma") || msg.includes("karma") || msg.includes("purpose") || msg.includes("meaning")) {
    return `The 9th house of Dharma and the 12th house of liberation are key to understanding your spiritual path. Jupiter's placement in your chart indicates a natural inclination toward wisdom and higher learning. You are being called to look beyond material pursuits and connect with your inner self.

The current planetary alignment supports spiritual practices — meditation, chanting, and self-study will yield profound insights now. The *Bhagavad Gita* teaches us to perform our duty without attachment to results — this is the essence of Karma Yoga.

Consider waking up during *Brahma Muhurta* (roughly 90 minutes before sunrise) for meditation. Chanting *"Om Namah Shivaya"* 108 times daily will cleanse past karmas and open the path to higher consciousness.`;
  }

  // Education / Students
  if (msg.includes("study") || msg.includes("exam") || msg.includes("education") || msg.includes("student") || msg.includes("college") || msg.includes("university")) {
    return `Mercury, the planet of intellect and communication, is well-placed for learning and academic success. If you have examinations approaching, the period between the 10th and 25th of this month is highly favorable for concentration and memory retention.

Jupiter's aspect on your 5th house of education suggests that higher studies or competitive exams will yield positive results, provided you maintain discipline. Avoid distractions during Mercury retrograde periods.

For students, wearing emerald (after consultation) and keeping a Saraswati Yantra on your study desk can enhance focus. Chanting *"Om Aim Saraswatyai Namah"* before studying invokes the goddess of wisdom.`;
  }

  // Remedies / Gemstones
  if (msg.includes("remedy") || msg.includes("gemstone") || msg.includes("mantra") || msg.includes("yantra") || msg.includes("puja") || msg.includes("ritual")) {
    return `Vedic remedies (Upayas) are powerful tools to harmonize planetary energies. They work on the principle of *"Samanya Vishesha"* — using specific vibrations, colors, and elements to balance cosmic influences.

**Gemstones:** Wear only after proper chart analysis. Ruby for Sun, Pearl for Moon, Coral for Mars, Emerald for Mercury, Yellow Sapphire for Jupiter, Diamond for Venus, Blue Sapphire for Saturn, Hessonite for Rahu, and Cat's Eye for Ketu.

**Mantras:** Chanting planetary mantras 108 times during the corresponding planet's Hora (hour) amplifies their effect.

**Yantras:** Sacred geometric diagrams energized with mantras. Place them in the appropriate direction of your home.

**Charity:** Donating items related to afflicted planets on their designated days is one of the most effective remedies. Would you like a personalized remedy based on your birth chart?`;
  }

  // Default / General response
  return `Namaste! The cosmic energies around you are in a state of dynamic balance. The Moon's current transit suggests emotional clarity is within reach, while Jupiter continues to expand opportunities in your life path.

Remember that Vedic astrology is a guide, not a prison. Your *Purushartha* (conscious effort) combined with *Prarabdha* (destined karma) shapes your reality. The planets indicate tendencies, but your free will determines the outcome.

If you have a specific question about career, relationships, health, finance, or your birth chart, please share more details. The more specific your question, the more precise the cosmic guidance I can offer. May the stars illuminate your path! 🙏`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Extract the latest user message for keyword matching in dev mode
    const latestUserMessage = messages
      .filter((m: any) => m.role === "user")
      .pop()?.content || "";

    // ============================================================
    // DEV MODE: Return mock response instantly
    // ============================================================
    if (DEV_MODE) {
      // Add a small artificial delay so it feels realistic (300-800ms)
      await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));
      
      const reply = getMockResponse(latestUserMessage);
      return NextResponse.json({ reply });
    }

    // ============================================================
    // PRODUCTION MODE: Call real Moonshot API
    // ============================================================
    const apiKey = process.env.MOONSHOT_API_KEY;
    if (!apiKey) {
      console.error("MOONSHOT_API_KEY is not set");
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

    const res = await fetch("https://api.moonshot.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "kimi-k2.5",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Moonshot API error:", res.status, errorText);
      return NextResponse.json(
        { reply: `I apologize, but I am having trouble connecting to the cosmic realm right now. (Error: ${res.status}) Please try again in a moment.` },
        { status: 200 }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("Empty response from Moonshot:", data);
      return NextResponse.json(
        { reply: "The stars are silent today. Please ask again." },
        { status: 200 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API error:", error?.message || error);
    return NextResponse.json(
      { reply: "A disturbance in the cosmic realm prevented me from answering. Please try again." },
      { status: 200 }
    );
  }
}
