import React, { useState, useEffect } from "react";
import { Card, Badge, Button, Stars, Modal, BookCover } from "../components/ui";
import { booksApi, requestsApi, departmentsApi } from "../api/client";

interface Props {
  onNavigate: (s: string) => void;
  onRequest?: () => void;
}

export default function BookDetails({ onNavigate, onRequest }: Props) {
  const [book, setBook] = useState<any>(null);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [pickupLocation, setPickupLocation] = useState("Main Library");
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestResult, setRequestResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const selectedId = sessionStorage.getItem("libsync_selected_book_id");

    async function loadBookData() {
      try {
        setLoading(true);
        let currentBook: any = null;

        if (selectedId) {
          try {
            const res = await booksApi.getBookById(selectedId);
            if (res && res.book) {
              currentBook = res.book;
            }
          } catch (e) {
            console.warn("Could not fetch book by ID, falling back to catalog search", e);
          }
        }

        if (!currentBook) {
          const listRes = await booksApi.getBooks({ limit: 1 });
          if (listRes && listRes.items && listRes.items.length > 0) {
            currentBook = listRes.items[0];
          }
        }

        if (currentBook) {
          setBook(currentBook);
          // Load related books in same department or subject
          const relRes = await booksApi.getBooks({
            department: currentBook.department,
            limit: 5,
          });
          if (relRes && relRes.items) {
            setRelatedBooks(relRes.items.filter((b: any) => (b.id || b._id) !== (currentBook.id || currentBook._id)).slice(0, 4));
          }
        }

        const deptRes = await departmentsApi.getDepartments();
        if (deptRes && deptRes.departments) {
          const names = deptRes.departments.map((d: any) => d.name);
          setDepartments(names);
          if (names.length > 0) setPickupLocation(names[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load book details");
      } finally {
        setLoading(false);
      }
    }

    loadBookData();
  }, []);

  async function handleSendRequest() {
    if (!book) return;
    try {
      setSubmitting(true);
      const bookId = book.id || book._id;
      const res = await requestsApi.createRequest({
        bookId,
        preferredPickupLocation: pickupLocation,
      });
      setRequestResult(res);
      setRequestSent(true);
      if (onRequest) onRequest();
    } catch (err: any) {
      alert(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  }

  const tabs = [
    { id: "info", label: "Book Info" },
    { id: "toc", label: "Table of Contents" },
    { id: "related", label: "Related Books" },
    { id: "reviews", label: "Reviews" },
  ];

  if (loading) {
    return (
      <div className="max-w-5xl py-24 text-center">
        <div className="w-8 h-8 border-3 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#64748b]">Loading book record from catalog...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-5xl py-16 text-center">
        <p className="text-base text-[#0f1f3d] font-semibold">Book not found</p>
        <Button variant="primary" className="mt-4" onClick={() => onNavigate("explore")}>
          Back to Catalog
        </Button>
      </div>
    );
  }

  const coverUrl = book.coverImage || book.cover || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=240&h=320&fit=crop";
  const isAvailable = (book.availableCopies ?? 0) > 0 || book.available;
  const hasEbook = book.ebookAvailable || book.ebook;

  const copies = [
    { lib: `${book.department || "Dept"} Library`, count: book.availableCopies || 1 },
    { lib: "Main Central Library", count: Math.max(0, (book.totalCopies || 2) - 1) },
  ];

  return (
    <div className="max-w-5xl space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <button onClick={() => onNavigate("explore")} className="hover:text-[#0d9488] cursor-pointer">Explore Books</button>
        <span>/</span>
        <button onClick={() => onNavigate("explore")} className="hover:text-[#0d9488] cursor-pointer">{book.department || "Academic"}</button>
        <span>/</span>
        <span className="text-[#0f1f3d] font-medium truncate max-w-sm">{book.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: cover + actions */}
        <div className="space-y-4">
          <div className="w-full aspect-[3/4] max-w-[200px] mx-auto rounded-[12px] overflow-hidden shadow-lg bg-slate-200">
            <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            {hasEbook && (
              <Button
                variant="accent"
                className="w-full"
                size="lg"
                onClick={() => {
                  if (book.ebookPdfUrl) {
                    window.open(book.ebookPdfUrl, "_blank");
                  } else {
                    onNavigate("ebooks");
                  }
                }}
              >
                📖 Read E-Book
              </Button>
            )}
            <Button variant="primary" className="w-full" onClick={() => setRequestOpen(true)}>
              📦 Request Physical Book
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onNavigate("study-folders")}
            >
              📁 Add to Folder
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                sessionStorage.setItem("libsync_ai_prompt", `Can you summarize the main concepts in ${book.title} by ${book.author}?`);
                onNavigate("ai-assistant");
              }}
            >
              ✨ Ask AI About This Book
            </Button>
          </div>
        </div>

        {/* Right: details */}
        <div className="md:col-span-2 space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#0f1f3d] leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {book.title}
                </h1>
                <p className="text-[#64748b] mt-1">{book.author}</p>
              </div>
              <Badge variant="accent" className="flex-shrink-0">{book.category || book.subject || "Textbook"}</Badge>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Stars rating={book.rating || 4.5} />
              <span className="text-xs text-[#64748b]">{book.borrowCount || 128} borrows</span>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["ISBN", book.isbn || "N/A"],
              ["Publisher", book.publisher || "Academic Press"],
              ["Edition", `${book.edition || "1st"} Edition`],
              ["Year", String(book.year || 2024)],
              ["Subject", book.subject || "Engineering"],
              ["Language", book.language || "English"],
            ].map(([k, v]) => (
              <div key={k} className="bg-[#f8fafc] rounded-[8px] px-3 py-2">
                <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide">{k}</p>
                <p className="text-xs font-medium text-[#0f1f3d] mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-[#0f1f3d] mb-2">About this book</h3>
            <p className="text-sm text-[#64748b] leading-relaxed">
              {book.description || "Comprehensive textbook aligned with institution syllabus. Includes fundamental concepts, solved examples, and practice problems."}
            </p>
          </div>

          {/* Campus Availability */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-[#0f1f3d] mb-3">Campus Availability</h3>
            {hasEbook && (
              <div className="flex items-center gap-3 mb-3 p-2.5 bg-emerald-50 rounded-[8px] border border-emerald-100">
                <svg className="text-emerald-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/></svg>
                <span className="text-sm font-medium text-emerald-700">E-Book Available — Read instantly</span>
              </div>
            )}
            <p className="text-xs font-medium text-[#64748b] mb-2">Physical Copies Across All Libraries</p>
            <div className="space-y-2">
              {copies.map(({ lib, count }) => (
                <div key={lib} className="flex items-center justify-between py-2 border-b border-[#f1f5f9] last:border-0">
                  <span className="text-sm text-[#0f1f3d]">{lib}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${count > 0 ? "text-emerald-700" : "text-red-500"}`}>
                      {count} {count === 1 ? "copy" : "copies"}
                    </span>
                    <Badge variant={count > 0 ? "success" : "danger"}>{count > 0 ? "Available" : "Unavailable"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Smart Availability — AI */}
          <Card className="p-4 border-purple-100 border">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">✨</span>
              <h3 className="text-sm font-semibold text-[#0f1f3d]">Smart Availability & Routing</h3>
              <Badge variant="secondary" className="text-[10px]">Auto-Routed</Badge>
            </div>
            <div className="bg-purple-50 rounded-[10px] p-3 mb-3">
              <p className="text-xs text-purple-600 font-semibold mb-1">
                Optimized Source: {book.department || "Central"} Library
              </p>
              <div className="space-y-1">
                {[
                  `${book.availableCopies || 1} available copy in institution repository`,
                  "Automatic inter-department transfer if closest shelf copy is checked out",
                  "Guaranteed 14-day loan with up to 2 online renewals",
                  "Automated return fine tracking at ₹5/day after due date",
                ].map((r) => (
                  <div key={r} className="flex items-center gap-1.5 text-xs text-[#64748b]">
                    <svg className="text-emerald-500 flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/></svg>
                    {r}
                  </div>
                ))}
              </div>
            </div>
            <Button variant="accent" size="sm" className="w-full" onClick={() => setRequestOpen(true)}>
              Request Book Pickup
            </Button>
          </Card>
        </div>
      </div>

      {/* Tab content */}
      <Card className="p-5">
        <div className="flex gap-1 border-b border-[#f1f5f9] mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium cursor-pointer border-b-2 transition-all ${activeTab === t.id ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-[#64748b] hover:text-[#0f1f3d]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-[#0f1f3d] mb-3">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {(book.keywords && book.keywords.length > 0 ? book.keywords : [book.subject, book.category, "Textbook", "Reference", "Syllabus"]).filter(Boolean).map((k: string) => (
                  <span key={k} className="px-2.5 py-1 bg-[#f1f5f9] text-xs text-[#64748b] rounded-full">{k}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0f1f3d] mb-3">Course Relevance</h3>
              <div className="space-y-1.5">
                {[
                  `${book.department || "Core"} 301 — Fundamental Concepts`,
                  `${book.department || "Core"} 412 — Advanced Theory & Practice`,
                  `${book.department || "Core"} 501 — Capstone Project Reference`,
                ].map((c) => (
                  <div key={c} className="flex items-center gap-2 text-xs text-[#64748b]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "toc" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "1. Introduction and Architectural Overview",
              "2. Fundamental Principles and Equations",
              "3. Design Methodologies and Core Tools",
              "4. Advanced Modeling and Systematic Analysis",
              "5. Practical Implementation and Case Studies",
              "6. Optimization Techniques and Trade-offs",
              "7. Safety, Verification, and Testing",
              "8. Emerging Frontiers and Recent Advances",
            ].map((ch, i) => (
              <div key={ch} className="flex items-center gap-3 py-2 border-b border-[#f8fafc]">
                <span className="text-xs font-mono text-[#94a3b8] w-8">Ch {i + 1}</span>
                <span className="text-sm text-[#0f1f3d]">{ch}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "related" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedBooks.length === 0 ? (
              <p className="text-xs text-[#94a3b8] col-span-4">No additional related titles currently in this subject area.</p>
            ) : (
              relatedBooks.map((b) => (
                <div
                  key={b.id || b._id}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    sessionStorage.setItem("libsync_selected_book_id", b.id || b._id);
                    setBook(b);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <BookCover src={b.coverImage || b.cover || coverUrl} alt={b.title} size="md" />
                  <p className="text-xs font-medium text-[#0f1f3d] mt-2 line-clamp-2">{b.title}</p>
                  <p className="text-[11px] text-[#64748b]">{b.author}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {[
              { name: "Arun Kumar", rating: 5, review: "Essential resource for semester preparation. Well-structured problems and great explanations." },
              { name: "Priya Sharma", rating: 4, review: "Clear theoretical explanations with helpful real-world campus lab examples." },
              { name: "Kiran Reddy", rating: 5, review: "Recommended by our course instructor. Comprehensive and up-to-date." },
            ].map((r, i) => (
              <div key={i} className="border-b border-[#f8fafc] pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center font-medium">{r.name[0]}</div>
                  <span className="text-sm font-medium text-[#0f1f3d]">{r.name}</span>
                  <Stars rating={r.rating} />
                </div>
                <p className="text-sm text-[#64748b] leading-relaxed">{r.review}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Physical Book Request Modal */}
      <Modal open={requestOpen} onClose={() => { setRequestOpen(false); setRequestSent(false); }} title="Request Physical Book">
        {!requestSent ? (
          <div className="space-y-4">
            <div className="flex gap-3 bg-[#f8fafc] rounded-[10px] p-3">
              <BookCover src={coverUrl} alt={book.title} size="sm" />
              <div>
                <p className="font-semibold text-[#0f1f3d] text-sm">{book.title}</p>
                <p className="text-xs text-[#64748b]">{book.author}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#0f1f3d] block mb-2">Preferred Pickup Location</label>
              <select
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-sm py-2.5 px-3 focus:outline-none focus:border-[#0d9488]"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-[#64748b] mb-2">Availability Status</p>
              <div className="flex items-center justify-between py-1.5 text-sm">
                <span>{book.department || "Host"} Library</span>
                <span className={`text-xs font-semibold ${isAvailable ? "text-emerald-700" : "text-amber-600"}`}>
                  {isAvailable ? `${book.availableCopies || 1} available on shelf` : "Auto-routed to Central / Transfer"}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-[10px] p-3 text-xs text-blue-700">
              📦 LibSync multi-tier routing will automatically allocate an on-shelf copy or arrange an inter-department transfer.
            </div>

            <div className="flex gap-2">
              <Button variant="accent" className="flex-1" disabled={submitting} onClick={handleSendRequest}>
                {submitting ? "Submitting Request..." : "Send Request"}
              </Button>
              <Button variant="outline" onClick={() => setRequestOpen(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
            <h3 className="text-lg font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Request Submitted!</h3>
            <p className="text-sm text-[#64748b] mt-1 max-w-xs mx-auto">
              Your borrow request has been recorded in MongoDB. The library desk will verify and issue your copy.
            </p>
            {requestResult?.routing && (
              <p className="text-xs text-purple-700 mt-2 font-medium">
                Routing: {requestResult.routing.routeType}
              </p>
            )}
            <Button variant="primary" className="mt-5" onClick={() => { setRequestOpen(false); setRequestSent(false); onNavigate("my-books"); }}>
              View My Requests
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
