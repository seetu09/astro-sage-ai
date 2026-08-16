'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Sparkles, User, Bot, ArrowRight, Stars } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoMessage {
  role: 'user' | 'assistant';
  text: { en: string; hi: string };
  delay: number;
}

const demoConversation: DemoMessage[] = [
  {
    role: 'user',
    text: {
      en: 'Should I change my job this year? My DOB is 15 March 1995, Mumbai.',
      hi: 'क्या मुझे इस साल नौकरी बदलनी चाहिए? मेरी जन्म तिथि 15 मार्च 1995, मुंबई।',
    },
    delay: 800,
  },
  {
    role: 'assistant',
    text: {
      en: 'Based on your birth chart, Saturn is transiting your 10th house of career. This is a favorable period for professional growth, but patience is key. Wait until after July 2026 for major decisions.',
      hi: 'आपकी कुंडली के अनुसार, शनि आपके करियर के 10वें घर से गोचर कर रहा है। यह पेशेवर विकास के लिए अनुकूल समय है, लेकिन धैर्य महत्वपूर्ण है। बड़े निर्णय जुलाई 2026 के बाद तक स्थगित करें।',
    },
    delay: 1200,
  },
  {
    role: 'user',
    text: {
      en: 'What about my love life? When will I meet my soulmate?',
      hi: 'मेरे प्रेम जीवन के बारे में क्या? मैं अपने जीवनसाथी से कब मिलूंगा?',
    },
    delay: 1000,
  },
  {
    role: 'assistant',
    text: {
      en: 'Venus blesses your 7th house starting October 2026. A meaningful connection is likely through social circles or professional networks. Wear white on Fridays to strengthen Venus energy.',
      hi: 'शुक्र अक्टूबर 2026 से आपके 7वें घर को आशीर्वाद देगा। सामाजिक या पेशेवर नेटवर्क के माध्यम से एक सार्थक संबंध संभव है। शुक्र ऊर्जा को मजबूत करने के लिए शुक्रवार को सफेद पहनें।',
    },
    delay: 1400,
  },
  {
    role: 'user',
    text: {
      en: 'Give me a remedy for better finances.',
      hi: 'बेहतर वित्त के लिए कोई उपाय बताएं।',
    },
    delay: 900,
  },
  {
    role: 'assistant',
    text: {
      en: 'Offer water to the Sun every morning. Keep a small copper vessel with water near your workspace. Also, chanting "Om Gam Ganapataye Namaha" 108 times on Tuesdays attracts prosperity.',
      hi: 'हर सुबह सूर्य को जल अर्पित करें। अपने कार्यस्थल के पास पानी का एक छोटा ताम्र पात्र रखें। इसके अलावा, मंगलवार को "ॐ गं गणपतये नमः" 108 बार जाप करने से समृद्धि आकर्षित होती है।',
    },
    delay: 1500,
  },
];

export default function LiveDemo() {
  const { language } = useLanguage();
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to start animation when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [hasStarted]);

  // Auto-play conversation
  useEffect(() => {
    if (!hasStarted || !isPlaying) return;
    if (visibleMessages >= demoConversation.length) {
      // Restart after a pause
      const restartTimer = setTimeout(() => {
        setVisibleMessages(0);
      }, 4000);
      return () => clearTimeout(restartTimer);
    }

    const msg = demoConversation[visibleMessages];
    const timer = setTimeout(() => {
      setVisibleMessages((prev) => prev + 1);
    }, msg.delay);
    return () => clearTimeout(timer);
  }, [visibleMessages, hasStarted, isPlaying]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages]);

  const handleReplay = () => {
    setVisibleMessages(0);
    setIsPlaying(true);
  };

  const title = language === 'en' ? 'See the Magic in Action' : 'जादू को करीब से देखें';
  const subtitle =
    language === 'en'
      ? 'Watch how AI Guru answers real questions about career, love, and destiny.'
      : 'देखें कि AI गुरु करियर, प्रेम और भाग्य के बारे में असली सवालों का जवाब कैसे देता है।';
  const ctaText = language === 'en' ? 'Start Your Own Reading' : 'अपनी रीडिंग शुरू करें';
  const typingText = language === 'en' ? 'AI Guru is typing...' : 'AI गुरु टाइप कर रहा है...';

  return (
    <section
      ref={containerRef}
      className="w-full py-20 px-4 md:px-8 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)] opacity-[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--accent)]">
              {language === 'en' ? 'Live Preview' : 'लाइव पूर्वावलोकन'}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-bold mb-4"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Chat Demo Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="astro-card p-1 md:p-2 relative">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                  <Stars className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    {language === 'en' ? 'AI Astrology Guru' : 'AI ज्योतिष गुरु'}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-[var(--text-muted)]">
                      {language === 'en' ? 'Online' : 'ऑनलाइन'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleReplay}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50 transition-all"
              >
                {language === 'en' ? 'Replay' : 'फिर से चलाएं'}
              </button>
            </div>

            {/* Messages Area */}
            <div className="h-[420px] overflow-y-auto scrollbar-thin px-3 py-2 space-y-4 bg-[var(--bg-primary)]/50 rounded-lg">
              <AnimatePresence mode="popLayout">
                {demoConversation.slice(0, visibleMessages).map((msg, index) => (
                  <motion.div
                    key={`${index}-${visibleMessages}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className={`flex gap-3 ${
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === 'user'
                          ? 'bg-[var(--bg-secondary)] border border-[var(--border)]'
                          : 'bg-[var(--accent)]/20'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-[var(--text-secondary)]" />
                      ) : (
                        <Bot className="w-4 h-4 text-[var(--accent)]" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[var(--accent)] text-[var(--bg-primary)] rounded-tr-sm'
                          : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-sm'
                      }`}
                    >
                      {msg.text[language]}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {visibleMessages < demoConversation.length && hasStarted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border)] px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[var(--text-muted)] mr-2">
                        {typingText}
                      </span>
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                      />
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                      />
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input Area (Decorative) */}
            <div className="mt-2 px-3 py-2 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-3">
                <input
                  type="text"
                  disabled
                  placeholder={
                    language === 'en'
                      ? 'Type your question...'
                      : 'अपना प्रश्न टाइप करें...'
                  }
                  className="flex-1 bg-transparent text-sm text-[var(--text-muted)] outline-none cursor-default"
                />
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-[var(--accent)]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-10"
        >
          <a
            href="/chat"
            className="astro-button inline-flex items-center gap-2 text-base px-8 py-3"
          >
            <Sparkles className="w-5 h-5" />
            {ctaText}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
