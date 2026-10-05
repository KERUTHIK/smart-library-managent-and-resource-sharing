import { useState, useRef, useEffect } from "react";
import { ebooksApi } from "../api/client";
import { Card, KpiCard, Badge, Button, BookCover, Stars, Modal, Input, Textarea, Select } from "../components/ui";

interface EBook {
  id: string | number;
  _id?: string;
  title: string;
  author: string;
  dept: string;
  subject: string;
  format: string;
  pages: number;
  rating: number;
  cover: string;
  size: string;
  year: number;
}

const DEPT_OPTIONS = [
  { value: "", label: "All Departments" },
  { value: "CSE", label: "Computer Science" },
  { value: "ECE", label: "Electronics" },
  { value: "Mechanical", label: "Mechanical" },
  { value: "Mathematics", label: "Mathematics" },
];

const SUBJECT_OPTIONS = [
  { value: "", label: "All Subjects" },
  { value: "Database Systems", label: "Database Systems" },
  { value: "Networking", label: "Networking" },
  { value: "Operating Systems", label: "Operating Systems" },
  { value: "AI & ML", label: "AI & ML" },
  { value: "Algorithms", label: "Algorithms" },
  { value: "Digital Logic", label: "Digital Logic" },
  { value: "Signal Processing", label: "Signal Processing" },
  { value: "Applied Math", label: "Applied Math" },
  { value: "Discrete Math", label: "Discrete Math" },
  { value: "Fluid Dynamics", label: "Fluid Dynamics" },
];

interface Props {
  role: "admin" | "librarian" | "student";
  onNavigate: (s: string) => void;
}

export default function EBooksPage({ role, onNavigate }: Props) {
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<EBook | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "az">("recent");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [addEbookOpen, setAddEbookOpen] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", author: "", dept: "CSE", subject: "", isbn: "", year: "", publisher: "", language: "English" });
  const [addToast, setAddToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ebooksApi
      .getEBooks({ search, department: deptFilter })
      .then((res) => {
        if (res.ebooks) {
          const mapped: EBook[] = res.ebooks.map((e: any, i: number) => ({
            id: e._id || i + 1,
            _id: e._id,
            title: e.title,
            author: e.author || "Academic Author",
            dept: e.departmentName || "CSE",
            subject: e.subject || "Computer Science",
            format: e.format || "PDF",
            pages: e.pageCount || 450,
            rating: e.rating || 4.8,
            cover: e.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
            size: `${((e.fileSizeBytes || 15000000) / (1024 * 1024)).toFixed(1)} MB`,
            year: e.publicationYear || 2022,
          }));
          setEbooks(mapped);
        }
      })
      .catch((err) => console.error("Error loading ebooks:", err))
      .finally(() => setLoading(false));
  }, [search, deptFilter]);

  const isStudentRole = role === "student";

  function openReader(book: EBook) {
    setSelectedBook(book);
    setCurrentPage(1);
    setReaderOpen(true);
  }

  function closeReader() {
    setReaderOpen(false);
    if (document.fullscreenElement) document.exitFullscreen();
    setIsFullscreen(false);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  function handleDownload() {
    if (!selectedBook) return;
    const a = document.createElement("a");
    a.href = selectedBook.cover;
    a.download = `${selectedBook.title}.pdf`;
    a.click();
  }

  function handleAddEbook() {
    setAddToast(true);
    setAddEbookOpen(false);
    setAddForm({ title: "", author: "", dept: "CSE", subject: "", isbn: "", year: "", publisher: "", language: "English" });
    setTimeout(() => setAddToast(false), 3500);
  }

  const sorted = [...EBOOKS]
    .filter((b) => {
      const q = search.toLowerCase();
      const matchSearch = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      const matchDept = !deptFilter || b.dept === deptFilter;
      const matchSubject = !subjectFilter || b.subject === subjectFilter;
      return matchSearch && matchDept && matchSubject;
    })
    .sort((a, b) => {
      if (sortBy === "az") return a.title.localeCompare(b.title);
      if (sortBy === "popular") return b.rating - a.rating;
      return b.year - a.year;
    });

  // ── PDF Reader View ──────────────────────────────────────────────────────────
  if (readerOpen && selectedBook) {
    return (
      <div ref={readerRef} className="h-screen flex flex-col bg-[#f1f5f9]">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#e2e8f0] shadow-sm flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={closeReader}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            Back to E-Books
          </Button>
          <div className="text-center hidden sm:block">
            <p className="text-sm font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{selectedBook.title}</p>
            <p className="text-xs text-[#64748b]">{selectedBook.author}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-[#e2e8f0] rounded-[8px] overflow-hidden">
              <button
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
                className="px-2.5 py-1.5 text-sm text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
              >
                &#8722;
              </button>
              <span className="px-2 py-1.5 text-xs font-medium text-[#0f1f3d] border-x border-[#e2e8f0] min-w-[48px] text-center">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(200, z + 10))}
                className="px-2.5 py-1.5 text-sm text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
              >
                &#43;
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isFullscreen
                  ? <><path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" /></>
                  : <><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></>}
              </svg>
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Download
            </Button>
          </div>
        </div>

        {/* Reader Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* PDF Page Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
            <div
              className="w-full max-w-[680px] bg-white rounded-[14px] shadow-sm p-10"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
            >
              {/* Page Content */}
              <div className="text-[#0f1f3d]" style={{ fontFamily: "Georgia, serif" }}>
                <p className="text-xs text-[#94a3b8] uppercase tracking-widest mb-6">Chapter 4</p>
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Chapter 4: Relational Model</h2>
                <p className="text-sm leading-7 text-[#374151] mb-4">
                  The relational model uses a collection of tables to represent both data and the relationships among those data.
                  Each table has multiple columns, and each column has a unique name. A row in a table represents a relationship
                  among a set of values. A table is also called a relation, as it is in the mathematical concept of a relation.
                </p>
                <p className="text-sm leading-7 text-[#374151] mb-4">
                  The relational model is today the primary data model for commercial data-processing applications. It has attained
                  its central position because of its simplicity, which eases the job of the programmer, compared to earlier models
                  such as the network model or the hierarchical model. In this chapter, we first study the fundamentals of the
                  relational model and introduce the formal notation used throughout the book.
                </p>

                {/* Simple table mockup */}
                <div className="my-6 border border-[#e2e8f0] rounded-[8px] overflow-hidden text-xs">
                  <div className="bg-[#f8fafc] px-4 py-2 text-[#64748b] font-medium text-[11px] uppercase tracking-wide border-b border-[#e2e8f0]">
                    Figure 4.1 — The instructor relation
                  </div>
                  <table className="w-full">
                    <thead className="bg-[#f1f5f9]">
                      <tr>
                        {["ID", "Name", "Dept Name", "Salary"].map((h) => (
                          <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-[#374151] border-r border-[#e2e8f0] last:border-r-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["10101", "Srinivasan", "Comp. Sci.", "65000"],
                        ["12121", "Wu", "Finance", "90000"],
                        ["15151", "Mozart", "Music", "40000"],
                        ["22222", "Einstein", "Physics", "95000"],
                        ["32343", "El Said", "History", "60000"],
                      ].map((row) => (
                        <tr key={row[0]} className="border-t border-[#f1f5f9]">
                          {row.map((cell, i) => (
                            <td key={i} className="px-4 py-1.5 text-xs text-[#374151] border-r border-[#f1f5f9] last:border-r-0">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-sm leading-7 text-[#374151]">
                  The relational model employs keys to uniquely identify rows within a table. A superkey is a set of one or more
                  attributes that, taken collectively, allows us to identify uniquely a tuple in the relation. A candidate key is
                  a minimal superkey, meaning no proper subset of the candidate key is a superkey.
                </p>
              </div>

              {/* Page Navigation */}
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-[#e2e8f0]">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0f1f3d] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                  Previous
                </button>
                <span className="text-xs text-[#64748b]">
                  Page {currentPage} of {selectedBook.pages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(selectedBook.pages, p + 1))}
                  disabled={currentPage >= selectedBook.pages}
                  className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0f1f3d] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-72 bg-white border-l border-[#e2e8f0] flex flex-col overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-[#e2e8f0]">
              <h3 className="text-sm font-semibold text-[#0f1f3d] mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Book Information</h3>
              <div className="flex gap-3 mb-3">
                <BookCover src={selectedBook.cover} alt={selectedBook.title} size="sm" />
                <div>
                  <p className="text-xs font-semibold text-[#0f1f3d] leading-snug">{selectedBook.title}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{selectedBook.author}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  ["Department", selectedBook.dept],
                  ["Pages", String(selectedBook.pages)],
                  ["Format", selectedBook.format],
                  ["Language", "English"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-[#64748b]">{label}</span>
                    <span className="text-[#0f1f3d] font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-b border-[#e2e8f0]">
              <h3 className="text-sm font-semibold text-[#0f1f3d] mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Reading Progress</h3>
              <p className="text-xs text-[#64748b] mb-1">Chapter 4: Relational Model</p>
              <p className="text-xs text-[#0f1f3d] font-medium mb-2">
                Page {currentPage} / {selectedBook.pages}
              </p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full rounded-full bg-[#0d9488]"
                  style={{ width: `${(currentPage / selectedBook.pages) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-[#94a3b8] text-right">
                {Math.round((currentPage / selectedBook.pages) * 100)}% complete
              </p>
            </div>

            {isStudentRole && (
              <div className="p-4 flex flex-col gap-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => onNavigate("study-folders")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
                  Add to Study Folder
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
                  Bookmark
                </Button>
                <Button variant="accent" size="sm" className="w-full justify-start gap-2" onClick={() => onNavigate("ai-assistant")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                  Ask AI About This Book
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Grid View ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>E-Books</h1>
            <p className="text-sm text-[#64748b] mt-1">Read digital books available through your institution.</p>
          </div>
          {(role === "admin" || role === "librarian") && (
            <Button variant="primary" size="sm" onClick={() => setAddEbookOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              Add E-Book
            </Button>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Total E-Books"
            value="8,421"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}
            color="navy"
          />
          <KpiCard
            label="Available to Read"
            value="8,120"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>}
            color="teal"
          />
          <KpiCard
            label="Recently Added"
            value="126"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
            color="blue"
          />
          <KpiCard
            label="Most Read This Month"
            value="842"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
            color="emerald"
          />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[220px]">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              type="search"
              placeholder="Search e-books by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-[#0f1f3d] placeholder:text-[#94a3b8] text-sm py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-[#e2e8f0] rounded-[10px] bg-white text-[#0f1f3d] text-sm py-2.5 px-3.5 focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 cursor-pointer"
          >
            {DEPT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="border border-[#e2e8f0] rounded-[10px] bg-white text-[#0f1f3d] text-sm py-2.5 px-3.5 focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 cursor-pointer"
          >
            {SUBJECT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "popular" | "az")}
            className="border border-[#e2e8f0] rounded-[10px] bg-white text-[#0f1f3d] text-sm py-2.5 px-3.5 focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 cursor-pointer"
          >
            <option value="recent">Sort: Recent</option>
            <option value="popular">Sort: Popular</option>
            <option value="az">Sort: A–Z</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map((book) => (
            <Card key={book.id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-center">
                <BookCover src={book.cover} alt={book.title} size="lg" />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <h3 className="text-sm font-semibold text-[#0f1f3d] leading-snug line-clamp-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{book.title}</h3>
                <p className="text-xs text-[#64748b]">{book.author}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  <Badge variant="info">{book.dept}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  <Badge variant="accent">{book.format}</Badge>
                  <Badge variant="secondary">{book.pages} pages</Badge>
                </div>
                <Stars rating={book.rating} />
                <p className="text-[10px] text-[#94a3b8] mt-0.5">{book.size}</p>
              </div>
              <Button variant="accent" size="sm" onClick={() => openReader(book)} className="w-full">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                Read PDF
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Add E-Book Modal */}
      <Modal open={addEbookOpen} onClose={() => setAddEbookOpen(false)} title="Add New E-Book">
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input label="Title" placeholder="Enter book title" value={addForm.title} onChange={(v) => setAddForm({ ...addForm, title: v })} />
            </div>
            <Input label="Author" placeholder="Author name" value={addForm.author} onChange={(v) => setAddForm({ ...addForm, author: v })} />
            <Input label="ISBN" placeholder="ISBN number" value={addForm.isbn} onChange={(v) => setAddForm({ ...addForm, isbn: v })} />
            <Input label="Publisher" placeholder="Publisher" value={addForm.publisher} onChange={(v) => setAddForm({ ...addForm, publisher: v })} />
            <Input label="Year" placeholder="Publication year" value={addForm.year} onChange={(v) => setAddForm({ ...addForm, year: v })} />
            <div>
              <label className="block text-xs font-medium text-[#0f1f3d] mb-1">Department</label>
              <select value={addForm.dept} onChange={(e) => setAddForm({ ...addForm, dept: e.target.value })} className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-[#0f1f3d] text-sm py-2.5 px-3 focus:outline-none focus:border-[#0d9488]">
                {["CSE", "ECE", "Mechanical", "Civil", "IT", "Mathematics", "Physics"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <Input label="Subject" placeholder="Subject/category" value={addForm.subject} onChange={(v) => setAddForm({ ...addForm, subject: v })} />
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#0f1f3d] mb-1">Upload PDF</label>
              <div className="border-2 border-dashed border-[#e2e8f0] rounded-[10px] p-6 text-center text-sm text-[#94a3b8] hover:border-[#0d9488] cursor-pointer transition-colors">
                <svg className="mx-auto mb-2 text-[#94a3b8]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                Click to upload PDF file
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setAddEbookOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleAddEbook} disabled={!addForm.title || !addForm.author}>Save E-Book</Button>
          </div>
        </div>
      </Modal>

      {addToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f1f3d] text-white text-sm px-5 py-3 rounded-[12px] shadow-xl">
          E-Book added successfully.
        </div>
      )}
    </div>
  );
}
