export interface NumerologyProfile {
  moolank: NumberInfo;
  bhagyank: NumberInfo;
  driverNumber: NumberInfo;
  namank: NumberInfo;
  name: string;
  dob: string;
  luckyDay: string;
  luckyColor: string;
  luckyNumber: number;
  friendlyNumbers: number[];
  neutralNumbers: number[];
  challengingNumbers: number[];
  recommendations: string[];
}

export interface NumberInfo {
  number: number;
  planet: string;
  planetMeaning: string;
  positiveTraits: string[];
  negativeTraits: string[];
  careerMatches: string[];
  gemstone: string;
  bestCompatibility: number[];
  personality: string;
}

export interface NumerologyInput {
  name: string;
  day: number;
  month: number;
  year: number;
}

const PLANET_NAMES = [
  "", // index 0 unused
  "Sun (Surya)",
  "Moon (Chandra)",
  "Jupiter (Guru)",
  "Rahu (North Node)",
  "Mercury (Budh)",
  "Venus (Shukra)",
  "Ketu (South Node)",
  "Saturn (Shani)",
  "Mars (Mangal)",
];

const NUMBER_DATA: Record<number, Omit<NumberInfo, "number" | "planet">> = {
  1: {
    planetMeaning:
      "Ruled by the Sun, the source of all light and energy in the cosmos. Signifies leadership, vitality, and divine will.",
    positiveTraits: ["Natural born leader", "Ambitious and driven", "Independent and confident", "Creative and original", "Strong willpower"],
    negativeTraits: ["Stubborn and rigid", "Egoistic tendencies", "Impatient with others", "Dominating personality"],
    careerMatches: ["Politics", "Government service", "Management", "Entrepreneurship", "Sports", "Film direction"],
    gemstone: "Ruby (Manik)",
    bestCompatibility: [1, 3, 5, 7],
    personality:
      "You are a born leader with the radiant energy of the Sun. Your natural charisma draws people to you, and you excel in positions of authority and responsibility. Your pioneering spirit drives you to blaze new trails.",
  },
  2: {
    planetMeaning:
      "Ruled by the Moon, the closest celestial body to Earth. Governs emotions, intuition, and the subconscious mind.",
    positiveTraits: ["Emotionally intuitive", "Gentle and diplomatic", "Cooperative and adaptable", "Strong imagination", "Loyal and caring"],
    negativeTraits: ["Overly sensitive", "Indecisive at times", "Moody and fluctuating", "Easily influenced"],
    careerMatches: ["Art and music", "Poetry and writing", "Counselling", "Nursing and care", "Hospitality", "Interior design"],
    gemstone: "Pearl (Moti)",
    bestCompatibility: [2, 4, 6, 8],
    personality:
      "Your personality flows like the Moon's gentle light. You possess deep emotional intelligence and a nurturing spirit that makes others feel safe around you. Your intuitive nature allows you to understand what others cannot express in words.",
  },
  3: {
    planetMeaning:
      "Ruled by Jupiter (Guru), the great teacher and guide of the celestial court. Symbolizes wisdom, expansion, and divine knowledge.",
    positiveTraits: ["Exceptionally creative", "Optimistic and enthusiastic", "Articulate communicator", "Visionary thinking", "Socially magnetic"],
    negativeTraits: ["Scattered focus", "Overly optimistic", "Superficial at times", "Restless energy"],
    careerMatches: ["Acting and theatre", "Writing and publishing", "Public speaking", "Marketing and PR", "Education", "Entertainment"],
    gemstone: "Yellow Sapphire (Pukhraj)",
    bestCompatibility: [1, 3, 5, 7],
    personality:
      "The expansive energy of Jupiter flows through you. You are a natural communicator and creative force, capable of inspiring entire audiences with your words and ideas. Your optimism is contagious and your vision is boundless.",
  },
  4: {
    planetMeaning:
      "Ruled by Rahu, the North Node of the Moon. Represents worldly ambition, innovation, and material progress.",
    positiveTraits: ["Practical and grounded", "Highly disciplined", "Detail-oriented", "Reliable and systematic", "Strong endurance"],
    negativeTraits: ["Too rigid in thinking", "Resistant to change", "Workaholic tendencies", "Overly critical"],
    careerMatches: ["Engineering", "Architecture", "Accounting", "Law", "Project management", "Manufacturing"],
    gemstone: "Hessonite (Gomed)",
    bestCompatibility: [2, 4, 6, 8],
    personality:
      "You are the builder of the zodiac — systematic, precise, and unshakeable. Like Rahu, you are drawn to unconventional paths and material mastery. Your discipline turns even the most ambitious dreams into tangible reality.",
  },
  5: {
    planetMeaning:
      "Ruled by Mercury (Budh), the swift messenger of the gods. Governs intellect, commerce, and communication.",
    positiveTraits: ["Quick-witted and clever", "Highly adaptable", "Persuasive communicator", "Adventurous spirit", "Versatile talents"],
    negativeTraits: ["Restless and impatient", "Inconsistent focus", "Impulsive decisions", "Scattered energy"],
    careerMatches: ["Sales and marketing", "Journalism", "Public relations", "Trading", "Travel industry", "Digital media"],
    gemstone: "Emerald (Panna)",
    bestCompatibility: [1, 3, 5, 7],
    personality:
      "Mercury's swift energy makes you a natural communicator and trader of ideas. Your mind processes information at lightning speed, and your adaptability allows you to thrive in ever-changing environments. Adventure is your constant companion.",
  },
  6: {
    planetMeaning:
      "Ruled by Venus (Shukra), the planet of love, beauty, and luxury. The guru of the asuras, master of aesthetics.",
    positiveTraits: ["Warm and loving nature", "Artistic sensibility", "Sense of responsibility", "Harmonizing presence", "Generous heart"],
    negativeTraits: ["Overly self-sacrificing", "Possessive in relationships", "Avoids confrontation", "Extravagant tendencies"],
    careerMatches: ["Fine arts", "Fashion and beauty", "Hospitality", "Counselling", "Interior design", "Performing arts"],
    gemstone: "Diamond (Heera)",
    bestCompatibility: [2, 4, 6, 8],
    personality:
      "Venus blesses you with magnetic charm and aesthetic grace. You are a natural harmonizer who brings peace and beauty to every space you enter. Your capacity for love is deep, and loyalty defines your relationships.",
  },
  7: {
    planetMeaning:
      "Ruled by Ketu, the South Node of the Moon. The planet of spiritual liberation and mystical knowledge.",
    positiveTraits: ["Deep analytical mind", "Intellectual and perceptive", "Spiritually inclined", "Original thinker", "Mysterious aura"],
    negativeTraits: ["Emotionally reserved", "Detached from people", "Overthinking tendencies", "Difficulty trusting others"],
    careerMatches: ["Research and analysis", "Philosophy", "Astrology and occult", "Science", "Writing", "IT and technology"],
    gemstone: "Cat's Eye (Lehsunia)",
    bestCompatibility: [1, 3, 5, 7],
    personality:
      "Ketu's mystical energy marks you as a seeker of deeper truths. Your mind penetrates beyond surface appearances into the very essence of existence. Solitude is not loneliness for you — it is where your greatest insights are born.",
  },
  8: {
    planetMeaning:
      "Ruled by Saturn (Shani), the stern teacher and karmic judge. The planet of discipline, justice, and time.",
    positiveTraits: ["Determined and persistent", "Excellent organizational skills", "Strong sense of justice", "Strategic thinker", "Highly resilient"],
    negativeTraits: ["Pessimistic outlook", "Too serious demeanor", "Karmic challenges", "Difficulty relaxing"],
    careerMatches: ["Business management", "Real estate", "Heavy industry", "Mining", "Law and justice", "Banking and finance"],
    gemstone: "Blue Sapphire (Neelam)",
    bestCompatibility: [2, 4, 6, 8],
    personality:
      "Saturn's karmic energy shapes you into a formidable force of discipline and endurance. You understand the value of hard work and time better than anyone. The challenges you face become the foundation of your greatest achievements.",
  },
  9: {
    planetMeaning:
      "Ruled by Mars (Mangal), the warrior planet. Represents courage, passion, and decisive action.",
    positiveTraits: ["Bold and courageous", "Highly energetic", "Compassionate to masses", "Charismatic presence", "Natural protector"],
    negativeTraits: ["Impulsive anger", "Impatient nature", "Competitive to a fault", "Difficulty compromising"],
    careerMatches: ["Military and defense", "Athletics", "Engineering", "Surgery and medicine", "Emergency services", "Leadership roles"],
    gemstone: "Red Coral (Moonga)",
    bestCompatibility: [1, 3, 5, 7],
    personality:
      "Mars fuels you with warrior-like courage and boundless energy. You are a natural protector who fights for the underdog with fierce passion. Your charismatic presence commands attention, and your actions inspire others.",
  },
};

const LUCKY_DAYS: Record<number, string> = {
  1: "Sunday", 2: "Monday", 3: "Thursday", 4: "Sunday",
  5: "Wednesday", 6: "Friday", 7: "Wednesday", 8: "Saturday", 9: "Tuesday",
};

const LUCKY_COLORS: Record<number, string> = {
  1: "Red, Orange, Gold", 2: "White, Silver, Pearl", 3: "Yellow, Saffron, Crimson",
  4: "Grey, Blue, Electric Blue", 5: "Green, Turquoise", 6: "White, Pink, Blue",
  7: "White, Green, Blue-grey", 8: "Black, Dark Blue, Purple", 9: "Red, Maroon, Crimson",
};

const RECOMMENDATIONS: Record<number, string[]> = {
  1: ["Wear a Ruby (Manik) in a gold ring on your right ring finger on a Sunday.", "Avoid meddling in others' affairs; channel your leadership into constructive projects.", "Meditate facing the sunrise for 10 minutes daily to harness solar energy.", "Youths born with number 1 should avoid matoon (electional) clashes with Saturn-dominated people."],
  2: ["Wear a Pearl (Moti) in a silver ring on your little finger on a Monday.", "Avoid overthinking by grounding yourself in physical activities like yoga or swimming.", "Keep white or silver items in your workspace to enhance lunar harmony.", "Watering a tulsi plant daily strengthens your emotional resilience."],
  3: ["Wear a Yellow Sapphire (Pukhraj) in a gold ring on the index finger on a Thursday.", "Practice focus techniques like single-tasking to channel your versatile energy.", "Donate yellow items like bananas or turmeric on Thursdays for Jupiter blessings.", "Avoid gambling or speculation; your Jupiter energy is best used in teaching or philosophy."],
  4: ["Wear a Hessonite (Gomed) in a silver ring on the middle finger on a Saturday.", "Create flexible routines to balance Rahu's unpredictable energy.", "Donate black sesame seeds on Saturdays to appease Rahu.", "Avoid shortcuts in work; your pure hard work will be rewarded in time."],
  5: ["Wear an Emerald (Panna) in a gold ring on your little finger on a Wednesday.", "Meditate for 5 minutes between tasks to calm Mercury's racing mind.", "Wear green clothes on Wednesdays and keep a green plant in your workspace.", "Avoid impulsive purchases or contracts; read the details twice before signing."],
  6: ["Wear a Diamond (Heera) in a platinum or gold ring on your ring finger on a Friday.", "Balance beauty with duty; schedule self-care as seriously as work.", "Donate sweets or white items on Fridays to honor Venus.", "Avoid extravagance during emotional moments; make big purchases with a clear mind."],
  7: ["Wear a Cat's Eye (Lehsunia) in a gold ring on the middle finger on a Saturday.", "Ground yourself by spending time in nature when analytical thoughts overwhelm you.", "Study esoteric subjects — your Ketu energy thrives in hidden knowledge.", "Avoid using cleverness for manipulation; your spiritual power grows with integrity."],
  8: ["Wear a Blue Sapphire (Neelam) only after proper consultation, in a gold ring on Saturday.", "Honor your body with rest; Saturn's endurance needs regular recovery.", "Donate black clothes or blankets on Saturdays for karmic relief.", "Avoid conflicts with authority; patience and strategy will defeat force."],
  9: ["Wear a Red Coral (Moonga) in a gold ring on your ring finger on a Tuesday.", "Exercise violent emotions out — martial arts or intense workouts drain Mars energy constructively.", "Donate red lentils or red items on Tuesdays to appease Mars.", "Avoid arguments on Tuesdays; your Mars energy is powerful but must be directed deliberately."],
};

const FRIENDLY_NUMBERS: Record<number, number[]> = {
  1: [1, 3, 5, 7], 2: [2, 4, 6, 8], 3: [1, 3, 5, 7],
  4: [2, 4, 6, 8], 5: [1, 3, 5, 7], 6: [2, 4, 6, 8],
  7: [1, 3, 5, 7], 8: [2, 4, 6, 8], 9: [9, 1, 5],
};

const NEUTRAL_NUMBERS: Record<number, number[]> = {
  1: [9], 2: [9], 3: [6], 4: [5], 5: [4], 6: [3], 7: [6, 2], 8: [5], 9: [9, 3, 6],
};

const CHALLENGING_NUMBERS: Record<number, number[]> = {
  1: [2, 4, 8], 2: [1, 5, 7], 3: [4, 8], 4: [1, 3, 7], 5: [2, 8], 6: [7, 1],
  7: [4, 6, 8], 8: [1, 4, 5, 7], 9: [2, 8],
};

/** Reduce a number to a single digit (1-9) */
export function reduceToSingleDigit(n: number): number {
  while (n > 9) {
    n = String(n).split("").reduce((sum, d) => sum + parseInt(d), 0);
  }
  return n;
}

/** Convert letters to numbers (A=1, B=2, ... Z=26) then reduce */
export function lettersToNumber(name: string): number {
  const clean = name.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (!clean) return 0;
  const sum = clean.split("").reduce((total, ch) => total + (ch.charCodeAt(0) - 64), 0);
  return reduceToSingleDigit(sum);
}

/** Calculate all numerology numbers */
export function calculateNumerology(input: NumerologyInput): NumerologyProfile | null {
  if (!input.name || !input.day || !input.month || !input.year) return null;

  // Moolank / Driver Number (Birth Number) = reduce birth day to single digit
  const moolank = reduceToSingleDigit(input.day);

  // Bhagyank (Destiny Number) = reduce the full date of birth to a single digit
  const bhagyank = reduceToSingleDigit(
    String(input.day).split("").reduce((s, d) => s + parseInt(d), 0) +
    String(input.month).split("").reduce((s, d) => s + parseInt(d), 0) +
    String(input.year).split("").reduce((s, d) => s + parseInt(d), 0)
  );

  // Namank (Name Number)
  const namank = lettersToNumber(input.name) || moolank;

  const getInfo = (n: number): NumberInfo => {
    const data = NUMBER_DATA[n];
    return {
      number: n,
      planet: PLANET_NAMES[n],
      ...data,
    };
  };

  const profile: NumerologyProfile = {
    moolank: getInfo(moolank),
    bhagyank: getInfo(bhagyank),
    driverNumber: getInfo(moolank),
    namank: getInfo(namank),
    name: input.name.trim(),
    dob: `${input.day}/${input.month}/${input.year}`,
    luckyDay: LUCKY_DAYS[bhagyank],
    luckyColor: LUCKY_COLORS[bhagyank],
    luckyNumber: bhagyank,
    friendlyNumbers: FRIENDLY_NUMBERS[bhagyank] || [],
    neutralNumbers: NEUTRAL_NUMBERS[bhagyank] || [],
    challengingNumbers: CHALLENGING_NUMBERS[bhagyank] || [],
    recommendations: RECOMMENDATIONS[bhagyank] || [],
  };

  return profile;
}

/** Get the meaning of a specific numerology number */
export function getNumberMeaning(n: number): NumberInfo {
  return { number: n, planet: PLANET_NAMES[n], ...NUMBER_DATA[n] };
}

/** All numbers for grid display */
export const ALL_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];