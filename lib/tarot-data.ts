export interface TarotCard {
  id: number;
  name: string;
  arcana: "major" | "minor";
  suit?: "wands" | "cups" | "swords" | "pentacles";
  upright: string;
  reversed: string;
  keywords?: string[];
  symbol: string;
}

export type TarotTopic = "love" | "career" | "general";

export interface DrawnCard {
  cardId: number;
  position: "past" | "present" | "future";
  reversed: boolean;
}

export const TAROT_TOPICS: { id: TarotTopic; label: string; icon: string; description: string }[] = [
  { id: "love", label: "Love", icon: "💖", description: "Romance, relationships & emotional connections" },
  { id: "career", label: "Career", icon: "💼", description: "Work, ambitions & professional growth" },
  { id: "general", label: "General", icon: "✨", description: "Overall life guidance & spiritual insight" },
];

export const TAROT_CARDS: TarotCard[] = [
  // ── Major Arcana (22) ──
  { id: 0, name: "The Fool", arcana: "major", symbol: "🌞", upright: "New beginnings, optimism, trust in life", reversed: "Holding back, fear of change, recklessness" },
  { id: 1, name: "The Magician", arcana: "major", symbol: "🪄", upright: "Manifestation, resourcefulness, power", reversed: "Manipulation, poor planning, untapped talents" },
  { id: 2, name: "The High Priestess", arcana: "major", symbol: "🌙", upright: "Intuition, sacred knowledge, divine feminine", reversed: "Secrets, disconnected from intuition, withdrawal" },
  { id: 3, name: "The Empress", arcana: "major", symbol: "🌹", upright: "Abundance, nurturing, fertility, creativity", reversed: "Creative block, dependence, smothering" },
  { id: 4, name: "The Emperor", arcana: "major", symbol: "👑", upright: "Authority, structure, stability, control", reversed: "Domination, rigidity, lack of discipline" },
  { id: 5, name: "The Hierophant", arcana: "major", symbol: "🔑", upright: "Spiritual wisdom, tradition, guidance", reversed: "Rebellion, unconventionality, restriction" },
  { id: 6, name: "The Lovers", arcana: "major", symbol: "💞", upright: "Love, harmony, meaningful connections", reversed: "Imbalance, misalignment, disharmony" },
  { id: 7, name: "The Chariot", arcana: "major", symbol: "⚔️", upright: "Victory, willpower, determination", reversed: "Lack of direction, aggression, obstacles" },
  { id: 8, name: "Strength", arcana: "major", symbol: "🦁", upright: "Courage, inner strength, resilience", reversed: "Self-doubt, weakness, insecurity" },
  { id: 9, name: "The Hermit", arcana: "major", symbol: "🏮", upright: "Introspection, solitude, inner guidance", reversed: "Isolation, loneliness, withdrawal" },
  { id: 10, name: "Wheel of Fortune", arcana: "major", symbol: "🎡", upright: "Change, cycles, destiny, turning point", reversed: "Bad luck, resistance to change, setbacks" },
  { id: 11, name: "Justice", arcana: "major", symbol: "⚖️", upright: "Fairness, truth, cause and effect", reversed: "Unfairness, dishonesty, imbalance" },
  { id: 12, name: "The Hanged Man", arcana: "major", symbol: "🙃", upright: "Surrender, new perspective, pause", reversed: "Stalling, resistance, needless sacrifice" },
  { id: 13, name: "Death", arcana: "major", symbol: "♻️", upright: "Endings, transformation, new beginnings", reversed: "Resistance to change, stagnation, fear" },
  { id: 14, name: "Temperance", arcana: "major", symbol: "⚗️", upright: "Balance, patience, moderation", reversed: "Imbalance, excess, discord" },
  { id: 15, name: "The Devil", arcana: "major", symbol: "🔗", upright: "Liberation, shadow self, attachment", reversed: "Freedom, release, breaking chains" },
  { id: 16, name: "The Tower", arcana: "major", symbol: "🌩️", upright: "Sudden change, awakening, revelation", reversed: "Fear of change, disaster avoided" },
  { id: 17, name: "The Star", arcana: "major", symbol: "⭐", upright: "Hope, healing, inspiration, serenity", reversed: "Lack of faith, despair, discouragement" },
  { id: 18, name: "The Moon", arcana: "major", symbol: "🌕", upright: "Mystery, intuition, hidden truths", reversed: "Confusion, fear, misinterpretation" },
  { id: 19, name: "The Sun", arcana: "major", symbol: "☀️", upright: "Success, vitality, joy, positivity", reversed: "Temporary setbacks, lack of enthusiasm" },
  { id: 20, name: "Judgement", arcana: "major", symbol: "📯", upright: "Rebirth, awakening, inner calling", reversed: "Self-doubt, ignoring the call, regret" },
  { id: 21, name: "The World", arcana: "major", symbol: "🌍", upright: "Completion, fulfillment, cosmic harmony", reversed: "Incompletion, lack of closure" },

  // ── Minor Arcana: Wands (14) ──
  { id: 22, name: "Ace of Wands", arcana: "minor", suit: "wands", symbol: "🔥", upright: "Inspiration, new passion, creative spark", reversed: "Lack of energy, delayed plans, creative block" },
  { id: 23, name: "Two of Wands", arcana: "minor", suit: "wands", symbol: "🌍", upright: "Future planning, progress, decisions", reversed: "Fear of change, lack of planning" },
  { id: 24, name: "Three of Wands", arcana: "minor", suit: "wands", symbol: "⛵", upright: "Expansion, foresight, overseas opportunities", reversed: "Delays, obstacles, lack of foresight" },
  { id: 25, name: "Four of Wands", arcana: "minor", suit: "wands", symbol: "🏡", upright: "Celebration, harmony, homecoming", reversed: "Lack of stability, family conflict" },
  { id: 26, name: "Five of Wands", arcana: "minor", suit: "wands", symbol: "⚔️", upright: "Conflict, competition, tension", reversed: "Avoiding conflict, inner turmoil" },
  { id: 27, name: "Six of Wands", arcana: "minor", suit: "wands", symbol: "🏆", upright: "Victory, recognition, public success", reversed: "Lack of recognition, failure, ego" },
  { id: 28, name: "Seven of Wands", arcana: "minor", suit: "wands", symbol: "🛡️", upright: "Perseverance, defense, standing ground", reversed: "Giving up, overwhelmed, defensiveness" },
  { id: 29, name: "Eight of Wands", arcana: "minor", suit: "wands", symbol: "💨", upright: "Speed, action, rapid progress", reversed: "Delays, frustration, waiting" },
  { id: 30, name: "Nine of Wands", arcana: "minor", suit: "wands", symbol: "🛡️", upright: "Resilience, courage, persistence", reversed: "Exhaustion, defensiveness, paranoia" },
  { id: 31, name: "Ten of Wands", arcana: "minor", suit: "wands", symbol: "🎒", upright: "Burden, responsibility, hard work", reversed: "Overwhelm, burnout, release" },
  { id: 32, name: "Page of Wands", arcana: "minor", suit: "wands", symbol: "🔥", upright: "Enthusiasm, exploration, discovery", reversed: "Lack of direction, procrastination" },
  { id: 33, name: "Knight of Wands", arcana: "minor", suit: "wands", symbol: "🐎", upright: "Adventure, passion, impulsiveness", reversed: "Recklessness, haste, frustration" },
  { id: 34, name: "Queen of Wands", arcana: "minor", suit: "wands", symbol: "🌻", upright: "Confidence, courage, determination", reversed: "Insecurity, jealousy, self-doubt" },
  { id: 35, name: "King of Wands", arcana: "minor", suit: "wands", symbol: "👑", upright: "Leadership, vision, entrepreneurship", reversed: "Impulsiveness, arrogance, domination" },

  // ── Minor Arcana: Cups (14) ──
  { id: 36, name: "Ace of Cups", arcana: "minor", suit: "cups", symbol: "💧", upright: "New love, emotional awakening, intuition", reversed: "Emotional blockage, emptiness, numbness" },
  { id: 37, name: "Two of Cups", arcana: "minor", suit: "cups", symbol: "💞", upright: "Partnership, mutual attraction, unity", reversed: "Imbalance, separation, disharmony" },
  { id: 38, name: "Three of Cups", arcana: "minor", suit: "cups", symbol: "🎉", upright: "Friendship, celebration, community", reversed: "Overindulgence, gossip, isolation" },
  { id: 39, name: "Four of Cups", arcana: "minor", suit: "cups", symbol: "😔", upright: "Apathy, contemplation, missed opportunities", reversed: "New perspective, acceptance, awakening" },
  { id: 40, name: "Five of Cups", arcana: "minor", suit: "cups", symbol: "🌧️", upright: "Loss, grief, regret", reversed: "Acceptance, moving on, forgiveness" },
  { id: 41, name: "Six of Cups", arcana: "minor", suit: "cups", symbol: "🏺", upright: "Nostalgia, childhood memories, innocence", reversed: "Living in the past, stuck in memories" },
  { id: 42, name: "Seven of Cups", arcana: "minor", suit: "cups", symbol: "🌈", upright: "Choices, illusions, fantasy", reversed: "Clarity, focus, making decisions" },
  { id: 43, name: "Eight of Cups", arcana: "minor", suit: "cups", symbol: "🥾", upright: "Walking away, seeking deeper meaning", reversed: "Fear of change, avoiding departure" },
  { id: 44, name: "Nine of Cups", arcana: "minor", suit: "cups", symbol: "😊", upright: "Wishes fulfilled, satisfaction, contentment", reversed: "Dissatisfaction, greed, overindulgence" },
  { id: 45, name: "Ten of Cups", arcana: "minor", suit: "cups", symbol: "🏠", upright: "Harmony, family joy, emotional fulfillment", reversed: "Broken family, disharmony, unrealistic dreams" },
  { id: 46, name: "Page of Cups", arcana: "minor", suit: "cups", symbol: "🐚", upright: "Creative inspiration, curiosity, new feelings", reversed: "Emotional immaturity, insecurity" },
  { id: 47, name: "Knight of Cups", arcana: "minor", suit: "cups", symbol: "🐴", upright: "Romance, charm, idealism", reversed: "Moodiness, unrealistic expectations" },
  { id: 48, name: "Queen of Cups", arcana: "minor", suit: "cups", symbol: "🌊", upright: "Compassion, emotional intelligence, intuition", reversed: "Emotional insecurity, codependency" },
  { id: 49, name: "King of Cups", arcana: "minor", suit: "cups", symbol: "👑", upright: "Emotional balance, diplomacy, wisdom", reversed: "Emotional manipulation, moodiness" },

  // ── Minor Arcana: Swords (14) ──
  { id: 50, name: "Ace of Swords", arcana: "minor", suit: "swords", symbol: "🗡️", upright: "Clarity, truth, mental breakthrough", reversed: "Confusion, mental fog, miscommunication" },
  { id: 51, name: "Two of Swords", arcana: "minor", suit: "swords", symbol: "⚖️", upright: "Difficult decisions, stalemate, avoidance", reversed: "Indecision, anxiety, facing the truth" },
  { id: 52, name: "Three of Swords", arcana: "minor", suit: "swords", symbol: "💔", upright: "Heartbreak, sorrow, betrayal", reversed: "Healing, forgiveness, moving on" },
  { id: 53, name: "Four of Swords", arcana: "minor", suit: "swords", symbol: "🛌", upright: "Rest, recovery, contemplation", reversed: "Burnout, restlessness, exhaustion" },
  { id: 54, name: "Five of Swords", arcana: "minor", suit: "swords", symbol: "🏳️", upright: "Conflict, defeat, win at all costs", reversed: "Reconciliation, moving on, letting go" },
  { id: 55, name: "Six of Swords", arcana: "minor", suit: "swords", symbol: "⛵", upright: "Transition, moving on, healing", reversed: "Stuck in the past, resistance to change" },
  { id: 56, name: "Seven of Swords", arcana: "minor", suit: "swords", symbol: "🕵️", upright: "Deception, strategy, stealth", reversed: "Confession, honesty, coming clean" },
  { id: 57, name: "Eight of Swords", arcana: "minor", suit: "swords", symbol: "🪢", upright: "Self-imposed limitations, feeling trapped", reversed: "Freedom, release, new perspective" },
  { id: 58, name: "Nine of Swords", arcana: "minor", suit: "swords", symbol: "😰", upright: "Anxiety, worry, nightmares", reversed: "Hope, recovery, releasing worry" },
  { id: 59, name: "Ten of Swords", arcana: "minor", suit: "swords", symbol: "🩸", upright: "Betrayal, rock bottom, painful ending", reversed: "Recovery, healing, moving on" },
  { id: 60, name: "Page of Swords", arcana: "minor", suit: "swords", symbol: "📜", upright: "Curiosity, new ideas, vigilance", reversed: "Gossip, miscommunication, impulsiveness" },
  { id: 61, name: "Knight of Swords", arcana: "minor", suit: "swords", symbol: "🐎", upright: "Ambition, determination, action", reversed: "Recklessness, haste, aggression" },
  { id: 62, name: "Queen of Swords", arcana: "minor", suit: "swords", symbol: "👸", upright: "Independence, clarity, honesty", reversed: "Coldness, bitterness, harshness" },
  { id: 63, name: "King of Swords", arcana: "minor", suit: "swords", symbol: "👑", upright: "Intellect, truth, authority", reversed: "Manipulation, tyranny, misuse of power" },

  // ── Minor Arcana: Pentacles (14) ──
  { id: 64, name: "Ace of Pentacles", arcana: "minor", suit: "pentacles", symbol: "🪙", upright: "New opportunity, prosperity, abundance", reversed: "Missed opportunity, financial loss" },
  { id: 65, name: "Two of Pentacles", arcana: "minor", suit: "pentacles", symbol: "⚖️", upright: "Balance, juggling priorities, adaptability", reversed: "Overwhelm, imbalance, disorganization" },
  { id: 66, name: "Three of Pentacles", arcana: "minor", suit: "pentacles", symbol: "🛠️", upright: "Teamwork, collaboration, craftsmanship", reversed: "Lack of teamwork, poor quality" },
  { id: 67, name: "Four of Pentacles", arcana: "minor", suit: "pentacles", symbol: "💰", upright: "Security, control, stability", reversed: "Greed, possessiveness, letting go" },
  { id: 68, name: "Five of Pentacles", arcana: "minor", suit: "pentacles", symbol: "❄️", upright: "Financial hardship, isolation, struggle", reversed: "Recovery, spiritual poverty, support" },
  { id: 69, name: "Six of Pentacles", arcana: "minor", suit: "pentacles", symbol: "🤲", upright: "Generosity, charity, giving and receiving", reversed: "Debt, inequality, selfishness" },
  { id: 70, name: "Seven of Pentacles", arcana: "minor", suit: "pentacles", symbol: "🌱", upright: "Patience, long-term investment, growth", reversed: "Impatience, lack of reward, wasted effort" },
  { id: 71, name: "Eight of Pentacles", arcana: "minor", suit: "pentacles", symbol: "🔨", upright: "Skill, craftsmanship, dedication", reversed: "Perfectionism, lack of skill, mediocrity" },
  { id: 72, name: "Nine of Pentacles", arcana: "minor", suit: "pentacles", symbol: "🌿", upright: "Independence, luxury, self-sufficiency", reversed: "Financial dependence, overindulgence" },
  { id: 73, name: "Ten of Pentacles", arcana: "minor", suit: "pentacles", symbol: "🏛️", upright: "Wealth, legacy, family stability", reversed: "Financial loss, family conflict" },
  { id: 74, name: "Page of Pentacles", arcana: "minor", suit: "pentacles", symbol: "📚", upright: "Learning, new skills, ambition", reversed: "Lack of progress, procrastination" },
  { id: 75, name: "Knight of Pentacles", arcana: "minor", suit: "pentacles", symbol: "🐂", upright: "Reliability, hard work, patience", reversed: "Stagnation, boredom, stubbornness" },
  { id: 76, name: "Queen of Pentacles", arcana: "minor", suit: "pentacles", symbol: "🌾", upright: "Nurturing, practicality, abundance", reversed: "Work-life imbalance, neglect" },
  { id: 77, name: "King of Pentacles", arcana: "minor", suit: "pentacles", symbol: "👑", upright: "Wealth, leadership, security", reversed: "Greed, stubbornness, financial insecurity" },
];

export function getCardById(id: number): TarotCard | undefined {
  return TAROT_CARDS.find((card) => card.id === id);
}

export function drawThreeCards(): DrawnCard[] {
  const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
  const positions: DrawnCard["position"][] = ["past", "present", "future"];
  return positions.map((position, i) => ({
    cardId: shuffled[i].id,
    position,
    reversed: Math.random() > 0.5,
  }));
}

export function getCardMeaning(card: TarotCard, reversed: boolean): string {
  return reversed ? card.reversed : card.upright;
}