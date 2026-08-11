'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, Loader2 } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

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
    "Venus is favorably positioned for matters of the heart. If you're single, new romantic opportunities may present themselves. Those in relationships should focus on deepening their emotional connection.",
    "Saturn's transit through your 6th house emphasizes health and daily routines. This is an ideal time to establish better habits around diet, exercise, and work-life balance.",
    "Mercury retrograde is affecting your communication sector. Be extra mindful in important conversations and double-check all written communications.",
    "Your Mars placement suggests high energy and motivation today. Channel this into productive activities rather than conflicts. Physical exercise will help balance this fiery energy constructively.",
    "The North Node's influence indicates karmic lessons around relationships. Pay attention to recurring patterns and consider how past actions shape your present circumstances.",
    "A favorable aspect between Jupiter and your Sun sign brings optimism and expansion. This is an excellent time for learning, teaching, or embarking on educational pursuits.",
  ],
  hi: [
    "सितारे आपके लिए परिवर्तन की अवधि का संकेत देते हैं। आपकी कुंडली में बृहस्पति का प्रभाव करियर क्षेत्र में विकास का संकेत देता है।",
    "आपका चंद्र राशि आज गहरी भावनात्मक धाराओं का खुलासा करता है। आत्मनिरीक्षण और आध्यात्मिक अभ्यास के लिए यह एक उत्कृष्ट समय है।",
    "दिल के मामलों के लिए शुक्र अनुकूल स्थिति में है। यदि आप अकेले हैं, तो नए रोमांटिक अवसर प्रस्तुत हो सकते हैं।",
    "आपके 6वें भाव से शनि का गोचर स्वास्थ्य और दैनिक दिनचर्या पर जोर देता है।",
    "बुध वक्री आपके संचार क्षेत्र को प्रभावित कर रहा है। महत्वपूर्ण बातचीत में अतिरिक्त सचेत रहें।",
  ],
};

function getMockResponse(lang: string): string {
  const responses = mockResponses[lang] || mockResponses['en'];
  return responses[Math.floor(Math.random() * responses.length)];
}

export default function ChatPage() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: t.chat.welcome, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: t.chat.error, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="p-2 rounded-full bg-[var(--accent)]/10"><Sparkles className="w-5 h-5 text-[var(--accent)]" /></div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">{t.chat.title}</h1>
            <p className="text-xs text-[var(--text-muted)]">{t.chat.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center"><Bot className="w-4 h-4 text-[var(--accent)]" /></div>}
                <div className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl ${message.role === 'user' ? 'bg-[var(--accent)] text-[var(--bg-primary)] rounded-br-md' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-md'}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-[var(--bg-primary)]/60' : 'text-[var(--text-muted)]'}`}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                {message.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center"><User className="w-4 h-4 text-[var(--bg-primary)]" /></div>}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center"><Bot className="w-4 h-4 text-[var(--accent)]" /></div>
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]"><Loader2 className="w-4 h-4 animate-spin" />{t.chat.loading}</div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-[var(--border)] bg-[var(--bg-secondary)]/50 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={t.chat.placeholder} disabled={isLoading} className="flex-1 astro-input py-3 px-4" />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 rounded-lg bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"><Send className="w-5 h-5" /></motion.button>
        </div>
      </div>
    </div>
  );
}
