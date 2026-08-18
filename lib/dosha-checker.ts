// ─── Types ────────────────────────────────────────────────────────────────

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

// ─── Manglik Calculation ──────────────────────────────────────────────────

export function calculateManglik(details: BirthDetails): ManglikResult {
  // Calculate Mars house from ascendant
  const marsHouse = ((details.marsSign - details.ascendantSign + 12) % 12) + 1;

  const affectedHouses = MANGLIK_HOUSES.filter((house) => house === marsHouse);
  const cancellations: string[] = [];

  // Cancellation: Mars in own sign (Aries or Scorpio)
  if (MARS_OWN_SIGNS.includes(details.marsSign)) {
    cancellations.push("Mars is in its own sign (Aries/Scorpio), which cancels the Manglik Dosha.");
  }

  // Cancellation: Mars exalted (Capricorn)
  if (details.marsSign === MARS_EXALTED_SIGN) {
    cancellations.push("Mars is exalted in Capricorn, which significantly reduces the Manglik Dosha.");
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
    ? `Mars is placed in house ${marsHouse}, which is a Manglik house. This indicates the presence of Mangal Dosha.`
    : affectedHouses.length > 0 && cancellations.length > 0
    ? `Mars is in house ${marsHouse}, but the dosha is cancelled because ${cancellations[0].toLowerCase()}`
    : `Mars is placed in house ${marsHouse}, which is not a Manglik house. No Mangal Dosha is present.`;

  const remedies = isManglik
    ? [
        "Perform Hanuman Chalisa recitation every Tuesday for 43 days.",
        "Worship Lord Hanuman and offer sindoor (vermilion) at the temple.",
        "Consider Kumbh Vivah (symbolic marriage to a pot) before actual marriage.",
        "Donate wheat, jaggery, and red cloth on Tuesdays.",
        "Wear a red coral (Moonga) ring after consulting an astrologer.",
      ]
    : [
        "No specific Manglik remedies are required. Continue your regular spiritual practices.",
      ];

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

export function calculateSadeSati(details: BirthDetails): SadeSatiResult {
  // Sade Sati occurs when Saturn transits the 12th, 1st, or 2nd sign from the Moon sign
  const moonSign = details.moonSign;

  // Calculate distance from Saturn to Moon sign (1-12)
  const distance = ((CURRENT_SATURN_SIGN - moonSign + 12) % 12) + 1;

  let phase: SadeSatiPhase = "inactive";
  if (distance === 12) phase = "rising";
  else if (distance === 1) phase = "peak";
  else if (distance === 2) phase = "setting";

  const isActive = phase !== "inactive";

  const phaseDescriptions: Record<SadeSatiPhase, string> = {
    inactive: "Saturn is not currently transiting the 12th, 1st, or 2nd house from your Moon sign. You are not under Sade Sati.",
    rising: "Saturn is entering the 12th house from your Moon sign. This is the beginning phase of Sade Sati, bringing subtle changes and preparation.",
    peak: "Saturn is transiting your Moon sign (1st house). This is the most intense phase of Sade Sati, bringing significant life lessons and transformation.",
    setting: "Saturn is moving into the 2nd house from your Moon sign. This is the final phase of Sade Sati, where challenges begin to ease.",
  };

  const phaseRemedies: Record<SadeSatiPhase, string[]> = {
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

  const timeline: SadeSatiResult["timeline"] = [
    {
      phase: "rising",
      label: "Rising Phase",
      active: phase === "rising",
      description: "Saturn in 12th house from Moon - preparation and subtle changes",
    },
    {
      phase: "peak",
      label: "Peak Phase",
      active: phase === "peak",
      description: "Saturn in 1st house from Moon - intense lessons and transformation",
    },
    {
      phase: "setting",
      label: "Setting Phase",
      active: phase === "setting",
      description: "Saturn in 2nd house from Moon - easing of challenges",
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

export function checkDoshas(details: BirthDetails): DoshaCheckResult {
  const manglik = calculateManglik(details);
  const sadeSati = calculateSadeSati(details);

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
    ? `Your chart shows ${manglik.isManglik ? "Mangal Dosha" : ""}${manglik.isManglik && sadeSati.isActive ? " and " : ""}${sadeSati.isActive ? "active Sade Sati" : ""}. With the right remedies and spiritual practices, these planetary influences can be harmonized.`
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