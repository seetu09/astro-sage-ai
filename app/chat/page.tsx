'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Send, User, Bot, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useWallet } from '@/app/context/WalletContext';
import { useAuth } from '@/app/context/AuthContext';
import { saveChatHistory } from '@/lib/user-history';
import EmptyState from '@/app/components/EmptyState';
import { SkeletonChat } from '@/app/components/SkeletonLoader';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const mockResponses: Record<string, string[]> = {
  en: [
    "The stars indicate a period of transformation for you. Jupiter's influence in your chart suggests growth in your career sector. Focus on long-term goals rather than immediate gratification.",
    "Your Moon sign reveals deep emotional currents today. It's an excellent time for introspection and spiritual practices. Consider meditation or journaling to process these energies.",
    "Venus favorably positioned for matters of the heart. If you're single, new romantic opportunities may present themselves. Those in relationships should focus on deepening their emotional connection.",
    "Saturn's transit through your 6th house emphasizes health and daily routines. This is an ideal time to establish better habits around diet, exercise, and work-life balance.",
    "Mercury retrograde is affecting your communication sector. Be extra mindful in important conversations and double-check all written communications.",
    "Your Mars placement suggests high energy and motivation today. Channel this into productive activities rather than conflicts. Physical exercise will help balance this fiery energy constructively.",
    "The North Node's influence indicates karmic lessons around relationships. Pay attention to recurring patterns and consider how past actions shape your present circumstances.",
    "A favorable aspect between Jupiter and your Sun sign brings optimism and expansion. This is an excellent time for learning, teaching, or embarking on educational pursuits.",
  ],
  hi: [
    "सितारे आपके लिए परिवर्तन की अवधि का संकेत देते हैं। आपकी कुंडली में बृहस्पति का प्रभाव करियर क्षेत्र में विकास का संकेत देता है। तत्काल संतुष्टि के बजाय दीर्घकालिक लक्ष्यों पर ध्यान केंद्रित करें।",
    "आपकी चंद्र राशि आज गहरी भावनात्मक धाराओं का खुलासा करती है। आत्मनिरीक्षण और आध्यात्मिक अभ्यास के लिए यह एक उत्कृष्ट समय है। इन ऊर्जाओं को प्रोसेस करने के लिए ध्यान या जर्नलिंग पर विचार करें।",
    "दिल के मामलों के लिए शुक्र अनुकूल स्थिति में है। यदि आप अकेले हैं, तो नए रोमांटिक अवसर प्रस्तुत हो सकते हैं। रिश्तों में रहने वालों को अपनी भावनात्मक जुड़ाव को गहरा करने पर ध्यान देना चाहिए।",
    "आपके 6वें भाव से शनि का गोचर स्वास्थ्य और दैनिक दिनचर्या पर जोर देता है। आहार, व्यायाम और कार्य-जीवन संतुलन के लिए बेहतर आदतें विकसित करने का यह आदर्श समय है।",
    "बुध वक्री आपके संचार क्षेत्र को प्रभावित कर रहा है। महत्वपूर्ण बातचीत में अतिरिक्त सचेत रहें और सभी लिखित संचार की दोबारा जांच करें।",
  ],
};

function getMockResponse(lang: string): string {
  const responses = mockResponses[lang] || mockResponses['en'];
  return responses[Math.floor(Math.random() * responses.length)];
}

function ChatContent() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { freeMessagesLeft, walletBalance, consumeMessage, openTopUp, pendingPrompt, setPendingPrompt, clearPendingPrompt } = useWallet();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasError, setHasError] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasPendingPromptRef = useRef(false);
  const prevBalanceRef = useRef(walletBalance);
  const conversationIdRef = useRef(`chat-${Date.now()}`);
  const conversationCreatedAtRef = useRef(new Date().toISOString());

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        { id: 'welcome', role: 'assistant', content: t.chat.welcome, timestamp: new Date() },
      ]);
      setIsInitializing(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [t.chat.welcome]);

  // Handle pre-filled question from HeroSection omni-search
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setInput(q);
      // Auto-send the question after welcome message loads
      const timer = setTimeout(() => {
        setInput(q);
        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: q, timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        setTimeout(() => {
          const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: getMockResponse(language), timestamp: new Date() };
          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
        }, 1500);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [searchParams, language]);

  // Scroll within the messages container only — never scroll the page
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || isInitializing) return;

    if (messages.length <= 1 && !isLoading) {
      container.scrollTop = 0;
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isLoading, isInitializing]);

  useEffect(() => {
    if (!user || isInitializing || isLoading) return;

    const userMessages = messages.filter((message) => message.role === 'user');
    if (userMessages.length === 0) return;

    saveChatHistory({
      id: conversationIdRef.current,
      userId: user.id,
      createdAt: conversationCreatedAtRef.current,
      updatedAt: new Date().toISOString(),
      title: userMessages[0].content.slice(0, 72),
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
      })),
    });
  }, [messages, isLoading, isInitializing, user]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Paywall: consume a free question or wallet credit; block if insufficient funds
    const result = consumeMessage();
    if (result === 'blocked') {
      // Store the pending prompt so it can be auto-sent after a successful wallet top-up
      setPendingPrompt(input.trim());
      openTopUp();
      return; // Preserve the typed prompt — do not clear input or send
    }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setHasError(false);

    try {
      const DEV_MODE = true;
      if (DEV_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: getMockResponse(language), timestamp: new Date() };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: input.trim(), language }) });
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response || t.chat.error, timestamp: new Date() };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch {
      setHasError(true);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: t.chat.error, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  // Auto-send the pending prompt after a successful wallet top-up (balance credited)
  useEffect(() => {
    const prevBalance = prevBalanceRef.current;
    prevBalanceRef.current = walletBalance;

    if (!pendingPrompt || hasPendingPromptRef.current) return;
    // Only resume when the wallet balance has actually increased (i.e. after payment)
    if (walletBalance <= prevBalance) return;

    const prompt = pendingPrompt;
    hasPendingPromptRef.current = true;
    clearPendingPrompt();
    setInput(prompt);
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: prompt, timestamp: new Date() }]);
    setIsLoading(true);
    setHasError(false);

    const runAssistant = async () => {
      try {
        const DEV_MODE = true;
        if (DEV_MODE) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: getMockResponse(language), timestamp: new Date() };
          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: prompt, language }) });
          if (!response.ok) throw new Error('API Error');
          const data = await response.json();
          const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response || t.chat.error, timestamp: new Date() };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch {
        setHasError(true);
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: t.chat.error, timestamp: new Date() }]);
      } finally {
        setIsLoading(false);
        hasPendingPromptRef.current = false;
      }
    };
    runAssistant();
  }, [pendingPrompt, walletBalance, clearPendingPrompt, language, t.chat.error]);

  const handleRetry = () => {
    setHasError(false);
    // Remove the error message and retry last user message
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    if (lastUserMsg) {
      setMessages(prev => prev.filter(m => m.id !== lastUserMsg.id));
      setInput(lastUserMsg.content);
    }
  };

  const clearChat = () => {
    setMessages([{ id: 'welcome', role: 'assistant', content: t.chat.welcome, timestamp: new Date() }]);
    setHasError(false);
    conversationIdRef.current = `chat-${Date.now()}`;
    conversationCreatedAtRef.current = new Date().toISOString();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-14 sm:top-16 flex flex-col overflow-hidden z-10">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/50 px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-full bg-[var(--accent)]/10">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent)]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] truncate">{t.chat.title}</h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">{t.chat.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {freeMessagesLeft > 0 ? (
              <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-600 dark:text-green-400 text-xs sm:text-sm font-semibold whitespace-nowrap">
                {t.chat.freeQuestionsLeft.replace('{count}', freeMessagesLeft.toString())}
              </span>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-xs sm:text-sm font-semibold whitespace-nowrap">
                  {t.chat.walletBalance.replace('{amount}', walletBalance.toFixed(2))}
                </span>
                <button
                  onClick={openTopUp}
                  className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs sm:text-sm font-semibold hover:shadow-glow-gold transition-all whitespace-nowrap"
                >
                  {t.chat.addMoney}
                </button>
              </div>
            )}
            {messages.length > 1 && (
              <button
                onClick={clearChat}
                className="p-2 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Clear chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Free-tier banner */}
      <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-center">
          <span className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300">{t.chat.freeBanner}</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overscroll-y-contain scrollbar-thin px-3 sm:px-4 py-4 sm:py-6"
      >
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {isInitializing ? (
            <SkeletonChat />
          ) : messages.length === 0 ? (
            <EmptyState type="no-messages" />
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent)]" />
                    </div>
                  )}
                  <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl ${message.role === 'user'
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)] rounded-br-md'
                    : message.content === t.chat.error
                      ? 'bg-red-500/10 border border-red-500/20 text-red-600 rounded-bl-md'
                      : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <div className={`text-[10px] sm:text-xs mt-1.5 ${message.role === 'user' ? 'text-[var(--bg-primary)]/60' : message.content === t.chat.error ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--bg-primary)]" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent)]" />
              </div>
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl rounded-bl-md px-3 sm:px-4 py-2.5 sm:py-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]">
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  {t.chat.loading}
                </div>
              </div>
            </motion.div>
          )}

          {hasError && (
            <div className="flex justify-center">
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] bg-[var(--bg-secondary)]/50 px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chat.placeholder}
            disabled={isLoading || isInitializing}
            className="flex-1 astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isLoading || isInitializing || !input.trim()}
            className="p-2.5 sm:p-3 rounded-lg bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="fixed inset-x-0 bottom-0 top-14 sm:top-16 flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading...
      </div>
    </div>}>
      <ChatContent />
    </Suspense>
  );
}