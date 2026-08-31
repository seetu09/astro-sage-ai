// ─── Types ────────────────────────────────────────────────────────────────

export type LocaleCode = 'en' | 'hi';

export interface BirthDetails {
  name: string;
  moonSign: number; // 1-12
  marsSign: number; // 1-12 (Mars placement)
  ascendantSign: number; // 1-12 (Lagna)
}

export type ManglikSeverity = "none" | "mild" | "moderate" | "severe";
export type SadeSatiPhase = "inactive" | "rising" | "peak" | "setting";

export interface ManglikResult {
  isManglik: boolean;
  severity: ManglikSeverity;
  affectedHouses: number[];
  cancellations: string[];
  description: string;
  remedies: string[];
}

export interface SadeSatiResult {
  phase: SadeSatiPhase;
  isActive: boolean;
  description: string;
  remedies: string[];
  timeline: {
    phase: SadeSatiPhase;
    label: string;
    active: boolean;
    description: string;
  }[];
}

export interface DoshaCheckResult {
  manglik: ManglikResult;
  sadeSati: SadeSatiResult;
  overall: {
    hasDosha: boolean;
    severity: ManglikSeverity;
    summary: string;
  };
}

// ─── Static Vedic Data ────────────────────────────────────────────────────

export const RASHI_NAMES = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
  "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)",
  "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)",
];

// Mars exaltation sign: 10 (Makara/Capricorn)
const MARS_EXALTED_SIGN = 10;
// Mars own signs: 1 (Mesha/Aries) and 8 (Vrishchika/Scorpio)
const MARS_OWN_SIGNS = [1, 8];

// Houses where Mars causes Manglik Dosha
const MANGLIK_HOUSES = [1, 4, 7, 8, 12];

// Saturn transit signs (current approximate position for 2026)
// Saturn is in Pisces (12) in 2026
const CURRENT_SATURN_SIGN = 12;

// ─── Bilingual Dosha Text ───────────────────────────────────────────────────

const MANGAL_CANCELLATIONS_EN = [
  "Mars is in its own sign (Aries/Scorpio), which cancels the Manglik Dosha.",
  "Mars is exalted in Capricorn, which significantly reduces the Manglik Dosha.",
];

const MANGAL_CANCELLATIONS_HI = [
  "मंगल अपने स्वयं के राशि (मेष/वृश्चिक) में है, जो मांगलिक दोष को रद्द कर देता है।",
  "मंगल कर्कों (मकर) में ऊचे गुण में है, जो मांगलिक दोष को काफी हद तक कम कर देता है।",
];

const MANGAL_DESCRIPTION_EN = (marsHouse: number) =>
  `Mars is placed in house ${marsHouse}, which is a Manglik house. This indicates the presence of Mangal Dosha.`;

const MANGAL_DESCRIPTION_CANCELLED_EN = (marsHouse: number, reason: string) =>
  `Mars is in house ${marsHouse}, but the dosha is cancelled because ${reason}`;

const MANGAL_DESCRIPTION_ABSENT_EN = (marsHouse: number) =>
  `Mars is placed in house ${marsHouse}, which is not a Manglik house. No Mangal Dosha is present.`;

const MANGAL_DESCRIPTION_HI = (marsHouse: number) =>
  `मंगल भाव ${marsHouse} में स्थित है, जो एक मांगलिक भाव है। इसका अर्थ मंगल दोष की उपस्थिति है।`;

const MANGAL_DESCRIPTION_CANCELLED_HI = (marsHouse: number, reason: string) =>
  `मंगल भाव ${marsHouse} में है, लेकिन दोष ${reason} के कारण रद्द कर दिया गया है`;

const MANGAL_DESCRIPTION_ABSENT_HI = (marsHouse: number) =>
  `मंगल भाव ${marsHouse} में स्थित है, जो एक मांगलिक भाव नहीं है। कोई मंगल दोष नहीं है।`;

const MANGAL_REMEDIES_PRESENT_EN = [
  "Perform Hanuman Chalisa recitation every Tuesday for 43 days.",
  "Worship Lord Hanuman and offer sindoor (vermilion) at the temple.",
  "Consider Kumbh Vivah (symbolic marriage to a pot) before actual marriage.",
  "Donate wheat, jaggery, and red cloth on Tuesdays.",
  "Wear a red coral (Moonga) ring after consulting an astrologer.",
];

const MANGAL_REMEDIES_PRESENT_HI = [
  "प्रत्येक मंगलवार के दिन हनुमान चालीसा का पाठ 43 दिनों तक जपें।",
  "भगवान हनुमान की पूजा करें और मंदिर में सिंदूर (राजतमक) चढ़ाएं।",
  "वास्तविक विवाह से पहले कुंभ विवाह (एक बर्तन से प्रतीकात्मक विवाह) पर विचार करें।",
  "मंगलवार को गेहूँ, गुड़ और लाल कपड़ा दान करें।",
  "एक ज्योतिषी से परामर्श करने के बाद रेड कॉरल (मूंगा) की अंगूठी पहनें।",
];

const MANGAL_REMEDIES_ABSENT_EN = [
  "No specific Manglik remedies are required. Continue your regular spiritual practices.",
];

const MANGAL_REMEDIES_ABSENT_HI = [
  "कोई विशेष मांगलिक उपाय आवश्यक नहीं है। अपनी नियमित आध्यात्मिक practice जारी रखें।",
];

const SADE_SATI_PHASE_EN: Record<SadeSatiPhase, string> = {
  inactive: "Saturn is not currently transiting the 12th, 1st, or 2nd house from your Moon sign. You are not under Sade Sati.",
  rising: "Saturn is entering the 12th house from your Moon sign. This is the beginning phase of Sade Sati, bringing subtle changes and preparation.",
  peak: "Saturn is transiting your Moon sign (1st house). This is the most intense phase of Sade Sati, bringing significant life lessons and transformation.",
  setting: "Saturn is moving into the 2nd house from your Moon sign. This is the final phase of Sade Sati, where challenges begin to ease.",
};

const SADE_SATI_PHASE_HI: Record<SadeSatiPhase, string> = {
  inactive: "शनि आपके चंद्र राशि से 12वीं, 1वीं या 2वीं भाव में संक्रमण नहीं कर रहा है। आप सड़े सती के अधीन नहीं हैं।",
  rising: "शनि आपके चंद्र राशि से 12वीं भाव की ओर प्रवेश कर रहा है। यह सड़े सती की शुरुआती अवस्था है, जो सूक्ष्म परिवर्तन और तैयारी लाती है।",
  peak: "शनि आपके चंद्र राशि (1वीं भाव) में संक्रमण कर रहा है। यह सड़े सती की सबसे तीव्र अवस्था है, जो महत्वपूर्ण जीवन पाठ और परिवर्तन लाती है।",
  setting: "शनि आपके चंद्र राशि से 2वीं भाव की ओर सरक रहा है। यह सड़े सती की अंतिम अवस्था है, जहाँ चुनौतियाँ आसान होने लगती हैं।",
};

const SADE_SATI_REMEDIES_EN: Record<SadeSatiPhase, string[]> = {
  inactive: [
    "No Sade Sati remedies are currently required. Maintain your regular spiritual practices.",
  ],
  rising: [
    "Begin reciting Shani Chalisa daily, especially on Saturdays.",
    "Offer mustard oil to Lord Shani at a temple every Saturday.",
    "Practice patience and avoid impulsive decisions.",
    "Wear dark blue or black clothing on Saturdays.",
  ],
  peak: [
    "Recite the Shani Mantra 'Om Sham Shanicharaya Namah' 108 times daily.",
    "Donate black sesame seeds, iron, and black cloth on Saturdays.",
    "Serve the elderly and underprivileged as an act of karma yoga.",
    "Fast on Saturdays (eat only one simple meal).",
    "Worship Lord Hanuman for protection from Saturn's effects.",
  ],
  setting: [
    "Continue Shani Chalisa recitation until Sade Sati fully ends.",
    "Gradually increase charitable activities and community service.",
    "Maintain discipline in daily routines and financial matters.",
    "Express gratitude for the lessons learned during this period.",
  ],
};

const SADE_SATI_REMEDIES_HI: Record<SadeSatiPhase, string[]> = {
  inactive: [
    "इस समय कोई सड़े सती उपाय आवश्यक नहीं है। अपनी नियमित आध्यात्मिक practice जारी रखें।",
  ],
  rising: [
    "हर दिन शनि चालीसा का पाठ शुरू करें, विशेषकर शनिवार को।",
    "हर शनिवार मंदिर में भगवान शनि को सरसों के तेल चढ़ाएं।",
    "धैर्य रखें और आवेगपूर्ण निर्णयों से बचें।",
    "शनिवार को गहरे नीले या काले वस्त्र पहनें।",
  ],
  peak: [
    "शनि मंत्र 'ओम शां शनिचराय नमः' का 108 बार दैनिक जप करें।",
    "शनिवार को काली तिल, लोहा और काला कपड़ा दान करें।",
    "कर्म योग के रूप में बूढ़े और सीमान्तक्षीण लोगों की सेवा करें।",
    "शनिवार के उपवास रखें (केवल एक साधारण भोजन खाएं)।",
    "शनि के प्रभाव से बचाव के लिए भगवान हनुमान की पूजा करें।",
  ],
  setting: [
    "जब तक सड़े सती पूरी तरह से समाप्त न हो जाए, शनि चालीसा का जप जारी रखें।",
    "धीरे-धीरे दान-दाता गतिविधियों और सामुदायिक सेवा बढ़ाएं।",
    "दैनिक रूटीन और वितीय मामिलों में अनुशासन बनाए रखें।",
    "इस अवधि में सीखे गए पाठों के लिए कृतज्ञता व्यक्त करें।",
  ],
};

const TIMELINE_LABELS_EN: Record<SadeSatiPhase, string> = {
  rising: "Rising Phase",
  peak: "Peak Phase",
  setting: "Setting Phase",
  inactive: "Inactive Phase",
};

const TIMELINE_LABELS_HI: Record<SadeSatiPhase, string> = {
  rising: "उदय चरण",
  peak: "चरम चरण",
  setting: "अस्त चरण",
  inactive: "निष्क्रिय चरण",
};

const TIMELINE_DESC_EN: Record<SadeSatiPhase, string> = {
  rising: "Saturn in 12th house from Moon - preparation and subtle changes",
  peak: "Saturn in 1st house from Moon - intense lessons and transformation",
  setting: "Saturn in 2nd house from Moon - easing of challenges",
  inactive: "Saturn not in 12th/1st/2nd from Moon - no active Sade Sati",
};

const TIMELINE_DESC_HI: Record<SadeSatiPhase, string> = {
  rising: "चंद्र से 12वीं भाव में शनि - तैयारी और सूक्ष्म परिवर्तन",
  peak: "चंद्र से 1वीं भाव में शनि - तीव्र पाठ और परिवर्तन",
  setting: "चंद्र से 2वीं भाव में शनि - चुनौतियों का उपशम",
  inactive: "चंद्र से 12वीं/1वीं/2वीं में शनि नहीं - कोई सक्रिय सड़े सती नहीं",
};

// ─── Manglik Calculation ──────────────────────────────────────────────────

export function calculateManglik(details: BirthDetails, locale: LocaleCode = 'en'): ManglikResult {
  // Calculate Mars house from ascendant
  const marsHouse = ((details.marsSign - details.ascendantSign + 12) % 12) + 1;

  const affectedHouses = MANGLIK_HOUSES.filter((house) => house === marsHouse);
  const cancellations: string[] = [];

  // Cancellation: Mars in own sign (Aries or Scorpio)
  if (MARS_OWN_SIGNS.includes(details.marsSign)) {
    cancellations.push(
      locale === 'hi' ? MANGAL_CANCELLATIONS_HI[0] : MANGAL_CANCELLATIONS_EN[0]
    );
  }

  // Cancellation: Mars exalted (Capricorn)
  if (details.marsSign === MARS_EXALTED_SIGN) {
    cancellations.push(
      locale === 'hi' ? MANGAL_CANCELLATIONS_HI[1] : MANGAL_CANCELLATIONS_EN[1]
    );
  }

  const isManglik = affectedHouses.length > 0 && cancellations.length === 0;

  let severity: ManglikSeverity = "none";
  if (isManglik) {
    if (affectedHouses.includes(1) || affectedHouses.includes(4)) {
      severity = "severe";
    } else if (affectedHouses.includes(7) || affectedHouses.includes(8)) {
      severity = "moderate";
    } else {
      severity = "mild";
    }
  } else if (affectedHouses.length > 0 && cancellations.length > 0) {
    severity = "mild";
  }

  const description = isManglik
    ? (locale === 'hi' ? MANGAL_DESCRIPTION_HI(marsHouse) : MANGAL_DESCRIPTION_EN(marsHouse))
    : affectedHouses.length > 0 && cancellations.length > 0
    ? (locale === 'hi'
        ? MANGAL_DESCRIPTION_CANCELLED_HI(marsHouse, cancellations[0].toLowerCase())
        : MANGAL_DESCRIPTION_CANCELLED_EN(marsHouse, cancellations[0].toLowerCase()))
    : (locale === 'hi' ? MANGAL_DESCRIPTION_ABSENT_HI(marsHouse) : MANGAL_DESCRIPTION_ABSENT_EN(marsHouse));

  const remedies = isManglik
    ? (locale === 'hi' ? MANGAL_REMEDIES_PRESENT_HI : MANGAL_REMEDIES_PRESENT_EN)
    : (locale === 'hi' ? MANGAL_REMEDIES_ABSENT_HI : MANGAL_REMEDIES_ABSENT_EN);

  return {
    isManglik,
    severity,
    affectedHouses,
    cancellations,
    description,
    remedies,
  };
}

// ─── Sade Sati Calculation ────────────────────────────────────────────────

export function calculateSadeSati(details: BirthDetails, locale: LocaleCode = 'en'): SadeSatiResult {
  // Sade Sati occurs when Saturn transits the 12th, 1st, or 2nd sign from the Moon sign
  const moonSign = details.moonSign;

  // Calculate distance from Saturn to Moon sign (1-12)
  const distance = ((CURRENT_SATURN_SIGN - moonSign + 12) % 12) + 1;

  let phase: SadeSatiPhase = "inactive";
  if (distance === 12) phase = "rising";
  else if (distance === 1) phase = "peak";
  else if (distance === 2) phase = "setting";

  const isActive = phase !== "inactive";

  const phaseDescriptions = locale === 'hi' ? SADE_SATI_PHASE_HI : SADE_SATI_PHASE_EN;
  const phaseRemedies = locale === 'hi' ? SADE_SATI_REMEDIES_HI : SADE_SATI_REMEDIES_EN;

  const timeline: SadeSatiResult["timeline"] = [
    {
      phase: "rising",
      label: locale === 'hi' ? TIMELINE_LABELS_HI.rising : TIMELINE_LABELS_EN.rising,
      active: phase === "rising",
      description: locale === 'hi' ? TIMELINE_DESC_HI.rising : TIMELINE_DESC_EN.rising,
    },
    {
      phase: "peak",
      label: locale === 'hi' ? TIMELINE_LABELS_HI.peak : TIMELINE_LABELS_EN.peak,
      active: phase === "peak",
      description: locale === 'hi' ? TIMELINE_DESC_HI.peak : TIMELINE_DESC_EN.peak,
    },
    {
      phase: "setting",
      label: locale === 'hi' ? TIMELINE_LABELS_HI.setting : TIMELINE_LABELS_EN.setting,
      active: phase === "setting",
      description: locale === 'hi' ? TIMELINE_DESC_HI.setting : TIMELINE_DESC_EN.setting,
    },
  ];

  return {
    phase,
    isActive,
    description: phaseDescriptions[phase],
    remedies: phaseRemedies[phase],
    timeline,
  };
}

// ─── Main Check Function ──────────────────────────────────────────────────

export function checkDoshas(details: BirthDetails, locale: LocaleCode = 'en'): DoshaCheckResult {
  const manglik = calculateManglik(details, locale);
  const sadeSati = calculateSadeSati(details, locale);

  const hasDosha = manglik.isManglik || sadeSati.isActive;

  let severity: ManglikSeverity = "none";
  if (manglik.isManglik && sadeSati.isActive) {
    severity = manglik.severity === "severe" ? "severe" : "moderate";
  } else if (manglik.isManglik) {
    severity = manglik.severity;
  } else if (sadeSati.isActive) {
    severity = sadeSati.phase === "peak" ? "moderate" : "mild";
  }

  const summary = hasDosha
    ? locale === 'hi'
      ? `आपकी कुंडली में ${manglik.isManglik ? "मंगल दोष" : ""}${manglik.isManglik && sadeSati.isActive ? " और " : ""}${sadeSati.isActive ? "सक्रिय सड़े सती" : ""}. सही उपायों और आध्यात्मिक practice के साथ, इन ग्रहों के प्रभावों को समन्वय किया जा सकता है।`
      : `Your chart shows ${manglik.isManglik ? "Mangal Dosha" : ""}${manglik.isManglik && sadeSati.isActive ? " and " : ""}${sadeSati.isActive ? "active Sade Sati" : ""}. With the right remedies and spiritual practices, these planetary influences can be harmonized.`
    : locale === 'hi'
      ? "आपकी कुंडली में कोई प्रमुख दोष नहीं है। आप वर्तमान में मंगल दोष और सड़े सती के प्रभाव से मुक्त हैं।"
      : "Your chart shows no major doshas. You are currently free from Mangal Dosha and Sade Sati influences.";

  return {
    manglik,
    sadeSati,
    overall: {
      hasDosha,
      severity,
      summary,
    },
  };
}
