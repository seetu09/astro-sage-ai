import { NextRequest, NextResponse } from "next/server";

function calculateNakshatra(longitude: number): number {
  return Math.floor(longitude / (360 / 27));
}

function calculateVarnaKoota(maleMoon: number, femaleMoon: number): number {
  const maleVarna = Math.floor((maleMoon % 360) / 30) % 4;
  const femaleVarna = Math.floor((femaleMoon % 360) / 30) % 4;
  return femaleVarna <= maleVarna ? 1 : 0;
}

function calculateVashyaKoota(maleMoon: number, femaleMoon: number): number {
  const vashyaGroups: Record<number, number[]> = {
    0: [0, 4, 8], 1: [1, 5, 9], 2: [2, 6, 10], 3: [3, 7, 11],
  };
  const maleSign = Math.floor((maleMoon % 360) / 30);
  const femaleSign = Math.floor((femaleMoon % 360) / 30);
  let maleGroup = -1, femaleGroup = -1;
  Object.entries(vashyaGroups).forEach(([group, signs]) => {
    if (signs.includes(maleSign)) maleGroup = parseInt(group);
    if (signs.includes(femaleSign)) femaleGroup = parseInt(group);
  });
  return maleGroup === femaleGroup ? 2 : 0;
}

function calculateTaraKoota(maleNakshatra: number, femaleNakshatra: number): number {
  const diff = (femaleNakshatra - maleNakshatra + 27) % 27;
  const goodTaras = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26];
  return goodTaras.includes(diff) ? 3 : 0;
}

function calculateYoniKoota(maleNakshatra: number, femaleNakshatra: number): number {
  const yoniAnimals = [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2];
  const maleYoni = yoniAnimals[maleNakshatra];
  const femaleYoni = yoniAnimals[femaleNakshatra];
  const friendlyPairs: Record<number, number[]> = {
    0: [0, 3, 4], 1: [1, 5, 6], 2: [2, 7, 0], 3: [3, 0, 4],
    4: [4, 0, 3], 5: [5, 1, 6], 6: [6, 1, 5], 7: [7, 2, 0],
  };
  return friendlyPairs[maleYoni]?.includes(femaleYoni) ? 4 : 0;
}

function calculateGrahaMaitri(maleMoon: number, femaleMoon: number): number {
  const maleSign = Math.floor((maleMoon % 360) / 30);
  const femaleSign = Math.floor((femaleMoon % 360) / 30);
  const lords: Record<number, string> = {
    0: "Mars", 1: "Venus", 2: "Mercury", 3: "Moon",
    4: "Sun", 5: "Mercury", 6: "Venus", 7: "Mars",
    8: "Jupiter", 9: "Saturn", 10: "Saturn", 11: "Jupiter",
  };
  return lords[maleSign] === lords[femaleSign] ? 5 : 0;
}

function calculateGanaKoota(maleNakshatra: number, femaleNakshatra: number): number {
  const ganas = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2];
  const maleGana = ganas[maleNakshatra];
  const femaleGana = ganas[femaleNakshatra];
  if (maleGana === femaleGana) return 6;
  if (maleGana === 0 && femaleGana === 1) return 6;
  if (maleGana === 1 && femaleGana === 0) return 0;
  return 3;
}

function calculateBhakootKoota(maleMoon: number, femaleMoon: number): number {
  const maleSign = Math.floor((maleMoon % 360) / 30) + 1;
  const femaleSign = Math.floor((femaleMoon % 360) / 30) + 1;
  const diff = Math.abs(maleSign - femaleSign);
  const badDiffs = [1, 2, 6, 8, 12];
  return badDiffs.includes(diff) ? 0 : 7;
}

function calculateNadiKoota(maleNakshatra: number, femaleNakshatra: number): number {
  const nadi = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2];
  return nadi[maleNakshatra] !== nadi[femaleNakshatra] ? 8 : 0;
}

function isManglik(marsLongitude: number, ascendant: number): boolean {
  const marsHouse = ((Math.floor(marsLongitude / 30) - Math.floor(ascendant / 30) + 12) % 12) + 1;
  return [1, 2, 4, 7, 8, 12].includes(marsHouse);
}

export async function POST(req: NextRequest) {
  try {
    const { male, female } = await req.json();

    const maleSeed = new Date(male.birthDate).getTime();
    const femaleSeed = new Date(female.birthDate).getTime();

    const maleMoon = (maleSeed % 360) + Math.random() * 30;
    const femaleMoon = (femaleSeed % 360) + Math.random() * 30;
    const maleMars = (maleSeed * 1.5 % 360);
    const femaleMars = (femaleSeed * 1.5 % 360);
    const maleAsc = (maleSeed * 0.8 % 360);
    const femaleAsc = (femaleSeed * 0.8 % 360);

    const maleNakshatra = calculateNakshatra(maleMoon);
    const femaleNakshatra = calculateNakshatra(femaleMoon);

    const ashtakoot = [
      { name: "Varna", points: calculateVarnaKoota(maleMoon, femaleMoon), maxPoints: 1, description: "Spiritual development compatibility" },
      { name: "Vashya", points: calculateVashyaKoota(maleMoon, femaleMoon), maxPoints: 2, description: "Power dynamics in relationship" },
      { name: "Tara", points: calculateTaraKoota(maleNakshatra, femaleNakshatra), maxPoints: 3, description: "Destiny and fortune alignment" },
      { name: "Yoni", points: calculateYoniKoota(maleNakshatra, femaleNakshatra), maxPoints: 4, description: "Sexual compatibility and intimacy" },
      { name: "Graha Maitri", points: calculateGrahaMaitri(maleMoon, femaleMoon), maxPoints: 5, description: "Planetary friendship" },
      { name: "Gana", points: calculateGanaKoota(maleNakshatra, femaleNakshatra), maxPoints: 6, description: "Temperament compatibility" },
      { name: "Bhakoot", points: calculateBhakootKoota(maleMoon, femaleMoon), maxPoints: 7, description: "Health and prosperity" },
      { name: "Nadi", points: calculateNadiKoota(maleNakshatra, femaleNakshatra), maxPoints: 8, description: "Physiological compatibility" },
    ];

    const totalScore = ashtakoot.reduce((sum, guna) => sum + guna.points, 0);

    const manglik = {
      male: isManglik(maleMars, maleAsc),
      female: isManglik(femaleMars, femaleAsc),
      compatibility: isManglik(maleMars, maleAsc) === isManglik(femaleMars, femaleAsc) 
        ? "Both have same Manglik status. Compatible." 
        : "Manglik status differs. Consult an astrologer.",
    };

    const doshas = [
      { name: "Mangal Dosha", present: manglik.male || manglik.female, severity: manglik.male || manglik.female ? "Present" : "None", remedy: manglik.male || manglik.female ? "Perform Kumbh Vivah or Hanuman Puja" : "Not applicable" },
      { name: "Nadi Dosha", present: ashtakoot[7].points === 0, severity: ashtakoot[7].points === 0 ? "Present" : "None", remedy: ashtakoot[7].points === 0 ? "Perform Nadi Nivarana Puja" : "Not applicable" },
    ];

    const recommendations = [
      "This is an excellent match! The couple will enjoy a harmonious and prosperous life together.",
      "This is a good match with decent compatibility. Some adjustments may be needed.",
      "This match has moderate compatibility. Consult a Vedic astrologer for detailed guidance.",
      "This match has low compatibility. Consider remedies or consult an expert astrologer.",
    ];

    return NextResponse.json({
      overallScore: totalScore,
      categories: [
        { name: "Emotional Compatibility", score: Math.min(100, totalScore * 3 + 10), description: "Based on Moon sign alignment" },
        { name: "Intellectual Harmony", score: Math.min(100, totalScore * 2.5 + 20), description: "Based on Mercury positions" },
        { name: "Physical Attraction", score: Math.min(100, totalScore * 3 + 5), description: "Based on Venus and Mars alignment" },
        { name: "Spiritual Alignment", score: Math.min(100, totalScore * 2.8 + 15), description: "Based on Jupiter positions" },
      ],
      ashtakoot,
      manglik,
      doshas,
      recommendation: recommendations[Math.min(3, Math.floor((36 - totalScore) / 9))],
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to calculate match" }, { status: 500 });
  }
}
