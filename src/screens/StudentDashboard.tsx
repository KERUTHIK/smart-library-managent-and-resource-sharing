import React, { useState, useEffect } from "react";
import { analyticsApi, booksApi } from "../api/client";
import { Card, Badge, Button, BookCover, Stars, ProgressBar } from "../components/ui";

export default function StudentDashboard({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<{
    activeLoans: any[];
    unpaidFines: any[];
    popularBooks: any[];
  }>({
    activeLoans: [],
    unpaidFines: [],
    popularBooks: [],
  });

  const currentUser = (() => {
    try {
      const u = localStorage.getItem("libsync_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      analyticsApi.getStudentStats(),
      booksApi.getBooks({ limit: 5 }),
    ])
      .then(([statsRes, booksRes]) => {
        if (!isMounted) return;
        setStudentData({
          activeLoans: statsRes.activeLoans || [],
          unpaidFines: statsRes.unpaidFines || [],
          popularBooks: booksRes.items || statsRes.popularBooks || [],
        });
      })
      .catch((err) => console.error("Error loading student dashboard:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const readingBook = studentData.activeLoans[0] || (studentData.popularBooks[0] ? {
    title: studentData.popularBooks[0].title,
    author: studentData.popularBooks[0].author,
    cover: studentData.popularBooks[0].cover,
    progress: 45,
  } : {
    title: "Database Management Systems",
    author: "Raghu Ramakrishnan",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
    progress: 60,
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Good morning, {currentUser?.name || "Student"} 👋
        </h1>
        <p className="text-[#64748b] mt-0.5">What would you like to learn today?</p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search books, authors, subjects or topics… e.g. "Books for learning machine learning"'
          className="w-full border border-[#e2e8f0] rounded-[12px] bg-white text-[#0f1f3d] placeholder:text-[#94a3b8] text-sm py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 shadow-sm"
          onKeyDown={(e) => e.key === "Enter" && onNavigate("books")}
        />
        <button onClick={() => onNavigate("books")} className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#0d9488] text-white px-4 py-1.5 rounded-[8px] text-xs font-medium cursor-pointer hover:bg-[#0f766e]">Search</button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Continue Reading */}
        <Card className="p-5">
          <h2 className="font-semibold text-[#0f1f3d] text-sm mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Continue Reading</h2>
          <div className="flex gap-4">
            <BookCover src={readingBook.cover} alt={readingBook.title} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#0f1f3d] text-sm leading-tight">{readingBook.title}</p>
              <p className="text-xs text-[#64748b] mt-0.5">{readingBook.author}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-[#64748b] mb-1">
                  <span>Progress</span>
                  <span className="font-medium text-[#0d9488]">{readingBook.progress || 50}%</span>
                </div>
                <ProgressBar value={readingBook.progress || 50} color="teal" />
              </div>
              <p className="text-[11px] text-[#94a3b8] mt-2">Active Academic Reference</p>
              <Button variant="accent" size="sm" className="mt-3 w-full" onClick={() => onNavigate("books")}>
                View Book
              </Button>
            </div>
          </div>
        </Card>

        {/* Due Soon */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#0f1f3d] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>Upcoming Due Dates</h2>
            <button onClick={() => onNavigate("my-books")} className="text-xs text-[#0d9488] hover:underline cursor-pointer">View all</button>
          </div>
          <div className="space-y-3">
            {studentData.activeLoans.length > 0 ? (
              studentData.activeLoans.slice(0, 2).map((book) => (
                <div key={book.id || book._id} className={`flex items-center gap-3 p-3 rounded-[10px] border ${book.daysRemaining <= 4 ? "border-amber-200 bg-amber-50" : "border-[#f1f5f9] bg-[#f8fafc]"}`}>
                  <BookCover src={book.cover} alt={book.title} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0f1f3d] leading-tight truncate">{book.title}</p>
                    <p className={`text-[11px] mt-0.5 font-medium ${book.daysRemaining <= 4 ? "text-amber-700" : "text-[#64748b]"}`}>
                      Due in {book.daysRemaining} days
                    </p>
                    <p className="text-[10px] text-[#94a3b8]">Due: {book.dueDate}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#94a3b8] py-4 text-center">No active loans due soon.</p>
            )}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => onNavigate("my-books")}>
            View My Books
          </Button>
        </Card>

        {/* Stats */}
        <div className="space-y-3">
          {[
            { label: "Active Loans", value: String(studentData.activeLoans.length), sub: "Borrowed items", icon: "📚", color: "bg-[#1e3a5f]/10 text-[#1e3a5f]" },
            { label: "Outstanding Fines", value: `₹${studentData.unpaidFines.reduce((acc, f) => acc + (f.amount || 0), 0)}`, sub: "Pending balance", icon: "💳", color: "bg-teal-100 text-teal-700" },
            { label: "Study Resources", value: "24+", sub: "Available across campus", icon: "⏱", color: "bg-purple-100 text-purple-700" },
          ].map((s) => (
            <Card key={s.label} className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-xl ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-lg font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.value}</p>
                <p className="text-xs text-[#64748b]">{s.label} · {s.sub}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Prepare for Exams */}
      <Card className="p-5 border-amber-100 border">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🎯</span>
          <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Prepare for Your Exams</h2>
          <Badge variant="warning" className="text-[10px]">Upcoming Semesters</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-[#0f1f3d] mb-1">Database Management Systems</p>
            <div className="flex gap-3 text-xs text-[#64748b] mb-3">
              <span className="flex items-center gap-1"><span className="text-[#0d9488]">📚</span> 5 Copies</span>
              <span className="flex items-center gap-1"><span className="text-purple-600">📱</span> E-Book Ready</span>
              <span className="flex items-center gap-1"><span className="text-amber-600">📑</span> Core Syllabus</span>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide font-medium">AI Recommended Reading</p>
              {[
                ["Database Management Systems", "Chapter 4 — Relational Model"],
                ["Computer Networks", "Chapter 5 — Transport Layer"],
                ["Operating System Concepts", "Chapter 7 — Deadlocks"],
              ].map(([book, ch]) => (
                <div key={ch} className="flex items-start gap-2 text-xs">
                  <span className="text-emerald-500 mt-0.5">→</span>
                  <div>
                    <p className="font-medium text-[#0f1f3d]">{book}</p>
                    <p className="text-[#94a3b8]">{ch}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide mb-1">Exam Preparation Progress</p>
              <p className="text-2xl font-bold text-[#0f1f3d] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>68%</p>
              <div className="w-full h-2 bg-[#f1f5f9] rounded-full mb-3">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: "68%" }} />
              </div>
            </div>
            <Button variant="accent" size="sm" onClick={() => onNavigate("exam-prep")}>
              Start Exam Preparation →
            </Button>
          </div>
        </div>
      </Card>

      {/* Recommended Books */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Recommended For You</h2>
            <p className="text-xs text-[#64748b] mt-0.5">Popular textbooks in your campus library</p>
          </div>
          <button onClick={() => onNavigate("books")} className="text-xs text-[#0d9488] hover:underline cursor-pointer font-medium">Explore all →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {studentData.popularBooks.slice(0, 5).map((book, i) => {
            return (
              <Card
                key={book.id || book._id}
                className="p-4 cursor-pointer hover:shadow-md"
                onClick={() => onNavigate("books")}
              >
                <div className="flex justify-center mb-3">
                  <BookCover src={book.cover} alt={book.title} size="lg" />
                </div>
                <p className="font-semibold text-[#0f1f3d] text-xs leading-tight line-clamp-2">{book.title}</p>
                <p className="text-[11px] text-[#64748b] mt-0.5 truncate">{book.author}</p>
                <Stars rating={book.rating || 4.5} />
                <div className="mt-2 space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-[#64748b]">
                    <svg className="text-emerald-500 flex-shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/></svg>
                    {book.dept || book.department || "Academic Reference"}
                  </div>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {book.ebook && <Badge variant="accent" className="text-[10px]">E-Book</Badge>}
                  <Badge variant={book.available > 0 || book.available === true ? "success" : "secondary"} className="text-[10px]">
                    {book.available > 0 || book.available === true ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* AI floating button */}
      <button
        onClick={() => onNavigate("ai-assistant")}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg flex items-center justify-center text-xl hover:scale-105 cursor-pointer z-40"
        title="Open AI Assistant"
        style={{ transition: "transform 150ms" }}
      >
        ✨
      </button>
    </div>
  );
}
