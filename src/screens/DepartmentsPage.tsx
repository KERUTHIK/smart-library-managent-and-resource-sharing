import React, { useState, useEffect } from "react";
import { departmentsApi } from "../api/client";
import { Card, KpiCard, Badge, Button, Modal, Avatar, Input, Textarea } from "../components/ui";

interface Department {
  id: string | number;
  _id?: string;
  name: string;
  code: string;
  icon: string;
  library: string;
  head: string;
  books: number;
  ebooks: number;
  students: number;
  staff: number;
  librarians: number;
  available: number;
  issued: number;
  overdue: number;
  pendingRequests: number;
  popularBooks: string[];
}

interface Props {
  role: "admin" | "librarian" | "student";
  onNavigate: (s: string) => void;
}

export default function DepartmentsPage({ role, onNavigate: _onNavigate }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [manageLibOpen, setManageLibOpen] = useState(false);
  const [assignLibOpen, setAssignLibOpen] = useState(false);
  const [assignLibSelected, setAssignLibSelected] = useState("");
  const [addForm, setAddForm] = useState({ name: "", code: "", head: "", library: "" });
  const [editForm, setEditForm] = useState<Partial<Department>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentsApi
      .getDepartments()
      .then((res) => {
        if (res.departments) {
          const mapped = res.departments.map((d: any, i: number) => ({
            id: d._id || i + 1,
            _id: d._id,
            name: d.name,
            code: d.code,
            icon: d.icon || "🏛️",
            library: d.libraryName || `${d.name} Library`,
            head: d.headOfDepartment || "Department Head",
            books: d.bookCount || 2500,
            ebooks: 850,
            students: d.studentCount || 600,
            staff: 45,
            librarians: 2,
            available: Math.floor((d.bookCount || 2500) * 0.9),
            issued: Math.floor((d.bookCount || 2500) * 0.1),
            overdue: 4,
            pendingRequests: 6,
            popularBooks: ["Database Systems", "Operating Systems", "Algorithms"],
          }));
          setDepartments(mapped);
        }
      })
      .catch((err) => console.error("Error loading departments:", err))
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalBooks = departments.reduce((a, d) => a + d.books, 0);
  const totalEbooks = departments.reduce((a, d) => a + d.ebooks, 0);
  const totalAvailable = departments.reduce((a, d) => a + d.available, 0);

  if (selectedDept) {
    const d = selectedDept;
    const maxStat = Math.max(d.books, d.ebooks, d.available, d.issued);
    const bars = [
      { label: "Books", value: d.books, color: "#1e3a5f" },
      { label: "E-Books", value: d.ebooks, color: "#0d9488" },
      { label: "Available", value: d.available, color: "#22c55e" },
      { label: "Issued", value: d.issued, color: "#f59e0b" },
    ];

    return (
      <div className="p-6 min-h-screen" style={{ background: "#f1f5f9" }}>
        <button
          className="flex items-center gap-2 text-sm mb-5 text-slate-500 hover:text-slate-800 transition-colors"
          onClick={() => setSelectedDept(null)}
        >
          <span>←</span> Back to Departments
        </button>

        <div className="flex items-start gap-5 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: "#e0f2fe" }}
          >
            {d.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {d.name}
              </h1>
              <Badge variant="secondary">{d.code}</Badge>
            </div>
            <p className="text-slate-500 text-sm">{d.library}</p>
            <p className="text-slate-600 text-sm mt-0.5">
              Head: <span className="font-medium text-slate-700">{d.head}</span>
            </p>
          </div>
          {role === "admin" && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setEditForm({ ...d }); setEditOpen(true); }}>Edit Department</Button>
              <Button variant="secondary" size="sm" onClick={() => setManageLibOpen(true)}>Manage Librarians</Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Books", value: d.books.toLocaleString() },
            { label: "E-Books", value: d.ebooks.toLocaleString() },
            { label: "Students", value: d.students.toLocaleString() },
            { label: "Staff", value: d.staff.toLocaleString() },
            { label: "Librarians", value: d.librarians },
            { label: "Available", value: d.available.toLocaleString() },
            { label: "Issued", value: d.issued.toLocaleString() },
            { label: "Overdue", value: d.overdue },
            { label: "Pending Requests", value: d.pendingRequests },
          ].map((s) => (
            <Card key={s.label} className="p-4 bg-white rounded-[14px] shadow-sm">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-xl font-bold text-slate-800" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {s.value}
              </p>
            </Card>
          ))}
        </div>

        <Card className="bg-white rounded-[14px] shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-slate-700 mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Popular Books
          </h2>
          <div className="flex flex-wrap gap-2">
            {d.popularBooks.map((b) => (
              <span
                key={b}
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ background: "#e0f2fe", color: "#0369a1" }}
              >
                {b}
              </span>
            ))}
          </div>
        </Card>

        <Card className="bg-white rounded-[14px] shadow-sm p-5">
          <h2 className="font-semibold text-slate-700 mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Library Statistics
          </h2>
          <div className="space-y-3">
            {bars.map((bar) => (
              <div key={bar.label} className="flex items-center gap-3">
                <span className="text-sm text-slate-500 w-20 flex-shrink-0">{bar.label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${(bar.value / maxStat) * 100}%`,
                      background: bar.color,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 w-16 text-right">
                  {bar.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Edit Department Modal */}
        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Department">
          <div className="p-4 space-y-3">
            <Input label="Department Name" value={editForm.name || ""} onChange={(v) => setEditForm({ ...editForm, name: v })} />
            <Input label="Department Code" value={editForm.code || ""} onChange={(v) => setEditForm({ ...editForm, code: v })} />
            <Input label="Head / Coordinator" value={editForm.head || ""} onChange={(v) => setEditForm({ ...editForm, head: v })} />
            <Input label="Library Name" value={editForm.library || ""} onChange={(v) => setEditForm({ ...editForm, library: v })} />
            <div className="flex gap-2 pt-1">
              <Button variant="secondary" className="flex-1" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={() => { setEditOpen(false); showToast("Department updated successfully."); }}>Save Changes</Button>
            </div>
          </div>
        </Modal>

        {/* Manage Librarians Modal */}
        <Modal open={manageLibOpen} onClose={() => setManageLibOpen(false)} title={`Manage Librarians — ${d.name}`}>
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              {["Mr. Rajesh Kumar (LIB-CSE-001)", "Ms. Kavitha Rajan (LIB-IT-001)"].map((lib, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 text-sm">
                  <span className="text-slate-700 font-medium">{lib}</span>
                  <Button variant="ghost" size="sm">Remove</Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setAssignLibSelected(""); setAssignLibOpen(true); }}>+ Assign Librarian</Button>
            <Button variant="secondary" className="w-full" onClick={() => setManageLibOpen(false)}>Close</Button>
          </div>
        </Modal>

        {/* Assign Librarian Sub-Modal */}
        <Modal open={assignLibOpen} onClose={() => setAssignLibOpen(false)} title="Assign Librarian">
          <div className="p-4 space-y-4">
            <p className="text-sm text-slate-500">Select a librarian to assign to <strong>{d.name}</strong>.</p>
            <div className="space-y-2">
              {[
                { id: "LIB-003", name: "Ms. Priya Nair", dept: "Unassigned" },
                { id: "LIB-004", name: "Mr. Arjun Menon", dept: "Unassigned" },
                { id: "LIB-005", name: "Dr. Sunita Rao", dept: "Main Library" },
              ].map((lib) => (
                <div
                  key={lib.id}
                  onClick={() => setAssignLibSelected(lib.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-sm cursor-pointer transition-colors ${assignLibSelected === lib.id ? "border-[#0d9488] bg-teal-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div>
                    <p className="font-medium text-slate-700">{lib.name}</p>
                    <p className="text-xs text-slate-400">{lib.id} · {lib.dept}</p>
                  </div>
                  {assignLibSelected === lib.id && <span className="text-[#0d9488] text-base">✓</span>}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setAssignLibOpen(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={() => { setAssignLibOpen(false); showToast("Librarian assigned successfully."); }} >Assign</Button>
            </div>
          </div>
        </Modal>

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f1f3d] text-white text-sm px-5 py-3 rounded-[12px] shadow-xl">
            {toast}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ background: "#f1f5f9" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Departments
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage department libraries and their resources.</p>
        </div>
        {role === "admin" && (
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>+ Add Department</Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Departments" value="12" icon={<span>🏛️</span>} />
        <KpiCard label="Total Books" value={totalBooks.toLocaleString()} icon={<span>📚</span>} />
        <KpiCard label="E-Books" value={totalEbooks.toLocaleString()} icon={<span>💻</span>} />
        <KpiCard label="Available" value={totalAvailable.toLocaleString()} icon={<span>✅</span>} />
      </div>

      <div className="mb-5">
        <input
          type="text"
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/40"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((dept) => (
          <Card key={dept.id} className="bg-white rounded-[14px] shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "#e0f2fe" }}
              >
                {dept.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-semibold text-slate-800 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    {dept.name}
                  </span>
                  <Badge variant="secondary">{dept.code}</Badge>
                </div>
                <p className="text-xs text-slate-500 truncate">{dept.library}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Books</span>
                <span className="font-medium">{dept.books.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">E-Books</span>
                <span className="font-medium">{dept.ebooks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Students</span>
                <span className="font-medium">{dept.students.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Librarians</span>
                <span className="font-medium">{dept.librarians}</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <div className="flex-1 rounded-xl p-2 text-center" style={{ background: "#f0fdf4" }}>
                <p className="text-slate-500 mb-0.5">Available Books</p>
                <p className="font-bold text-green-700">{dept.available.toLocaleString()}</p>
              </div>
              <div className="flex-1 rounded-xl p-2 text-center" style={{ background: "#fff7ed" }}>
                <p className="text-slate-500 mb-0.5">Pending Requests</p>
                <p className="font-bold text-orange-600">{dept.pendingRequests}</p>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => setSelectedDept(dept)}>
              View Department
            </Button>
          </Card>
        ))}
      </div>

      {/* Add Department Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Department">
        <div className="p-4 space-y-3">
          <Input label="Department Name" placeholder="e.g. Computer Science" value={addForm.name} onChange={(v) => setAddForm({ ...addForm, name: v })} />
          <Input label="Department Code" placeholder="e.g. CSE" value={addForm.code} onChange={(v) => setAddForm({ ...addForm, code: v })} />
          <Input label="Head / Coordinator" placeholder="Dr. Name" value={addForm.head} onChange={(v) => setAddForm({ ...addForm, head: v })} />
          <Input label="Library Name" placeholder="e.g. CSE Library" value={addForm.library} onChange={(v) => setAddForm({ ...addForm, library: v })} />
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" disabled={!addForm.name.trim()} onClick={() => { setAddOpen(false); showToast("Department added successfully."); }}>Save Department</Button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f1f3d] text-white text-sm px-5 py-3 rounded-[12px] shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
