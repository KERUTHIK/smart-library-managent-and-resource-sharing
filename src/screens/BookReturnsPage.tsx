import React, { useState, useEffect } from "react";
import { returnsApi } from "../api/client";
import { Card, KpiCard, Badge, Button, Modal, BookCover } from "../components/ui";

type ReturnStatus = "Borrowed" | "Due Soon" | "Overdue" | "Return Requested" | "Returned" | "Lost" | "Damaged";

interface BorrowRecord {
  id: string;
  _id?: string;
  returnId?: string;
  student: string;
  studentId: string;
  dept: string;
  email: string;
  book: string;
  author: string;
  isbn: string;
  copy: string;
  cover: string;
  library: string;
  originalLibrary?: string;
  shelf: string;
  borrowedDate: string;
  dueDate: string;
  returnedDate?: string;
  daysOverdue: number;
  fine: number;
  finePerDay: number;
  status: ReturnStatus;
  condition?: "Good" | "Damaged" | "Lost" | "Minor Damage";
  returnedBy?: string;
  waitingStudents?: { name: string; requestDate: string; priority: string }[];
}

export default function BookReturnsPage() {
  const [mainTab, setMainTab] = useState<"active" | "history">("active");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);
  const [confirmRecord, setConfirmRecord] = useState<BorrowRecord | null>(null);
  const [condition, setCondition] = useState<"Good" | "Damaged" | "Lost">("Good");
  const [conditionNotes, setConditionNotes] = useState("");
  const [activeRecords, setActiveRecords] = useState<BorrowRecord[]>([]);
  const [historyRecords, setHistoryRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [waitlistRecord, setWaitlistRecord] = useState<BorrowRecord | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  const fetchLoans = () => {
    setLoading(true);
    returnsApi
      .getActiveLoans({ search })
      .then((res) => {
        if (res.loans) {
          const mapped: BorrowRecord[] = res.loans.map((l: any) => ({
            id: l.borrowId || l.id || l._id,
            _id: l._id || l.id,
            student: l.studentName || l.student || "Student",
            studentId: l.studentCollegeId || l.studentId || "ID",
            dept: l.studentDepartmentName || l.dept || "Computer Science",
            email: l.studentEmail || "student@libsync.edu",
            book: l.bookTitle || l.book || "Book",
            author: l.bookAuthor || l.author || "Author",
            isbn: l.isbn || "978-0131103627",
            copy: l.bookCopyAccessionNumber || l.copy || "CSE-01",
            cover: l.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
            library: l.libraryName || "CSE Library",
            shelf: l.shelfLocation || "A-01",
            borrowedDate: new Date(l.borrowDate || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            dueDate: new Date(l.dueDate || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            returnedDate: l.returnDate ? new Date(l.returnDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : undefined,
            daysOverdue: l.daysOverdue || 0,
            fine: l.fineAmount || 0,
            finePerDay: 5,
            status: l.status === "returned" ? "Returned" : l.daysOverdue > 0 ? "Overdue" : "Borrowed",
            condition: l.returnCondition || "Good",
          }));

          setActiveRecords(mapped.filter((x) => x.status !== "Returned"));
          setHistoryRecords(mapped.filter((x) => x.status === "Returned"));
        }
      })
      .catch((err) => console.error("Error fetching loans:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLoans();
  }, [search]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  const STATUS_TABS = ["All", "Due Today", "Overdue", "Return Requested", "Returned", "Due Soon", "Borrowed"];

  function matchKpiFilter(r: BorrowRecord) {
    if (!kpiFilter) return true;
    if (kpiFilter === "due-today") return r.dueDate === todayStr() && r.status !== "Returned";
    if (kpiFilter === "overdue") return r.status === "Overdue";
    if (kpiFilter === "returned-today") return r.returnedDate === todayStr();
    if (kpiFilter === "pending") return r.status === "Return Requested";
    return true;
  }

  const filtered = activeRecords.filter((r) => {
    const matchSearch =
      r.student.toLowerCase().includes(search.toLowerCase()) ||
      r.book.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.copy.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Due Today" && r.dueDate === todayStr()) ||
      r.status === statusFilter;
    return matchSearch && matchStatus && matchKpiFilter(r);
  });

  const returnedToday = [...activeRecords, ...historyRecords].filter((r) => r.returnedDate === todayStr());
  const historyFiltered = historyRecords.filter(
    (r) =>
      r.student.toLowerCase().includes(historySearch.toLowerCase()) ||
      r.book.toLowerCase().includes(historySearch.toLowerCase()) ||
      (r.returnId || "").toLowerCase().includes(historySearch.toLowerCase())
  );

  async function handleConfirmReturn() {
    if (!confirmRecord) return;
    try {
      const res = await returnsApi.processReturn({
        borrowId: confirmRecord._id || confirmRecord.id,
        condition: condition as any,
        conditionNotes: conditionNotes || undefined,
      });

      showToast(res.message || "Book return processed successfully!");
      setConfirmRecord(null);
      setSelectedRecord(null);
      setCondition("Good");
      fetchLoans();
    } catch (err: any) {
      alert(err.message || "Failed to process return");
    }
  }

  const canConfirmReturn = (s: ReturnStatus) =>
    s === "Return Requested" || s === "Overdue" || s === "Borrowed" || s === "Due Soon";

  return (
    <div className="p-6 min-h-screen" style={{ background: "#f1f5f9", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Book Returns
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage returned books, overdue books, and active borrowings in your department library.
          </p>
        </div>
        <div className="bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-[12px] px-4 py-2.5 text-right hidden sm:block">
          <p className="text-xs text-[#0d9488] font-medium">Department Library</p>
          <p className="text-sm font-semibold text-[#0f1f3d]">Computer Science Dept Library</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { key: "due-today", label: "Due Today", value: activeRecords.filter(r => r.dueDate === todayStr()).length, sub: "Books due today", icon: <CalendarSvg />, color: "amber" },
          { key: "overdue", label: "Overdue", value: activeRecords.filter(r => r.status === "Overdue").length, sub: "Need return attention", icon: <AlertSvg />, color: "red" },
          { key: "returned-today", label: "Returned Today", value: returnedToday.length, sub: "Successfully returned", icon: <CheckSvg />, color: "teal" },
          { key: "pending", label: "Pending Returns", value: activeRecords.filter(r => r.status === "Return Requested").length, sub: "Awaiting confirmation", icon: <ClockSvg />, color: "blue" },
          { key: "all", label: "Currently Borrowed", value: activeRecords.length, sub: "Active borrowings", icon: <BookSvg />, color: "navy" },
        ].map((k) => (
          <div
            key={k.key}
            className="cursor-pointer"
            onClick={() => { setKpiFilter(kpiFilter === k.key ? null : k.key); setStatusFilter("All"); setMainTab("active"); }}
          >
            <KpiCard
              label={k.label}
              value={String(k.value)}
              icon={k.icon}
              color={k.color as any}
              change={kpiFilter === k.key ? "● Active filter" : k.sub}
            />
          </div>
        ))}
      </div>

      {/* Main Tab: Active / History */}
      <div className="flex gap-1 mb-5 bg-white rounded-[12px] p-1 border border-slate-200 w-fit">
        {(["active", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setMainTab(t); setKpiFilter(null); }}
            className={`px-5 py-1.5 rounded-[10px] text-sm font-medium transition-colors ${mainTab === t ? "bg-[#1e3a5f] text-white" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t === "active" ? "Active Returns" : "Return History"}
          </button>
        ))}
      </div>

      {mainTab === "active" && (
        <>
          {/* Status filter tabs */}
          <div className="flex gap-2 flex-wrap mb-4">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setStatusFilter(tab); setKpiFilter(null); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  statusFilter === tab
                    ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <input
              type="text"
              placeholder="Search student, book, borrow ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/40 w-72"
            />
          </div>

          {/* Table */}
          <Card className="bg-white rounded-[14px] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Return Management
              </span>
              <span className="text-xs text-slate-400">{filtered.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Borrow ID", "Student", "Book", "Book Copy", "Borrowed Date", "Due Date", "Days Overdue", "Fine", "Status", "Action"].map((col) => (
                      <th key={col} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">No records match your filters</td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-slate-500">{r.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800">{r.student}</p>
                          <p className="text-xs text-slate-400">{r.dept}</p>
                        </td>
                        <td className="py-3 px-4 max-w-[180px]">
                          <p className="font-medium text-slate-700 text-xs leading-snug">{r.book}</p>
                          <p className="text-xs text-slate-400">{r.author}</p>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-500">{r.copy}</td>
                        <td className="py-3 px-4 text-slate-600 text-xs whitespace-nowrap">{r.borrowedDate}</td>
                        <td className="py-3 px-4 text-xs whitespace-nowrap">
                          <span className={r.daysOverdue > 0 ? "text-red-600 font-semibold" : "text-slate-600"}>{r.dueDate}</span>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {r.daysOverdue > 0
                            ? <span className="text-red-600 font-semibold">{r.daysOverdue}d</span>
                            : <span className="text-slate-400">—</span>}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold">
                          {r.fine > 0
                            ? <span className="text-red-600">₹{r.fine}</span>
                            : <span className="text-slate-400">₹0</span>}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={STATUS_BADGE[r.status]}>{r.status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1.5">
                            <Button variant="secondary" size="sm" onClick={() => setSelectedRecord(r)}>View</Button>
                            {r.status === "Return Requested" && (
                              <Button variant="accent" size="sm" onClick={() => { setConfirmRecord(r); setCondition("Good"); }}>
                                Confirm
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {mainTab === "history" && (
        <>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Search student, book, return ID..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/40 w-72"
            />
          </div>
          <Card className="bg-white rounded-[14px] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>Return History</span>
              <span className="text-xs text-slate-400">{historyFiltered.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Return ID", "Student", "Book", "Copy", "Borrowed", "Due", "Returned", "Days OD", "Fine", "Condition", "Returned By"].map((col) => (
                      <th key={col} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyFiltered.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{r.returnId}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{r.student}</p>
                        <p className="text-xs text-slate-400">{r.dept}</p>
                      </td>
                      <td className="py-3 px-4 max-w-[160px]">
                        <p className="font-medium text-slate-700 text-xs leading-snug">{r.book}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{r.copy}</td>
                      <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">{r.borrowedDate}</td>
                      <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">{r.dueDate}</td>
                      <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">{r.returnedDate}</td>
                      <td className="py-3 px-4 text-xs">
                        {r.daysOverdue > 0
                          ? <span className="text-red-500 font-medium">{r.daysOverdue}d</span>
                          : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold">
                        {r.fine > 0 ? <span className="text-red-500">₹{r.fine}</span> : <span className="text-slate-400">₹0</span>}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={r.condition === "Good" ? "success" : r.condition === "Damaged" ? "warning" : "danger"}>
                          {r.condition}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{r.returnedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Detail Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/30" onClick={() => setSelectedRecord(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>Borrow Details</h2>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>

            {/* Student */}
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Student</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Name", value: selectedRecord.student },
                  { label: "Student ID", value: selectedRecord.studentId },
                  { label: "Department", value: selectedRecord.dept },
                  { label: "Email", value: selectedRecord.email },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="text-slate-700 font-medium text-right max-w-[220px]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Book */}
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Book</h3>
              <div className="flex gap-3 mb-3">
                <BookCover src={selectedRecord.cover} alt={selectedRecord.book} size="md" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{selectedRecord.book}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedRecord.author}</p>
                  <p className="text-xs text-slate-400 mt-1">ISBN: {selectedRecord.isbn}</p>
                  <p className="text-xs text-slate-400">Copy: <span className="font-mono">{selectedRecord.copy}</span></p>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Library</span>
                  <span className="text-slate-700 font-medium">{selectedRecord.library}</span>
                </div>
                {selectedRecord.originalLibrary && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Original Library</span>
                    <span className="text-amber-700 font-medium">{selectedRecord.originalLibrary}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Shelf</span>
                  <span className="text-slate-700 font-medium">{selectedRecord.shelf}</span>
                </div>
              </div>
            </div>

            {/* Borrowing info */}
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Borrowing Info</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Borrowed Date", value: selectedRecord.borrowedDate },
                  { label: "Due Date", value: selectedRecord.dueDate },
                  { label: "Days Overdue", value: selectedRecord.daysOverdue > 0 ? `${selectedRecord.daysOverdue} days` : "—" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-slate-400">{row.label}</span>
                    <span className={`font-medium ${row.label === "Days Overdue" && selectedRecord.daysOverdue > 0 ? "text-red-600" : "text-slate-700"}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fine & Status */}
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Fine & Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Fine</span>
                  <span className={`font-semibold ${selectedRecord.fine > 0 ? "text-red-600" : "text-slate-700"}`}>
                    ₹{selectedRecord.fine}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fine per day</span>
                  <span className="text-slate-700 font-medium">₹{selectedRecord.finePerDay}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Return Status</span>
                  <Badge variant={STATUS_BADGE[selectedRecord.status]}>{selectedRecord.status}</Badge>
                </div>
              </div>
              {selectedRecord.originalLibrary && (
                <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: "#fef3c7" }}>
                  <p className="font-semibold text-amber-800 mb-1">Inter-Library Return</p>
                  <p className="text-amber-700">Original Library: <strong>{selectedRecord.originalLibrary}</strong></p>
                  <p className="text-amber-700">Return Destination: <strong>{selectedRecord.originalLibrary}</strong></p>
                  <p className="text-amber-600 mt-1">After return, this book must be transferred back to {selectedRecord.originalLibrary}.</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-5 mt-auto">
              {canConfirmReturn(selectedRecord.status) && (
                <Button
                  variant="accent"
                  className="w-full"
                  onClick={() => { setConfirmRecord(selectedRecord); setCondition("Good"); }}
                >
                  Mark as Returned
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Return Modal */}
      {confirmRecord && (
        <Modal open title="Confirm Book Return" onClose={() => { setConfirmRecord(null); setCondition("Good"); }}>
          <div className="p-5 space-y-4">
            <div className="space-y-2 text-sm">
              {[
                { label: "Book", value: confirmRecord.book },
                { label: "Student", value: confirmRecord.student },
                { label: "Borrowed", value: confirmRecord.borrowedDate },
                { label: "Due", value: confirmRecord.dueDate },
                { label: "Return Date", value: todayStr() },
                { label: "Days Overdue", value: confirmRecord.daysOverdue > 0 ? `${confirmRecord.daysOverdue} days` : "On time" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="text-slate-700 font-medium text-right max-w-[220px]">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-400">Current Fine</span>
                <span className={`font-bold text-base ${confirmRecord.fine > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  ₹{confirmRecord.fine}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Book Condition</p>
              <div className="flex gap-4">
                {(["Good", "Damaged", "Lost"] as const).map((c) => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="condition"
                      value={c}
                      checked={condition === c}
                      onChange={() => setCondition(c)}
                      className="accent-[#0d9488]"
                    />
                    <span className={condition === c ? "font-semibold text-slate-800" : "text-slate-600"}>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="secondary" className="flex-1" onClick={() => { setConfirmRecord(null); setCondition("Good"); }}>
                Cancel
              </Button>
              <Button variant="accent" className="flex-1" onClick={handleConfirmReturn}>
                Confirm Return
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Waitlist Modal */}
      {waitlistRecord && (
        <Modal open title="Book Available — Waiting List" onClose={() => setWaitlistRecord(null)}>
          <div className="p-5 space-y-4">
            <div className="rounded-xl p-3 text-sm" style={{ background: "#f0fdf4" }}>
              <p className="text-emerald-800 font-medium">"{waitlistRecord.book}" is now available.</p>
              <p className="text-emerald-700 mt-0.5">
                {(waitlistRecord.waitingStudents || []).length > 0
                  ? `${waitlistRecord.waitingStudents!.length} student(s) are waiting for this book.`
                  : "No students are currently waiting."}
              </p>
            </div>
            {(waitlistRecord.waitingStudents || []).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Waiting List</p>
                <div className="space-y-2">
                  {waitlistRecord.waitingStudents!.map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl p-3 text-sm" style={{ background: "#f8fafc" }}>
                      <div>
                        <p className="font-medium text-slate-800">{i + 1}. {s.name}</p>
                        <p className="text-xs text-slate-400">Request date: {s.requestDate} · Priority: {s.priority}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button variant="secondary" className="w-full" onClick={() => setWaitlistRecord(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f1f3d] text-white text-sm px-5 py-3 rounded-[12px] shadow-xl max-w-md text-center">
          {toast}
        </div>
      )}
    </div>
  );
}

// Icon components
function CalendarSvg() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
}
function AlertSvg() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></svg>;
}
function CheckSvg() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
}
function ClockSvg() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
function BookSvg() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>;
}
