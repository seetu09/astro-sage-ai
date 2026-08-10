"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Star, User, Sparkles, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Namaste! I am your AI Astrologer. How can I help you today? Ask me about your career, relationships, health, or any life question." 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I am having trouble connecting to the cosmic realm right now. Please try again in a moment." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What does my birth chart say about my career?",
    "When will I get married?",
    "Is this a good time to start a business?",
    "What are my lucky colors for this week?",
  ];

  return (
    <main className="min-h-screen pt-20 pb-4 flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-3">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-sm text-gold-400">AI-Powered Vedic Astrologer</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Talk to <span className="text-gradient">AstroSage AI</span></h1>
        </div>

        {/* Chat Container */}
        <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden min-h-[60vh]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500 to-amber-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Star className="w-4 h-4 text-cosmic-900" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user" 
                    ? "bg-gradient-to-r from-gold-500/20 to-amber-500/20 border border-gold-500/20 text-white" 
                    : "bg-white/5 text-slate-200"
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-cosmic-900 animate-pulse" />
                </div>
                <div className="bg-white/5 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Consulting the stars...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-slate-500 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-slate-400 hover:text-gold-400 hover:bg-white/10 transition-all border border-white/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask your astrologer..."
                rows={1}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="px-4 py-3 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all"
              >
                <Send className="w-5 h-5 text-cosmic-900" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
