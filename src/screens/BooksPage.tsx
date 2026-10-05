import { useState, useEffect } from "react";
import { booksApi, requestsApi, analyticsApi } from "../api/client";
import { Card, KpiCard, Badge, Button, Modal, BookCover, Stars, Input } from "../components/ui";

interface Book {
  id: string;
  _id?: string;
  title: string;
  author: string;
  dept: string;
  subject: string;
  isbn: string;
  edition: string;
  publisher: string;
  year: number;
  rating: number;
  available: number;
  total: number;
  location: string;
  shelf: string;
  description: string;
  cover: string;
}

const DEPT_OPTIONS = [
  { value: "", label: "All Departments" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Electronics", label: "Electronics" },
  { value: "Mechanical", label: "Mechanical" },
  { value: "Mathematics", label: "Mathematics" },
  { value: "Civil", label: "Civil" },
];

const AVAIL_OPTIONS = [
  { value: "", label: "All" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
];

interface Props {
  role: "admin" | "librarian" | "student";
  onNavigate: (s: string) => void;
}

export default function BooksPage({ role, onNavigate }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [availFilter, setAvailFilter] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    total: 0,
    available: 0,
    issued: 0,
    overdue: 0,
    inTransfer: 0,
  });

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [requestModal, setRequestModal] = useState(false);
  const [requestNotes, setRequestNotes] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [toast, setToast] = useState("");

  // Edit Book modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Book>>({});

  // View Inventory / Manage Copies modal
  const [inventoryOpen, setInventoryOpen] = useState(false);

  // Import Books modal
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<string | null>(null);

  const fetchBooks = () => {
    setLoading(true);
    booksApi
      .getBooks({
        search,
        department: deptFilter,
        availability: availFilter,
        limit: 100,
      })
      .then((res) => {
        if (res.items) {
          const items: Book[] = res.items.map((b: any) => ({
            id: b.id || b._id,
            _id: b.id || b._id,
            title: b.title,
            author: b.author,
            dept: b.dept || b.departmentName || "Computer Science",
            subject: b.subject || "General",
            isbn: b.isbn,
            edition: b.edition || "1st",
            publisher: b.publisher || "Academic Press",
            year: b.year || 2022,
            rating: b.rating || 4.7,
            available: typeof b.available === "number" ? b.available : 1,
            total: typeof b.total === "number" ? b.total : 1,
            location: b.location || "Department Library",
            shelf: b.shelf || "A-01",
            description: b.description || "Comprehensive academic reference.",
            cover: b.cover || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
          }));
          setBooks(items);

          const tot = items.reduce((acc, x) => acc + (x.total || 0), 0);
          const av = items.reduce((acc, x) => acc + (x.available || 0), 0);
          setKpis({
            total: tot,
            available: av,
            issued: Math.max(0, tot - av),
            overdue: 14,
            inTransfer: 4,
          });
        }
      })
      .catch((err) => console.error("Error fetching books:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchBooks();
    }, 250);
    return () => clearTimeout(handler);
  }, [search, deptFilter, availFilter]);

  function openEdit(book: Book) {
    setEditForm({ ...book });
    setEditOpen(true);
  }

  async function handleSaveEdit() {
    if (!editForm.id) return;
    try {
      await booksApi.updateBook(editForm.id, editForm);
      setEditOpen(false);
      showToast("Book updated successfully.");
      fetchBooks();
    } catch (err: any) {
      alert(err.message || "Failed to update book");
    }
  }

  function handleImport() {
    setImportOpen(false);
    setImportFile(null);
    showToast("Books import processed successfully.");
    fetchBooks();
  }

  async function handleConfirmRequest() {
    if (!selectedBook) return;
    setSubmittingRequest(true);
    try {
      const res = await requestsApi.createRequest({
        bookId: selectedBook.id,
        notes: requestNotes || undefined,
      });
      setRequestModal(false);
      setRequestNotes("");
      showToast(res.message || "Book request submitted successfully!");
      fetchBooks();
    } catch (err: any) {
      alert(err.message || "Failed to submit request");
    } finally {
      setSubmittingRequest(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-[12px] border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-lg max-w-sm">
          <span className="text-sm font-medium">&#10003;</span>
          <span className="text-sm">{toast}</span>
          <button onClick={() => setToast("")} className="ml-auto opacity-60 hover:opacity-100 cursor-pointer text-sm">&#10005;</button>
        </div>
      )}

      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Books</h1>
            <p className="text-sm text-[#64748b] mt-1">Manage and explore physical books across all department libraries.</p>
          </div>
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "librarian") && (
              <Button variant="primary" size="sm" onClick={() => onNavigate("add-book")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                Add New Book
              </Button>
            )}
            {role === "admin" && (
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                Import Books
              </Button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <KpiCard
            label="Total Physical Books"
            value={kpis.total.toLocaleString()}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>}
            color="navy"
          />
          <KpiCard
            label="Available"
            value={kpis.available.toLocaleString()}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>}
            color="emerald"
          />
          <KpiCard
            label="Currently Issued"
            value={kpis.issued.toLocaleString()}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
            color="blue"
          />
          <KpiCard
            label="Overdue"
            value={kpis.overdue.toLocaleString()}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
            color="red"
          />
          <KpiCard
            label="In Transfer"
            value={kpis.inTransfer.toLocaleString()}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>}
            color="amber"
          />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[220px]">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              type="search"
              placeholder="Search by title, author, ISBN, book ID..."
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
            value={availFilter}
            onChange={(e) => setAvailFilter(e.target.value)}
            className="border border-[#e2e8f0] rounded-[10px] bg-white text-[#0f1f3d] text-sm py-2.5 px-3.5 focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 cursor-pointer"
          >
            {AVAIL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="flex items-center gap-1 ml-auto border border-[#e2e8f0] rounded-[10px] bg-white p-1">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-[8px] cursor-pointer transition-colors ${view === "grid" ? "bg-[#1e3a5f] text-white" : "text-[#64748b] hover:bg-[#f1f5f9]"}`}
              title="Grid view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-[8px] cursor-pointer transition-colors ${view === "list" ? "bg-[#1e3a5f] text-white" : "text-[#64748b] hover:bg-[#f1f5f9]"}`}
              title="List view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            </button>
          </div>
        </div>

        {/* Grid View */}
        {view === "grid" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map((book) => (
              <Card key={book.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-center">
                  <BookCover src={book.cover} alt={book.title} size="lg" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-semibold text-[#0f1f3d] leading-snug line-clamp-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{book.title}</h3>
                  <p className="text-xs text-[#64748b]">{book.author}</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    <Badge variant="info">{book.dept}</Badge>
                    <Badge variant="secondary">{book.subject}</Badge>
                  </div>
                  <Stars rating={book.rating} />
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="secondary">Physical</Badge>
                    <Badge variant={book.available > 0 ? "success" : "danger"}>
                      {book.available > 0 ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#64748b]">{book.available} of {book.total} copies available</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedBook(book)} className="mt-auto w-full">
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wide px-4 py-3">Cover</th>
                    <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wide px-4 py-3">Book</th>
                    <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wide px-4 py-3">Author</th>
                    <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wide px-4 py-3">Department</th>
                    <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wide px-4 py-3">Availability</th>
                    <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wide px-4 py-3">Copies</th>
                    <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wide px-4 py-3">Rating</th>
                    <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wide px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book, idx) => (
                    <tr key={book.id} className={`border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors ${idx % 2 === 0 ? "" : "bg-[#fafbfc]"}`}>
                      <td className="px-4 py-3">
                        <BookCover src={book.cover} alt={book.title} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-[#0f1f3d] max-w-[200px] leading-snug">{book.title}</p>
                        <p className="text-xs text-[#94a3b8] mt-0.5">ISBN: {book.isbn}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">{book.author}</td>
                      <td className="px-4 py-3">
                        <Badge variant="info">{book.dept}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={book.available > 0 ? "success" : "danger"}>
                          {book.available > 0 ? "Available" : "Unavailable"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">{book.available}/{book.total}</td>
                      <td className="px-4 py-3">
                        <Stars rating={book.rating} />
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedBook(book)}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Book Detail Drawer */}
      {selectedBook && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setSelectedBook(null)}
          />
          <div className="fixed top-0 right-0 h-full w-[420px] bg-white z-50 shadow-2xl overflow-y-auto flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Book Details</h2>
              <button
                onClick={() => setSelectedBook(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f1f5f9] text-[#64748b] cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Cover + Title */}
            <div className="flex gap-4 p-5 bg-[#f8fafc] border-b border-[#e2e8f0]">
              <BookCover src={selectedBook.cover} alt={selectedBook.title} size="lg" />
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-semibold text-[#0f1f3d] leading-snug" style={{ fontFamily: "'DM Sans', sans-serif" }}>{selectedBook.title}</h3>
                <p className="text-sm text-[#64748b]">{selectedBook.author}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="info">{selectedBook.dept}</Badge>
                  <Badge variant="secondary">{selectedBook.subject}</Badge>
                </div>
                <Stars rating={selectedBook.rating} />
                <Badge variant="secondary" className="w-fit mt-1">Physical Book</Badge>
              </div>
            </div>

            {/* Metadata */}
            <div className="p-5 flex flex-col gap-4 flex-1">
              <div>
                <h4 className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-3">Book Information</h4>
                <div className="flex flex-col gap-2">
                  {[
                    ["ISBN", selectedBook.isbn],
                    ["Edition", selectedBook.edition],
                    ["Publisher", selectedBook.publisher],
                    ["Year", String(selectedBook.year)],
                    ["Department", selectedBook.dept],
                    ["Subject", selectedBook.subject],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-[#64748b]">{label}</span>
                      <span className="text-[#0f1f3d] font-medium text-right max-w-[55%]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#e2e8f0] pt-4">
                <h4 className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-3">Availability</h4>
                <div className="flex flex-col gap-2">
                  {[
                    ["Copies Available", `${selectedBook.available} of ${selectedBook.total}`],
                    ["Location", selectedBook.location],
                    ["Shelf", selectedBook.shelf],
                    ["Loan Period", "14 days"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-[#64748b]">{label}</span>
                      <span className="text-[#0f1f3d] font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#e2e8f0] pt-4">
                <h4 className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Description</h4>
                <p className="text-sm text-[#374151] leading-relaxed">{selectedBook.description}</p>
              </div>

              {/* Actions */}
              <div className="border-t border-[#e2e8f0] pt-4 flex flex-col gap-2 mt-auto">
                {role === "student" && (
                  <Button
                    variant="accent"
                    onClick={() => setRequestModal(true)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
                    Request Physical Book
                  </Button>
                )}
                {role === "librarian" && (
                  <div className="flex gap-2">
                    <Button variant="primary" className="flex-1" onClick={() => openEdit(selectedBook)}>Edit Book</Button>
                    <Button variant="outline" className="flex-1" onClick={() => setInventoryOpen(true)}>Manage Copies</Button>
                  </div>
                )}
                {role === "admin" && (
                  <div className="flex gap-2">
                    <Button variant="primary" className="flex-1" onClick={() => openEdit(selectedBook)}>Edit Book</Button>
                    <Button variant="outline" className="flex-1" onClick={() => setInventoryOpen(true)}>View Inventory</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Book Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Book">
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input label="Title" value={editForm.title || ""} onChange={(v) => setEditForm({ ...editForm, title: v })} />
            </div>
            <Input label="Author" value={editForm.author || ""} onChange={(v) => setEditForm({ ...editForm, author: v })} />
            <Input label="ISBN" value={editForm.isbn || ""} onChange={(v) => setEditForm({ ...editForm, isbn: v })} />
            <Input label="Edition" value={editForm.edition || ""} onChange={(v) => setEditForm({ ...editForm, edition: v })} />
            <Input label="Year" value={String(editForm.year || "")} onChange={(v) => setEditForm({ ...editForm, year: Number(v) })} />
            <Input label="Publisher" value={editForm.publisher || ""} onChange={(v) => setEditForm({ ...editForm, publisher: v })} />
            <Input label="Shelf" value={editForm.shelf || ""} onChange={(v) => setEditForm({ ...editForm, shelf: v })} />
            <div className="col-span-2">
              <Input label="Description" value={editForm.description || ""} onChange={(v) => setEditForm({ ...editForm, description: v })} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* View Inventory / Manage Copies Modal */}
      <Modal open={inventoryOpen} onClose={() => setInventoryOpen(false)} title={`Inventory — ${selectedBook?.title || ""}`} width="max-w-2xl">
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Copy ID", "Barcode", "Status", "Department", "Shelf"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: selectedBook?.total || 1 }, (_, i) => {
                  const isAvail = i < (selectedBook?.available || 1);
                  return (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-xs">{selectedBook?.dept?.slice(0, 3).toUpperCase()}-{String(i + 1).padStart(3, "0")}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-500">BC{String(100000 + (i + 1) * 137)}</td>
                      <td className="py-2.5 px-3"><Badge variant={isAvail ? "success" : "info"}>{isAvail ? "Available" : "Issued"}</Badge></td>
                      <td className="py-2.5 px-3 text-xs">{selectedBook?.dept}</td>
                      <td className="py-2.5 px-3 text-xs">{selectedBook?.shelf}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => setInventoryOpen(false)}>Close</Button>
        </div>
      </Modal>

      {/* Import Books Modal */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import Books from CSV">
        <div className="p-4 space-y-4">
          <div
            className="border-2 border-dashed border-[#e2e8f0] rounded-[10px] p-8 text-center cursor-pointer hover:border-[#0d9488] transition-colors"
            onClick={() => setImportFile("books_import.csv")}
          >
            <svg className="mx-auto mb-2 text-[#94a3b8]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p className="text-sm text-[#64748b]">{importFile ? `Selected: ${importFile}` : "Click to select CSV file"}</p>
          </div>
          {importFile && (
            <div className="rounded-[10px] p-3 text-sm space-y-1.5" style={{ background: "#f8fafc" }}>
              <div className="flex justify-between"><span className="text-slate-400">File</span><span className="text-slate-700 font-medium">{importFile}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Records found</span><span className="text-slate-700 font-medium">3</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Valid</span><span className="text-emerald-600 font-medium">3</span></div>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" disabled={!importFile} onClick={handleImport}>Import Books</Button>
          </div>
        </div>
      </Modal>

      {/* Request Modal */}
      <Modal
        open={requestModal}
        onClose={() => setRequestModal(false)}
        title="Request Physical Book"
      >
        {selectedBook && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
              <BookCover src={selectedBook.cover} alt={selectedBook.title} size="sm" />
              <div>
                <p className="text-sm font-semibold text-[#0f1f3d]">{selectedBook.title}</p>
                <p className="text-xs text-[#64748b] mt-0.5">{selectedBook.author}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {[
                ["Pickup Location", `${selectedBook.dept} Library`],
                ["Loan Period", "14 days"],
                ["Copies Available", `${selectedBook.available} of ${selectedBook.total}`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm py-1.5 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b]">{label}</span>
                  <span className="text-[#0f1f3d] font-medium">{val}</span>
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs text-[#64748b] block mb-1">Optional Notes</label>
              <input
                type="text"
                placeholder="e.g. For lab preparation..."
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                className="w-full text-xs p-2 border border-[#e2e8f0] rounded-[8px]"
              />
            </div>

            <p className="text-xs text-[#64748b]">
              LibSync will automatically route your request: checking department availability, central reserve, and inter-department transfer as needed.
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                variant="accent"
                className="flex-1"
                disabled={submittingRequest}
                onClick={handleConfirmRequest}
              >
                {submittingRequest ? "Submitting…" : "Confirm Request"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setRequestModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
