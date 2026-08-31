import { NextRequest, NextResponse } from "next/server";

const DEV_MODE = true;

export interface HoroscopeResponse {
  sign: string;
  period: "yesterday" | "today" | "tomorrow";
  date: string;
  prediction: string;
  lucky: {
    color: string;
    number: number;
    time: string;
  };
  scores: {
    career: number;
    love: number;
    money: number;
    health: number;
  };
  insights: {
    career: string;
    love: string;
    money: string;
    health: string;
  };
}

const SIGN_NAMES: Record<string, string> = {
  aries: "Aries", taurus: "Taurus", gemini: "Gemini", cancer: "Cancer",
  leo: "Leo", virgo: "Virgo", libra: "Libra", scorpio: "Scorpio",
  sagittarius: "Sagittarius", capricorn: "Capricorn", aquarius: "Aquarius", pisces: "Pisces",
};

const SIGN_NAMES_HI: Record<string, string> = {
  aries: "मेष", taurus: "वृषभ", gemini: "मिथुन", cancer: "कर्क",
  leo: "सिंह", virgo: "कन्या", libra: "तुला", scorpio: "वृश्चिक",
  sagittarius: "धनु", capricorn: "मकर", aquarius: "कुंभ", pisces: "मीन",
};

const PERIOD_LABELS: Record<string, string> = {
  yesterday: "Yesterday",
  today: "Today",
  tomorrow: "Tomorrow",
};

const PERIOD_LABELS_HI: Record<string, string> = {
  yesterday: "पिछला दिन",
  today: "आज",
  tomorrow: "अगला दिन",
};

function getDateForPeriod(period: string): string {
  const date = new Date();
  if (period === "yesterday") date.setDate(date.getDate() - 1);
  if (period === "tomorrow") date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
}

function buildMockHoroscope(sign: string, period: string, lang: string = "en"): HoroscopeResponse {
  const isHi = lang === "hi";
  const signName = isHi ? (SIGN_NAMES_HI[sign] || "मेष") : (SIGN_NAMES[sign] || "Aries");
  const periodLabel = isHi ? (PERIOD_LABELS_HI[period] || "आज") : (PERIOD_LABELS[period] || "Today");

  const predictions: Record<string, string> = isHi ? {
    yesterday: `${signName} ने चिंतन और पुनर्संतुलन का दिन अनुभव किया। पिछले निर्णय स्पष्टता प्रदान कर रहे हैं। अपनी अंतर्ज्ञान पर भरोसा करें।`,
    today: `${signName}, आज सकारात्मक ऊर्जा और अवसरों का संचार है। करियर उन्नति और सार्थक संबंधों के लिए सितारे आपके अनुकूल हैं। अप्रत्याशित आशीर्वाद के लिए खुले रहें।`,
    tomorrow: `${signName}, कल विकास और नई शुरुआत के लिए आशाजनक है। अनुकूल ग्रह संरेखण आपके पेशेवर जीवन में साहसिक कदमों का समर्थन करता है। अपने रिश्तों का ध्यान रखें।`,
  } : {
    yesterday: `${signName} experienced a day of reflection and recalibration. Past decisions came into focus, offering clarity on what needs adjustment. Trust your instincts as you move forward.`,
    today: `${signName}, today brings a surge of positive energy and opportunity. The stars align in your favor for career advancement and meaningful connections. Stay open to unexpected blessings.`,
    tomorrow: `${signName}, tomorrow holds promise for growth and new beginnings. A favorable planetary alignment supports bold moves in your professional life. Nurture your relationships with care.`,
  };

  const insights: Record<string, { career: string; love: string; money: string; health: string }> = isHi ? {
    yesterday: {
      career: "अपनी हालिया उपलब्धियों की समीक्षा करें और सुधार के क्षेत्रों की पहचान करें।",
      love: "पिछली बातचीत पर विचार करें और भावनात्मक समझ को गहरा करें।",
      money: "अपने बजट का पुनर्मूल्यांकन करें और आगामी खर्चों की योजना बनाएं।",
      health: "अपनी ऊर्जा बहाल करने के लिए आराम को प्राथमिकता दें।",
    },
    today: {
      career: "एक महत्वपूर्ण अवसर प्रस्तुत हो सकता है - इसे पकड़ने के लिए तैयार रहें।",
      love: "खुला संचार आज आपके बंधनों को मजबूत करेगा।",
      money: "वित्तीय योजना और स्मार्ट निवेश के लिए अनुकूल समय।",
      health: "अपनी जीवन शक्ति बढ़ाने के लिए हल्का व्यायाम करें।",
    },
    tomorrow: {
      career: "नई परियोजनाएं या सहयोग महत्वपूर्ण लाभ ला सकते हैं।",
      love: "कल अपने प्रियजनों के लिए कुछ विशेष योजना बनाएं।",
      money: "भविष्य की सुरक्षा के लिए दीर्घकालिक बचत रणनीतियों पर विचार करें।",
      health: "मानसिक स्पष्टता के लिए अपने दिन की शुरुआत ध्यान से करें।",
    },
  } : {
    yesterday: {
      career: "Review your recent achievements and identify areas for improvement.",
      love: "Reflect on past conversations and deepen emotional understanding.",
      money: "Reassess your budget and plan for upcoming expenses.",
      health: "Prioritize rest and recovery to restore your energy.",
    },
    today: {
      career: "A key opportunity may present itself - be ready to seize it.",
      love: "Open communication will strengthen your bonds today.",
      money: "A favorable time for financial planning and smart investments.",
      health: "Incorporate light exercise to boost your vitality.",
    },
    tomorrow: {
      career: "New projects or collaborations could bring significant rewards.",
      love: "Plan something special for your loved ones tomorrow.",
      money: "Consider long-term savings strategies for future security.",
      health: "Start your day with meditation for mental clarity.",
    },
  };

  const scores = {
    yesterday: { career: 3, love: 4, money: 3, health: 4 },
    today: { career: 5, love: 4, money: 4, health: 4 },
    tomorrow: { career: 4, love: 5, money: 4, health: 3 },
  };

  const luckyColors: Record<string, string> = isHi ? {
    aries: "लाल", taurus: "हरा", gemini: "पीला", cancer: "चांदी",
    leo: "सुनहरा", virgo: "गहरा नीला", libra: "गुलाबी", scorpio: "मैरून",
    sagittarius: "बैंगनी", capricorn: "काला", aquarius: "इलेक्ट्रिक नीला", pisces: "समुद्री हरा",
  } : {
    aries: "Red", taurus: "Green", gemini: "Yellow", cancer: "Silver",
    leo: "Gold", virgo: "Navy Blue", libra: "Pink", scorpio: "Maroon",
    sagittarius: "Purple", capricorn: "Black", aquarius: "Electric Blue", pisces: "Sea Green",
  };

  const luckyNumbers: Record<string, number> = {
    aries: 9, taurus: 6, gemini: 5, cancer: 2,
    leo: 1, virgo: 5, libra: 6, scorpio: 9,
    sagittarius: 3, capricorn: 8, aquarius: 4, pisces: 7,
  };

  const luckyTimes: Record<string, { en: string; hi: string }> = isHi ? {
    aries: { en: "6:00 AM - 8:00 AM", hi: "6:00 AM - 8:00 AM" }, taurus: { en: "2:00 PM - 4:00 PM", hi: "2:00 PM - 4:00 PM" }, gemini: { en: "10:00 AM - 12:00 PM", hi: "10:00 AM - 12:00 PM" }, cancer: { en: "8:00 PM - 10:00 PM", hi: "8:00 PM - 10:00 PM" },
    leo: { en: "12:00 PM - 2:00 PM", hi: "12:00 PM - 2:00 PM" }, virgo: { en: "5:00 AM - 7:00 AM", hi: "5:00 AM - 7:00 AM" }, libra: { en: "4:00 PM - 6:00 PM", hi: "4:00 PM - 6:00 PM" }, scorpio: { en: "11:00 PM - 1:00 AM", hi: "11:00 PM - 1:00 AM" },
    sagittarius: { en: "3:00 PM - 5:00 PM", hi: "3:00 PM - 5:00 PM" }, capricorn: { en: "7:00 AM - 9:00 AM", hi: "7:00 AM - 9:00 AM" }, aquarius: { en: "1:00 AM - 3:00 AM", hi: "1:00 AM - 3:00 AM" }, pisces: { en: "9:00 PM - 11:00 PM", hi: "9:00 PM - 11:00 PM" },
  } : {
    aries: { en: "6:00 AM - 8:00 AM", hi: "6:00 AM - 8:00 AM" }, taurus: { en: "2:00 PM - 4:00 PM", hi: "2:00 PM - 4:00 PM" }, gemini: { en: "10:00 AM - 12:00 PM", hi: "10:00 AM - 12:00 PM" }, cancer: { en: "8:00 PM - 10:00 PM", hi: "8:00 PM - 10:00 PM" },
    leo: { en: "12:00 PM - 2:00 PM", hi: "12:00 PM - 2:00 PM" }, virgo: { en: "5:00 AM - 7:00 AM", hi: "5:00 AM - 7:00 AM" }, libra: { en: "4:00 PM - 6:00 PM", hi: "4:00 PM - 6:00 PM" }, scorpio: { en: "11:00 PM - 1:00 AM", hi: "11:00 PM - 1:00 AM" },
    sagittarius: { en: "3:00 PM - 5:00 PM", hi: "3:00 PM - 5:00 PM" }, capricorn: { en: "7:00 AM - 9:00 AM", hi: "7:00 AM - 9:00 AM" }, aquarius: { en: "1:00 AM - 3:00 AM", hi: "1:00 AM - 3:00 AM" }, pisces: { en: "9:00 PM - 11:00 PM", hi: "9:00 PM - 11:00 PM" },
  };

  return {
    sign,
    period: period as HoroscopeResponse["period"],
    date: getDateForPeriod(period),
    prediction: predictions[period],
    lucky: {
      color: luckyColors[sign] || (isHi ? "सुनहरा" : "Gold"),
      number: luckyNumbers[sign] || 7,
       time: luckyTimes[sign]?.[isHi ? "hi" : "en"] || "12:00 PM - 2:00 PM",
    },
    scores: scores[period as keyof typeof scores],
    insights: insights[period as keyof typeof insights],
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sign = searchParams.get("sign")?.toLowerCase() || "aries";
    const period = searchParams.get("period")?.toLowerCase() || "today";
    const lang = searchParams.get("lang")?.toLowerCase() || "en";

    if (!SIGN_NAMES[sign]) {
      return NextResponse.json({ error: "Invalid zodiac sign" }, { status: 400 });
    }

    if (!["yesterday", "today", "tomorrow"].includes(period)) {
      return NextResponse.json({ error: "Invalid period" }, { status: 400 });
    }

    if (DEV_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return NextResponse.json(buildMockHoroscope(sign, period, lang));
    }

    // Production: call LLM API for structured JSON
    const isHi = lang === "hi";
    const localizedSignName = isHi ? (SIGN_NAMES_HI[sign] || "मेष") : (SIGN_NAMES[sign] || "Aries");
    const localizedPeriodLabel = isHi ? (PERIOD_LABELS_HI[period] || "आज") : (PERIOD_LABELS[period] || "Today");
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
            content: `You are an expert Vedic astrologer. Generate a daily horoscope for ${localizedSignName} for ${localizedPeriodLabel}. 
            Respond with STRICT JSON only in this exact format:
            {
              "sign": "${sign}",
              "period": "${period}",
              "date": "${getDateForPeriod(period)}",
              "prediction": "2-3 sentence prediction",
              "lucky": { "color": "color name", "number": 7, "time": "time range" },
              "scores": { "career": 1-5, "love": 1-5, "money": 1-5, "health": 1-5 },
              "insights": { "career": "one sentence", "love": "one sentence", "money": "one sentence", "health": "one sentence" }
            }`,
          },
          {
            role: "user",
            content: `Provide the daily horoscope for ${localizedSignName} for ${localizedPeriodLabel}.`,
          },
],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    // Parse JSON from LLM response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }
    return NextResponse.json(buildMockHoroscope(sign, period, lang));
  } catch {
    return NextResponse.json({ error: "Failed to generate horoscope" }, { status: 500 });
  }
}