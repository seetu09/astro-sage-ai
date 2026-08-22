export const siteConfig = {
  name: "AstroVeda",
  url: "https://astro-sage-ai.vercel.app",
  ogImage: "/og-image.jpg",
  description: "AI-powered Vedic astrology platform for Kundli generation, horoscope predictions, and Kundali matching.",
};

export type PageSEO = {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
};

export const pageSEO: Record<string, PageSEO> = {
  "/": {
    title: "AstroVeda - AI-Powered Vedic Astrology & Kundli Generator",
    description: "Generate your free Vedic Kundli, get daily horoscope predictions, Kundali matching for marriage, and AI-powered astrology guidance. Available in Hindi & English.",
    keywords: ["kundli generator", "free kundali", "vedic astrology", "daily horoscope", "birth chart", "astroveda"],
  },
  "/daily-horoscope": {
    title: "Daily Horoscope - Today's Rashifal Prediction",
    description: "Read your free daily horoscope (Rashifal) for all 12 zodiac signs. Accurate Vedic astrology predictions for love, career, health & finance.",
    keywords: ["daily horoscope", "rashifal", "today horoscope", "zodiac predictions", "daily astrology"],
  },
  "/kundali": {
    title: "Free Kundli Generator - Vedic Birth Chart Online",
    description: "Generate your free Kundli (Janam Kundali) online. Get detailed Vedic birth chart with planetary positions, dasha periods, yogas, doshas & remedies.",
    keywords: ["kundli generator", "free kundali", "janam kundali", "birth chart", "vedic kundli", "kundali making"],
  },
  "/matchmaking": {
    title: "Kundali Matching - Gun Milan for Marriage Compatibility",
    description: "Free Kundali matching (Gun Milan) for marriage. Check compatibility with Ashtakoot Guna matching, Mangal Dosha analysis & relationship insights.",
    keywords: ["kundali matching", "gun milan", "marriage compatibility", "kundli milan", "mangal dosha check"],
  },
  "/love-meter": {
    title: "Cosmic Love Meter - Relationship Compatibility & Synergy",
    description: "Measure your love compatibility with our free Cosmic Love Meter. Get your emotional harmony, communication synergy, and romantic spark score instantly.",
    keywords: ["love meter", "love compatibility", "relationship compatibility", "zodiac love match", "couple compatibility"],
  },
  "/chat": {
    title: "AI Astrology Chat - Ask Guru Your Questions",
    description: "Chat with our AI Astrology Guru. Ask questions about your career, love life, health, and get personalized Vedic astrology guidance instantly.",
    keywords: ["AI astrology chat", "astrology guru", "ask astrologer", "online astrology consultation"],
  },
  "/blog": {
    title: "Astrology Blog - Vedic Astrology Articles & Guides",
    description: "Read expert articles on Vedic astrology, planetary transits, remedies, gemstones, and spiritual guidance. Learn astrology with AstroVeda.",
    keywords: ["astrology blog", "vedic astrology articles", "planetary transit", "astrology guide"],
  },
  "/store": {
    title: "Astrology Store - Gemstones, Yantras & Remedies",
    description: "Shop authentic gemstones, yantras, rudraksha, and Vedic astrology remedies. Certified products for planetary dosha relief.",
    keywords: ["gemstones", "yantra", "rudraksha", "astrology products", "vedic remedies"],
  },
  "/about": {
    title: "About AstroVeda - AI Vedic Astrology Platform",
    description: "Learn about AstroVeda's mission to make Vedic astrology accessible through AI technology. Accurate predictions, trusted by thousands.",
    keywords: ["about astroveda", "vedic astrology platform", "AI astrology"],
  },
  "/contact": {
    title: "Contact AstroVeda - Get in Touch",
    description: "Contact AstroVeda for astrology consultations, support, or partnership inquiries. We're here to help with your spiritual journey.",
    keywords: ["contact astroveda", "astrology support", "astrology consultation"],
  },
  "/social": {
    title: "AstroVeda Community - Connect with Astrology Enthusiasts",
    description: "Join the AstroVeda community. Share experiences, ask questions, and connect with fellow astrology enthusiasts.",
    keywords: ["astrology community", "astroveda social", "astrology forum"],
  },
};
