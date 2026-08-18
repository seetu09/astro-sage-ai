'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Star } from "lucide-react";
import { TAROT_CARDS, TAROT_TOPICS, drawThreeCards, getCardById, getCardMeaning, type DrawnCard, type TarotTopic } from "@/lib/tarot-data";

interface RevealedCard extends DrawnCard {
  name: string;
  symbol: string;
  meaning: string;
  arcana: string;
}

const POSITION_LABELS: Record<DrawnCard["position"], string> = {
  past: "Past",
  present: "Present",
  future: "Future / Outcome",
};

export default function TarotReadingPage() {
  const [topic, setTopic] = useState<TarotTopic>("general");
  const [cards, setCards] = useState<RevealedCard[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [interpretation, setInterpretation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const shuffleDeck = () => {
    setIsShuffling(true);
    setFlipped([false, false, false]);
    setInterpretation("");
    setCards([]);

    setTimeout(() => {
      const drawn = drawThreeCards();
      const revealed: RevealedCard[] = drawn.map((card) => {
        const fullCard = getCardById(card.cardId)!;
        return {
          ...card,
          name: fullCard.name,
          symbol: fullCard.symbol,
          meaning: getCardMeaning(fullCard, card.reversed),
          arcana: fullCard.arcana,
        };
      });
      setCards(revealed);
      setIsShuffling(false);
    }, 800);
  };

  const flipCard = (index: number) => {
    setFlipped((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const getInterpretation = async () => {
    if (cards.length === 0) return;
    setIsLoading(true);
    setInterpretation("");
    try {
      const res = await fetch("/api/tarot/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          cards: cards.map(({ cardId, position, reversed }) => ({ cardId, position, reversed })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setInterpretation(data.interpretation);
      } else {
        setInterpretation("The cards are ready, but the cosmic connection is busy. Please try again.");
      }
    } catch {
      setInterpretation("The cards are ready, but the cosmic connection is busy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const allFlipped = flipped.every(Boolean);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Free 3-Card Tarot Reading</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">
            🔮 Tarot Card Reading
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Draw three cards to reveal insights about your past, present, and future. Choose a topic to focus your reading.
          </p>
        </motion.div>

        {/* Topic Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 text-center">Choose Your Topic</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {TAROT_TOPICS.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTopic(t.id)}
                className={`astro-card p-4 text-center cursor-pointer transition-all ${topic === t.id ? "ring-2 ring-[var(--accent)] bg-[var(--accent)]/5" : ""}`}
              >
                <div className="text-3xl mb-2">{t.icon}</div>
                <div className="font-semibold text-[var(--text-primary)]">{t.label}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{t.description}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Shuffle Button */}
        <div className="text-center mb-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shuffleDeck}
            disabled={isShuffling}
            className="px-8 py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${isShuffling ? "animate-spin" : ""}`} />
            {isShuffling ? "Shuffling..." : cards.length > 0 ? "Shuffle Again" : "Shuffle & Draw Cards"}
          </motion.button>
        </div>

        {/* Card Deck */}
        {cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {cards.map((card, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-sm font-semibold text-[var(--text-muted)] mb-3 uppercase tracking-wider">
                  {POSITION_LABELS[card.position]}
                </div>
                <motion.div
                  className="relative w-48 h-72 cursor-pointer [perspective:1000px]"
                  onClick={() => flipCard(index)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <motion.div
                    className="relative w-full h-full [transform-style:preserve-3d]"
                    animate={{ rotateY: flipped[index] ? 180 : 0 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                  >
                    {/* Card Back */}
                    <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 border-2 border-purple-500/30 shadow-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl mb-3">🔮</div>
                        <div className="text-purple-300 font-semibold tracking-widest text-sm">ASTROVEDA</div>
                        <div className="text-purple-500 text-xs mt-2">Tap to reveal</div>
                      </div>
                    </div>
                    {/* Card Front */}
                    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-300 shadow-xl p-5 flex flex-col items-center justify-center text-center">
                      <div className="text-5xl mb-3">{card.symbol}</div>
                      <div className="text-lg font-bold text-amber-900 mb-1">{card.name}</div>
                      <div className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-3 ${card.reversed ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {card.reversed ? "Reversed" : "Upright"}
                      </div>
                      <div className="text-xs text-amber-800 leading-relaxed">{card.meaning}</div>
                      <div className="text-[10px] text-amber-600 mt-3 uppercase tracking-wider">{card.arcana}</div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            ))}
          </div>
        )}

        {/* Interpretation */}
        {allFlipped && cards.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={getInterpretation}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Star className="w-5 h-5" />
              {isLoading ? "Consulting the Stars..." : "Get AI Interpretation"}
            </motion.button>
          </motion.div>
        )}

        {interpretation && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="astro-card max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-[var(--accent)]" />
              <h2 className="text-xl font-bold font-serif text-[var(--text-primary)]">Your Reading</h2>
            </div>
            <div className="prose prose-amber max-w-none text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
              {interpretation}
            </div>
          </motion.div>
        )}

        {cards.length === 0 && !isShuffling && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="text-6xl mb-4">🃏</div>
            <p className="text-[var(--text-muted)] text-lg">
              Click "Shuffle & Draw Cards" to begin your reading
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}