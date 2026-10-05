import React, { useState, useRef, useEffect } from "react";
import { aiApi } from "../api/client";
import { Card } from "../components/ui";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  sources?: { title: string; chapter?: string; page?: number; previewSnippet?: string }[];
  thinking?: boolean;
};

const SUGGESTED_PROMPTS = [
  "Explain database normalization from my books.",
  "What are the main layers of the OSI model?",
  "Explain ACID properties with real-world examples.",
  "Summarize key algorithms in machine learning.",
  "Generate exam questions on Operating Systems.",
  "How does deadlock avoidance differ from prevention?",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: "m0",
        role: "assistant",
        content: "Hello! I am LibSync AI. I am grounded in your college's physical catalog, digital e-books, and syllabus materials. Ask me any question, request exam topic summaries, or find citations from your curriculum.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: [
          { title: "Database Management Systems" },
          { title: "Computer Networks" },
          { title: "Operating System Concepts" },
        ],
      },
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = text || input.trim();
    if (!content) return;
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const thinkingMsg: Message = {
      id: Date.now().toString() + "-t",
      role: "assistant",
      content: "",
      time: "",
      thinking: true,
    };

    setMessages((m) => [...m, userMsg, thinkingMsg]);
    setIsTyping(true);

    try {
      const res = await aiApi.chat({
        message: content,
        conversationId,
      });

      if (res.conversationId) {
        setConversationId(res.conversationId);
      }

      const aiMsg: Message = {
        id: Date.now().toString() + "-a",
        role: "assistant",
        content: res.answer || "I found relevant references in your library books.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: res.sources,
      };

      setMessages((m) => [...m.filter((x) => !x.thinking), aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: Date.now().toString() + "-err",
        role: "assistant",
        content: `Error connecting to AI service: ${err.message || "Please check server connectivity"}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((m) => [...m.filter((x) => !x.thinking), errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-130px)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-2xl shadow-md">
          ✨
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>LibSync AI</h1>
          <p className="text-xs text-[#64748b]">Grounded in verified institutional textbook catalog · Powered by RAG</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            MongoDB Connected
          </span>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-none">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-[#e2e8f0] bg-white text-[#64748b] hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50 cursor-pointer transition-all"
          >
            ✨ {p}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <Card className="flex-1 overflow-y-auto p-5 space-y-4 mb-4 min-h-[300px]">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-sm text-white flex-shrink-0 mt-0.5 shadow-sm">
                ✨
              </div>
            )}
            {m.role === "user" && (
              <div className="w-8 h-8 rounded-[10px] bg-[#1e3a5f] flex items-center justify-center text-xs text-white flex-shrink-0 mt-0.5 font-bold">
                U
              </div>
            )}

            <div className={`max-w-[80%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
              <div
                className={`rounded-[14px] p-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#1e3a5f] text-white rounded-tr-none"
                    : "bg-[#f8fafc] border border-[#e2e8f0] text-[#0f1f3d] rounded-tl-none"
                }`}
              >
                {m.thinking ? (
                  <div className="flex items-center gap-2 text-[#94a3b8] py-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs ml-1 font-medium">Searching catalog & synthesizing answer…</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                )}
              </div>

              {/* Sources */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-[#94a3b8] self-center">Sources:</span>
                  {m.sources.map((s, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-md font-medium">
                      📖 {s.title} {s.chapter ? `· ${s.chapter}` : ""}
                    </span>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-[#94a3b8] mt-1 px-1">{m.time}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </Card>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your syllabus, textbooks, or library collection…"
            disabled={isTyping}
            className="w-full border border-[#e2e8f0] rounded-[12px] bg-white text-[#0f1f3d] placeholder:text-[#94a3b8] text-sm py-3.5 pl-4 pr-12 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 rounded-[12px] font-medium text-sm hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-md flex items-center gap-1.5 transition-opacity"
        >
          <span>Ask AI</span>
          <span>→</span>
        </button>
      </form>
    </div>
  );
}
