import React, { useState, useEffect } from "react";
import { Card, Button, Badge, ProgressBar, BookCover } from "../components/ui";
import { booksApi, aiApi } from "../api/client";

export default function ExamPrep({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [activeTab, setActiveTab] = useState("books");
  const [aiNotes, setAiNotes] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string>("");
  const [books, setBooks] = useState<any[]>([]);

  const tabs = ["books", "chapters", "ebooks", "ai-notes", "practice"];

  useEffect(() => {
    booksApi.getBooks({ limit: 6 }).then((res) => {
      if (res && res.items) {
        setBooks(res.items);
      }
    }).catch(console.error);
  }, []);

  async function generateNotes() {
    setAiLoading(true);
    try {
      const res = await aiApi.chat({
        message: "Please generate concise revision notes for Database Management Systems exam, covering Relational Model, SQL Fundamentals, Normalization (1NF, 2NF, 3NF, BCNF), and ACID Transactions with key definitions.",
      });
      if (res && res.answer) {
        setAiGeneratedContent(res.answer);
      }
      setAiNotes(true);
      setActiveTab("ai-notes");
    } catch (err) {
      console.error(err);
      setAiNotes(true);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => onNavigate("dashboard")} className="text-xs text-[#64748b] hover:text-[#0d9488] cursor-pointer">← Dashboard</button>
            <span className="text-[#94a3b8]">/</span>
            <span className="text-xs text-[#0f1f3d] font-medium">Exam Preparation</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Database Management Systems
          </h1>
          <p className="text-[#64748b] text-sm mt-0.5">Exam in 14 days · Semester 5 · Computer Science</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#64748b]">Preparation Progress</p>
          <p className="text-3xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>42%</p>
          <div className="w-32 mt-1">
            <ProgressBar value={42} color="amber" />
          </div>
        </div>
      </div>

      {/* Exam countdown */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { val: "14", label: "Days Left" },
          { val: `${books.length || 5}`, label: "Books" },
          { val: "6", label: "Key Chapters" },
          { val: "3", label: "Practice Sets" },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.val}</p>
            <p className="text-xs text-[#64748b] mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* AI Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="accent" size="sm" onClick={generateNotes} disabled={aiLoading}>
          {aiLoading ? "Generating..." : "✨ Generate AI Revision Notes"}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onNavigate("ai-assistant")}>✨ Generate Practice Questions</Button>
        <Button variant="ghost" size="sm" onClick={() => onNavigate("ai-assistant")}>Ask AI Assistant</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#f1f5f9]">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-sm font-medium cursor-pointer border-b-2 transition-all capitalize ${activeTab === t ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-[#64748b] hover:text-[#0f1f3d]"}`}
          >
            {t === "ebooks" ? "E-Books" : t === "ai-notes" ? "AI Revision Notes" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "books" && (
        <div className="space-y-3">
          {books.map((book, i) => {
            const progress = [65, 20, 80, 100, 0, 40][i % 6];
            const coverUrl = book.coverImage || book.cover || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=160&h=220&fit=crop";
            return (
              <Card key={book.id || book._id || i} className="p-4 flex items-center gap-4">
                <BookCover src={coverUrl} alt={book.title} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#0f1f3d] text-sm">{book.title}</p>
                      <p className="text-xs text-[#64748b]">{book.author}</p>
                    </div>
                    {progress === 100 ? (
                      <Badge variant="success">Complete</Badge>
                    ) : progress > 0 ? (
                      <Badge variant="warning">In Progress</Badge>
                    ) : (
                      <Badge variant="secondary">Not Started</Badge>
                    )}
                  </div>
                  {progress > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#64748b]">Reading progress</span>
                        <span className="font-medium text-[#0d9488]">{progress}%</span>
                      </div>
                      <ProgressBar value={progress} color={progress === 100 ? "teal" : "amber"} />
                    </div>
                  )}
                </div>
                <Button
                  variant={book.ebookAvailable ? "accent" : "outline"}
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => {
                    sessionStorage.setItem("libsync_selected_book_id", book.id || book._id);
                    onNavigate("book-details");
                  }}
                >
                  {book.ebookAvailable ? "Read Now" : "Request"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "chapters" && (
        <div className="space-y-2">
          {[
            { ch: "Chapter 1", title: "Introduction to Databases", priority: "HIGH", done: true },
            { ch: "Chapter 2", title: "Relational Model & Integrity Constraints", priority: "HIGH", done: true },
            { ch: "Chapter 3", title: "SQL Basics & Join Queries", priority: "HIGH", done: false },
            { ch: "Chapter 4", title: "Advanced SQL, Views & Triggers", priority: "HIGH", done: false },
            { ch: "Chapter 5", title: "Database Design & ER Model", priority: "MEDIUM", done: false },
            { ch: "Chapter 7", title: "Normalization & Functional Dependencies", priority: "HIGH", done: false },
            { ch: "Chapter 8", title: "Transaction Management & ACID Properties", priority: "MEDIUM", done: false },
            { ch: "Chapter 9", title: "Concurrency Control & 2PL Protocols", priority: "LOW", done: false },
          ].map((ch) => (
            <Card key={ch.ch} className="px-4 py-3 flex items-center gap-3">
              <input type="checkbox" checked={ch.done} readOnly className="w-4 h-4 accent-[#0d9488]" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-[#0f1f3d]">{ch.ch} — {ch.title}</p>
                  <Badge variant={ch.priority === "HIGH" ? "danger" : ch.priority === "MEDIUM" ? "warning" : "secondary"} className="text-[10px]">
                    {ch.priority}
                  </Badge>
                  {ch.priority === "HIGH" && <span className="text-[10px] text-purple-600">✨ AI Flagged</span>}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("ai-assistant")}>Ask AI</Button>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "ebooks" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.filter((b) => b.ebookAvailable).map((book) => {
            const coverUrl = book.coverImage || book.cover || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=160&h=220&fit=crop";
            return (
              <Card key={book.id || book._id} className="p-4 flex gap-3">
                <BookCover src={coverUrl} alt={book.title} size="md" />
                <div className="flex-1">
                  <p className="font-semibold text-[#0f1f3d] text-sm">{book.title}</p>
                  <p className="text-xs text-[#64748b]">{book.author}</p>
                  <Badge variant="accent" className="mt-1 text-[10px]">E-Book Available</Badge>
                  <Button
                    variant="accent"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      if (book.ebookPdfUrl) window.open(book.ebookPdfUrl, "_blank");
                      else onNavigate("ebooks");
                    }}
                  >
                    Read Now
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "ai-notes" && (
        <Card className="p-6">
          {aiLoading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3 text-2xl">✨</div>
              <p className="font-medium text-[#0f1f3d]">Generating AI Revision Notes…</p>
              <p className="text-xs text-[#64748b] mt-1">Analyzing curriculum and textbook chapters</p>
              <div className="mt-4 flex justify-center gap-2">
                {[0,1,2].map((i) => <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
              </div>
            </div>
          )}
          {aiNotes && !aiLoading && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">✨</span>
                <h3 className="font-semibold text-[#0f1f3d]">AI Revision Notes — DBMS</h3>
                <Badge variant="secondary" className="text-[10px]">Grounded in Library Knowledge Base</Badge>
              </div>
              {aiGeneratedContent ? (
                <div className="prose prose-sm text-sm text-[#334155] whitespace-pre-wrap leading-relaxed">
                  {aiGeneratedContent}
                </div>
              ) : (
                <div className="space-y-4 text-sm text-[#64748b] leading-relaxed">
                  <div>
                    <p className="font-semibold text-[#0f1f3d] mb-1">1. Relational Model</p>
                    <p>A database is organized as relations (tables). Each relation consists of tuples (rows) and attributes (columns). Integrity constraints like Primary Key and Foreign Key enforce data consistency across departmental boundaries.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0f1f3d] mb-1">2. Normalization</p>
                    <p>Systematic approach of decomposing tables to eliminate data redundancy and insertion/deletion anomalies: 1NF (atomic attributes), 2NF (no partial functional dependency), 3NF (no transitive dependency), and BCNF.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0f1f3d] mb-1">3. Transaction Management & ACID</p>
                    <p>Atomicity (all or nothing), Consistency (preserves invariants), Isolation (serializable concurrent execution), and Durability (persisted post commit even across system crashes).</p>
                  </div>
                </div>
              )}
              <Button variant="outline" size="sm" className="mt-4" onClick={() => onNavigate("ai-assistant")}>
                Ask AI to Explain Further
              </Button>
            </div>
          )}
          {!aiNotes && !aiLoading && (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">✨</div>
              <p className="font-semibold text-[#0f1f3d]">Generate AI Revision Notes</p>
              <p className="text-sm text-[#64748b] mt-1 max-w-xs mx-auto">AI will create concise revision notes from all your exam preparation books.</p>
              <Button variant="accent" className="mt-4" onClick={generateNotes}>Generate Now</Button>
            </div>
          )}
        </Card>
      )}

      {activeTab === "practice" && (
        <div className="space-y-3">
          {[
            { q: "What is the difference between a primary key and a foreign key?", difficulty: "Easy", done: true },
            { q: "Explain the ACID properties of database transactions with examples.", difficulty: "Medium", done: true },
            { q: "Normalize the following relation to 3NF: Employee(EmpID, Name, DeptID, DeptName, ManagerID)", difficulty: "Hard", done: false },
            { q: "What is a deadlock? How can it be prevented in a DBMS?", difficulty: "Medium", done: false },
            { q: "Explain the difference between clustered and non-clustered indexes.", difficulty: "Medium", done: false },
          ].map((q, i) => (
            <Card key={i} className="p-4 flex items-start gap-3">
              <input type="checkbox" checked={q.done} readOnly className="mt-0.5 w-4 h-4 accent-[#0d9488]" />
              <div className="flex-1">
                <p className="text-sm text-[#0f1f3d]">{q.q}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant={q.difficulty === "Hard" ? "danger" : q.difficulty === "Medium" ? "warning" : "success"} className="text-[10px]">{q.difficulty}</Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  sessionStorage.setItem("libsync_ai_prompt", `Answer this exam practice question: ${q.q}`);
                  onNavigate("ai-assistant");
                }}
              >
                Get Answer
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
