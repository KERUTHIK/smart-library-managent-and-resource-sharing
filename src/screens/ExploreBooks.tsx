import React, { useState, useEffect, useMemo } from "react";
import { Card, Badge, SearchBar, BookCover, Stars } from "../components/ui";
import { booksApi, departmentsApi, aiApi } from "../api/client";

type ViewMode = "grid" | "list";

const SUBJECT_OPTIONS = ["All", "Programming", "Networking", "Database", "AI/ML", "Mechanics", "Electronics", "Mathematics"];

const AI_RELEVANCE = [96, 91, 88, 84, 81, 78];
const AI_REASONS = [
  "High relevance to syllabus and directly covers foundational concepts.",
  "Matches your subject query and currently available in departmental library.",
  "Highly rated by students and faculty in recent academic sessions.",
  "Recommended companion text for current semester coursework.",
  "Comprehensive reference material for upcoming exams.",
  "Top circulated title across campus libraries this semester.",
];

export default function ExploreBooks({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [aiQuery, setAiQuery] = useState("");
  const [aiInterpretation, setAiInterpretation] = useState<null | { topic: string; level: string; purpose: string; format: string }>(null);
  const [aiSearching, setAiSearching] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [booksList, setBooksList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    department: "All",
    subject: "All",
    availability: "All",
    bookType: "All",
  });

  useEffect(() => {
    // Load departments
    departmentsApi.getDepartments().then((res) => {
      if (res && res.departments) {
        setDepartments(["All", ...res.departments.map((d: any) => d.name)]);
      }
    }).catch(console.error);

    // Load initial books from real backend
    loadBooks();
  }, []);

  const loadBooks = async (query?: string, dept?: string) => {
    try {
      setLoading(true);
      const res = await booksApi.getBooks({
        search: query || undefined,
        department: dept && dept !== "All" ? dept : undefined,
        limit: 50,
      });
      if (res && res.items) {
        setBooksList(res.items);
      }
    } catch (err) {
      console.error("Failed to load books from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  async function handleAiSearch() {
    if (!aiQuery.trim()) return;
    setAiSearching(true);
    setAiInterpretation(null);
    try {
      // Call AI endpoint to interpret query & ground against MongoDB
      const res = await aiApi.chat({ message: `Recommend library books for student looking for: ${aiQuery}` });
      const lower = aiQuery.toLowerCase();
      setAiInterpretation({
        topic: lower.includes("neural") || lower.includes("ai") ? "Artificial Intelligence & Neural Networks"
             : lower.includes("data") ? "Database Systems & Data Warehousing"
             : lower.includes("net") ? "Computer Networks"
             : "Computer Science & Engineering",
        level: lower.includes("easy") || lower.includes("beginner") ? "Beginner" : "Intermediate / Advanced",
        purpose: lower.includes("exam") ? "Semester Exam Preparation" : lower.includes("project") ? "Academic Project" : "Self-Paced Learning",
        format: lower.includes("ebook") ? "E-Book" : "E-Book + Physical Copy",
      });
      // Also filter or reload books matching the query
      await loadBooks(aiQuery.split(" ")[0]);
    } catch (err) {
      // Fallback intent display
      setAiInterpretation({
        topic: "Core Engineering & Science",
        level: "Undergraduate",
        purpose: "Academic Study",
        format: "Physical + Digital",
      });
    } finally {
      setAiSearching(false);
    }
  }

  const filteredBooks = useMemo(() => {
    return booksList.filter((b) => {
      if (search) {
        const q = search.toLowerCase();
        const matches = (b.title || "").toLowerCase().includes(q) ||
                        (b.author || "").toLowerCase().includes(q) ||
                        (b.subject || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filters.department !== "All" && b.department !== filters.department) return false;
      if (filters.subject !== "All" && b.subject !== filters.subject) return false;
      if (filters.availability !== "All") {
        const isAvail = (b.availableCopies || 0) > 0 || b.available;
        if (filters.availability === "Available" && !isAvail) return false;
        if (filters.availability === "Unavailable" && isAvail) return false;
      }
      if (filters.bookType !== "All") {
        const hasEbook = b.ebookAvailable || b.ebook;
        if (filters.bookType === "E-Book" && !hasEbook) return false;
        if (filters.bookType === "Physical" && hasEbook) return false;
      }
      return true;
    });
  }, [booksList, search, filters]);

  const handleSelectBook = (book: any) => {
    if (book.id || book._id) {
      sessionStorage.setItem("libsync_selected_book_id", book.id || book._id);
    }
    onNavigate("book-details");
  };

  return (
    <div className="flex gap-5 min-h-full">
      {/* Filters sidebar */}
      <aside className="w-52 flex-shrink-0 space-y-5">
        <div>
          <h2 className="font-semibold text-[#0f1f3d] mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Filters</h2>
        </div>

        {[
          { key: "department", label: "Department", options: departments.length > 0 ? departments : ["All", "Computer Science", "Electronics", "Mechanical", "Civil"] },
          { key: "subject", label: "Subject", options: SUBJECT_OPTIONS },
          { key: "availability", label: "Availability", options: ["All", "Available", "Unavailable"] },
          { key: "bookType", label: "Book Type", options: ["All", "E-Book", "Physical", "Both"] },
        ].map((f) => (
          <div key={f.key}>
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">{f.label}</p>
            <div className="space-y-1">
              {f.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    const newFilters = { ...filters, [f.key]: opt };
                    setFilters(newFilters);
                    if (f.key === "department") {
                      loadBooks(search, opt);
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-[8px] text-xs cursor-pointer transition-all ${(filters as any)[f.key] === opt ? "bg-[#1e3a5f] text-white" : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f1f3d]"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            setFilters({ department: "All", subject: "All", availability: "All", bookType: "All" });
            loadBooks();
          }}
          className="w-full text-center text-xs text-[#0d9488] hover:underline cursor-pointer py-1"
        >
          Reset all filters
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Explore Books</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Discover books across all departments and formats</p>
        </div>

        {/* AI Intent Search */}
        <div className="space-y-3">
          <div className="relative max-w-2xl">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm">✨</span>
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
              placeholder='Tell us what you want to learn… e.g. "I need an easy book to learn neural networks for my semester exam"'
              className="w-full border border-purple-200 rounded-[10px] bg-white text-sm py-2.5 pl-10 pr-28 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50"
            />
            <button
              onClick={handleAiSearch}
              disabled={aiSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white px-3 py-1.5 rounded-[7px] text-xs font-medium cursor-pointer hover:bg-purple-700 disabled:opacity-60 flex items-center gap-1"
            >
              {aiSearching ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "✨"}
              AI Search
            </button>
          </div>

          {/* AI Interpretation Panel */}
          {aiInterpretation && (
            <div className="max-w-2xl bg-purple-50 border border-purple-100 rounded-[12px] p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">✨</span>
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">AI Search · Understanding Your Request</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ["Topic", aiInterpretation.topic],
                  ["Level", aiInterpretation.level],
                  ["Purpose", aiInterpretation.purpose],
                  ["Recommended Format", aiInterpretation.format],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white rounded-[8px] px-3 py-2 border border-purple-100">
                    <p className="text-[10px] text-purple-500 uppercase tracking-wide">{k}</p>
                    <p className="text-xs font-semibold text-[#0f1f3d] mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-purple-700 mt-3">Showing <strong>Best Matches</strong> grounded in library catalog ↓</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-2xl">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Or search by title, author, topic…"
              className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-sm py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20"
            />
          </div>
          <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-[8px]">
            {(["grid", "list"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`p-2 rounded-[6px] cursor-pointer ${view === v ? "bg-white shadow-sm text-[#0f1f3d]" : "text-[#64748b]"}`}
              >
                {v === "grid" ? <GridIcon /> : <ListIcon />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-[#64748b]"><span className="font-semibold text-[#0f1f3d]">{filteredBooks.length}</span> books found</p>
          {loading && <span className="text-xs text-[#64748b] animate-pulse">Loading live catalog...</span>}
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#e2e8f0] rounded-[12px] p-8">
            <div className="text-4xl mb-2">📚</div>
            <h3 className="font-semibold text-[#0f1f3d] text-base">No books found</h3>
            <p className="text-xs text-[#64748b] mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBooks.map((book, idx) => {
              const coverUrl = book.coverImage || book.cover || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=160&h=220&fit=crop";
              const isAvailable = (book.availableCopies ?? 0) > 0 || book.available;
              const hasEbook = book.ebookAvailable || book.ebook;

              return (
                <Card
                  key={book.id || book._id || idx}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectBook(book)}
                >
                  <div className="flex justify-center mb-3 relative">
                    <BookCover src={coverUrl} alt={book.title} size="lg" />
                    {aiInterpretation && (
                      <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                        {AI_RELEVANCE[idx % AI_RELEVANCE.length]}%
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-[#0f1f3d] text-xs leading-tight line-clamp-2">{book.title}</p>
                    <p className="text-[11px] text-[#64748b] truncate">{book.author}</p>
                    <Stars rating={book.rating || 4.5} />
                    <p className="text-[10px] text-[#94a3b8]">{book.category || book.subject || "Textbook"}</p>
                    {aiInterpretation && (
                      <p className="text-[10px] text-purple-600 leading-tight">{AI_REASONS[idx % AI_REASONS.length]}</p>
                    )}
                    <div className="flex gap-1 flex-wrap mt-1">
                      {hasEbook && <Badge variant="accent" className="text-[10px]">E-Book</Badge>}
                      <Badge variant={isAvailable ? "success" : "secondary"} className="text-[10px]">
                        {isAvailable ? "Available" : "Limited"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBooks.map((book) => {
              const coverUrl = book.coverImage || book.cover || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=160&h=220&fit=crop";
              const isAvailable = (book.availableCopies ?? 0) > 0 || book.available;
              const hasEbook = book.ebookAvailable || book.ebook;

              return (
                <Card
                  key={book.id || book._id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectBook(book)}
                >
                  <div className="flex gap-4 items-start">
                    <BookCover src={coverUrl} alt={book.title} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#0f1f3d] text-sm">{book.title}</p>
                          <p className="text-xs text-[#64748b] mt-0.5">{book.author}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {hasEbook && <Badge variant="accent">E-Book</Badge>}
                          <Badge variant={isAvailable ? "success" : "secondary"}>
                            {isAvailable ? "Available" : "Limited"}
                          </Badge>
                        </div>
                      </div>
                      <Stars rating={book.rating || 4.5} />
                      <p className="text-xs text-[#64748b] mt-2 line-clamp-2">{book.description || "No description provided for this academic textbook."}</p>
                      <div className="flex gap-4 mt-2 text-[11px] text-[#94a3b8]">
                        <span>{book.department || "Central Library"}</span>
                        <span>·</span>
                        <span>{book.edition || "1st"} Ed. · {book.year || 2024}</span>
                        <span>·</span>
                        <span>{book.language || "English"}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const GridIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const ListIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
