// ─── Types ────────────────────────────────────────────────────────────────

export interface PersonDetails {
  name: string;
  rashi: number; // 1-12 (Moon sign)
  nakshatra: number; // 1-27
  pada: number; // 1-4
}

export interface KootaResult {
  id: number;
  name: string;
  points: number;
  maxPoints: number;
  description: string;
  status: "excellent" | "good" | "average" | "poor";
}

export interface DoshaResult {
  name: string;
  present: boolean;
  severity: "none" | "mild" | "moderate" | "severe";
  description: string;
  remedy: string;
}

export interface MatchResult {
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  verdict: string;
  kootas: KootaResult[];
  doshas: DoshaResult[];
  compatibilitySummary: string;
}

// ─── Static Vedic Data ────────────────────────────────────────────────────

export const RASHI_NAMES = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
  "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)",
  "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)",
];

export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

// Nakshatra lords (planet index: 0=Sun, 1=Moon, 2=Mars, 3=Mercury, 4=Jupiter, 5=Venus, 6=Saturn)
const NAKSHATRA_LORDS = [
  2, 5, 0, 1, 2, 6, 4, 6, 3, 2, 5, 0, 1, 2, 6, 4, 6, 3, 2, 5, 0, 1, 2, 6, 4, 6, 3,
];

// Gana: 0=Deva, 1=Manushya, 2=Rakshasa
const GANA = [
  0, 2, 2, 0, 0, 2, 0, 0, 2, 2, 2, 0, 0, 2, 0, 2, 0, 2, 2, 0, 0, 0, 2, 2, 0, 0, 0,
];

// Nadi: 0=Adi (Vata), 1=Madhya (Pitta), 2=Antya (Kapha)
const NADI = [
  0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2,
];

// Yoni animals: 0=Horse, 1=Elephant, 2=Sheep, 3=Serpent, 4=Dog, 5=Cat, 6=Rat, 7=Cow
const YONI = [
  0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2,
];

// Yoni friendship matrix (friendly yoni indices)
const YONI_FRIENDS: Record<number, number[]> = {
  0: [0, 3, 4],
  1: [1, 5, 6],
  2: [2, 7, 0],
  3: [3, 0, 4],
  4: [4, 0, 3],
  5: [5, 1, 6],
  6: [6, 1, 5],
  7: [7, 2, 0],
};

// Rashi lords (planet index)
const RASHI_LORDS = [2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4];

// Vashya groups: 0=Chatushpada, 1=Manav, 2=Jalchar, 3=Vanchar
const VASHYA_GROUP = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];

// ─── Helper Functions ─────────────────────────────────────────────────────

function normalize(value: number): number {
  return ((value - 1) % 27 + 27) % 27;
}

function getStatus(points: number, maxPoints: number): KootaResult["status"] {
  const ratio = points / maxPoints;
  if (ratio >= 0.9) return "excellent";
  if (ratio >= 0.6) return "good";
  if (ratio >= 0.3) return "average";
  return "poor";
}

// ─── Koota Calculations ───────────────────────────────────────────────────

function calculateVarna(male: PersonDetails, female: PersonDetails): number {
  // Varna based on Moon sign: 0=Brahmin, 1=Kshatriya, 2=Vaishya, 3=Shudra
  const maleVarna = Math.floor((male.rashi - 1) / 3);
  const femaleVarna = Math.floor((female.rashi - 1) / 3);
  // Male should be higher or equal varna
  return femaleVarna <= maleVarna ? 1 : 0;
}

function calculateVashya(male: PersonDetails, female: PersonDetails): number {
  const maleGroup = VASHYA_GROUP[male.rashi - 1];
  const femaleGroup = VASHYA_GROUP[female.rashi - 1];
  return maleGroup === femaleGroup ? 2 : 0;
}

function calculateTara(male: PersonDetails, female: PersonDetails): number {
  const diff = normalize(female.nakshatra - male.nakshatra);
  // Favorable tara positions: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26
  return diff % 2 === 0 ? 3 : 0;
}

function calculateYoni(male: PersonDetails, female: PersonDetails): number {
  const maleYoni = YONI[male.nakshatra - 1];
  const femaleYoni = YONI[female.nakshatra - 1];
  if (maleYoni === femaleYoni) return 4;
  return YONI_FRIENDS[maleYoni]?.includes(femaleYoni) ? 4 : 0;
}

function calculateGrahaMaitri(male: PersonDetails, female: PersonDetails): number {
  const maleLord = RASHI_LORDS[male.rashi - 1];
  const femaleLord = RASHI_LORDS[female.rashi - 1];
  if (maleLord === femaleLord) return 5;

  // Planetary friendship pairs
  const friends: Record<number, number[]> = {
    0: [1, 2, 4], // Sun friends: Moon, Mars, Jupiter
    1: [0, 3], // Moon friends: Sun, Mercury
    2: [0, 4, 5], // Mars friends: Sun, Jupiter, Venus
    3: [1, 5], // Mercury friends: Moon, Venus
    4: [0, 2, 6], // Jupiter friends: Sun, Mars, Saturn
    5: [2, 3, 6], // Venus friends: Mars, Mercury, Saturn
    6: [3, 4, 5], // Saturn friends: Mercury, Jupiter, Venus
  };

  return friends[maleLord]?.includes(femaleLord) ? 5 : 0;
}

function calculateGana(male: PersonDetails, female: PersonDetails): number {
  const maleGana = GANA[male.nakshatra - 1];
  const femaleGana = GANA[female.nakshatra - 1];
  if (maleGana === femaleGana) return 6;
  // Deva (0) with Manushya (1) is good
  if (maleGana === 0 && femaleGana === 1) return 6;
  // Manushya (1) with Deva (0) is poor
  if (maleGana === 1 && femaleGana === 0) return 0;
  // Other combinations get partial points
  return 3;
}

function calculateBhakoot(male: PersonDetails, female: PersonDetails): number {
  const diff = Math.abs(male.rashi - female.rashi);
  // Bad bhakoot rashi differences: 2, 4, 6, 8, 9 (from 1-12)
  const badDiffs = [2, 4, 6, 8, 9];
  return badDiffs.includes(diff) ? 0 : 7;
}

function calculateNadi(male: PersonDetails, female: PersonDetails): number {
  const maleNadi = NADI[male.nakshatra - 1];
  const femaleNadi = NADI[female.nakshatra - 1];
  return maleNadi !== femaleNadi ? 8 : 0;
}

// ─── Main Calculation Engine ──────────────────────────────────────────────

export function calculateAshtakoot(male: PersonDetails, female: PersonDetails): MatchResult {
  const kootas: KootaResult[] = [
    {
      id: 1,
      name: "Varna",
      points: calculateVarna(male, female),
      maxPoints: 1,
      description: "Spiritual compatibility based on the varna (caste) of the Moon signs.",
      status: getStatus(calculateVarna(male, female), 1),
    },
    {
      id: 2,
      name: "Vashya",
      points: calculateVashya(male, female),
      maxPoints: 2,
      description: "Power dynamics and mutual control in the relationship.",
      status: getStatus(calculateVashya(male, female), 2),
    },
    {
      id: 3,
      name: "Tara",
      points: calculateTara(male, female),
      maxPoints: 3,
      description: "Destiny and fortune alignment based on nakshatra positions.",
      status: getStatus(calculateTara(male, female), 3),
    },
    {
      id: 4,
      name: "Yoni",
      points: calculateYoni(male, female),
      maxPoints: 4,
      description: "Physical and sexual compatibility based on animal instincts.",
      status: getStatus(calculateYoni(male, female), 4),
    },
    {
      id: 5,
      name: "Graha Maitri",
      points: calculateGrahaMaitri(male, female),
      maxPoints: 5,
      description: "Mental and emotional friendship between the ruling planets.",
      status: getStatus(calculateGrahaMaitri(male, female), 5),
    },
    {
      id: 6,
      name: "Gana",
      points: calculateGana(male, female),
      maxPoints: 6,
      description: "Temperament compatibility based on divine, human, or demonic nature.",
      status: getStatus(calculateGana(male, female), 6),
    },
    {
      id: 7,
      name: "Bhakoot",
      points: calculateBhakoot(male, female),
      maxPoints: 7,
      description: "Health, prosperity, and longevity compatibility between Moon signs.",
      status: getStatus(calculateBhakoot(male, female), 7),
    },
    {
      id: 8,
      name: "Nadi",
      points: calculateNadi(male, female),
      maxPoints: 8,
      description: "Physiological and genetic compatibility based on nadi (dosha).",
      status: getStatus(calculateNadi(male, female), 8),
    },
  ];

  const totalPoints = kootas.reduce((sum, k) => sum + k.points, 0);
  const percentage = Math.round((totalPoints / 36) * 100);

  // Dosha detection
  const doshas: DoshaResult[] = [];

  const nadiKoota = kootas[7];
  if (nadiKoota.points === 0) {
    doshas.push({
      name: "Nadi Dosha",
      present: true,
      severity: "severe",
      description: "Same nadi in both partners indicates genetic incompatibility.",
      remedy: "Perform Nadi Nivarana Puja or consult an experienced astrologer for specific remedies.",
    });
  }

  const bhakootKoota = kootas[6];
  if (bhakootKoota.points === 0) {
    doshas.push({
      name: "Bhakoot Dosha",
      present: true,
      severity: "moderate",
      description: "Unfavorable Moon sign distance affecting health and prosperity.",
      remedy: "Perform Bhakoot Nivarana Puja and strengthen Jupiter through worship.",
    });
  }

  if (doshas.length === 0) {
    doshas.push({
      name: "No Major Dosha",
      present: false,
      severity: "none",
      description: "No significant doshas detected in this match.",
      remedy: "No specific remedy required. Maintain mutual respect and understanding.",
    });
  }

  // Verdict
  let verdict: string;
  if (totalPoints >= 28) {
    verdict = "Excellent Match";
  } else if (totalPoints >= 22) {
    verdict = "Good Match";
  } else if (totalPoints >= 16) {
    verdict = "Average Match";
  } else {
    verdict = "Challenging Match";
  }

  const compatibilitySummary = `This match scores ${totalPoints} out of 36 gunas (${percentage}%). ${verdict}. ${
    doshas.some((d) => d.present)
      ? "Some doshas are present, but with proper remedies and understanding, a harmonious relationship is achievable."
      : "No major doshas are present, indicating strong compatibility potential."
  }`;

  return {
    totalPoints,
    maxPoints: 36,
    percentage,
    verdict,
    kootas,
    doshas,
    compatibilitySummary,
  };
}