import React, { useState, useEffect } from "react";
import { librariansApi } from "../api/client";
import { Card, KpiCard, Badge, Button, Modal, Avatar, Input } from "../components/ui";

interface Librarian {
  id: string | number;
  _id?: string;
  name: string;
  initials: string;
  empId: string;
  dept: string;
  library: string;
  email: string;
  phone: string;
  joined: string;
  experience: string;
  status: "Active" | "On Leave";
  booksManaged: number;
  requestsProcessed: number;
  transfersCompleted: number;
  pendingRequests: number;
  fineActions: number;
  recentActivity: string[];
}

interface Props {
  onNavigate: (s: string) => void;
}

export default function LibrariansPage({ onNavigate: _onNavigate }: Props) {
  const [librarianList, setLibrarianList] = useState<Librarian[]>([]);
  const [selected, setSelected] = useState<Librarian | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    librariansApi
      .getLibrarians()
      .then((res) => {
        if (res.librarians) {
          const mapped = res.librarians.map((l: any, i: number) => ({
            id: l._id || i + 1,
            _id: l._id,
            name: l.userId?.name || l.name || "Librarian",
            initials: (l.userId?.name || l.name || "LIB").split(" ").map((x: string) => x[0]).join("").slice(0, 2),
            empId: l.employeeId || `LIB-${String(i + 1).padStart(3, "0")}`,
            dept: l.departmentName || "General",
            library: l.libraryName || `${l.departmentName || "Campus"} Library`,
            email: l.userId?.email || l.email || "librarian@libsync.edu",
            phone: "+91 98400 11234",
            joined: "Jan 2020",
            experience: `${l.yearsOfExperience || 5} yrs`,
            status: l.status === "on_leave" ? "On Leave" : "Active",
            booksManaged: 3500,
            requestsProcessed: 420,
            transfersCompleted: 45,
            pendingRequests: 4,
            fineActions: 18,
            recentActivity: ["Approved student book request", "Logged inventory circulation", "Assisted faculty research"],
          }));
          setLibrarianList(mapped);
        }
      })
      .catch((err) => console.error("Error loading librarians:", err))
      .finally(() => setLoading(false));
  }, []);

  const allDepts = ["All Departments", ...Array.from(new Set(librarianList.map((l) => l.dept)))];
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Add Librarian
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", empId: "", phone: "", dept: "Computer Science", status: "Active" });

  // Edit Librarian
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Librarian>>({});

  // Assign Department
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignDept, setAssignDept] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function handleDeactivate() {
    if (!selected) return;
    setLibrarianList((prev) => prev.map((l) => l.id === selected.id ? { ...l, status: "On Leave" as const } : l));
    setSelected(null);
    setConfirmDeactivate(false);
    setDeactivateReason("");
    showToast(`${selected.name} has been deactivated.`);
  }

  function handleAddLibrarian() {
    setAddOpen(false);
    setAddForm({ name: "", email: "", empId: "", phone: "", dept: "Computer Science", status: "Active" });
    showToast("Librarian added successfully.");
  }

  function handleEditLibrarian() {
    setEditOpen(false);
    showToast("Librarian updated successfully.");
  }

  function handleAssignDept() {
    setAssignOpen(false);
    showToast(`Department updated to ${assignDept}.`);
  }

  const filtered = librarianList.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.empId.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All Departments" || l.dept === deptFilter;
    return matchSearch && matchDept;
  });

  const activeCount = librarianList.filter((l) => l.status === "Active").length;
  const onLeaveCount = librarianList.filter((l) => l.status === "On Leave").length;

  return (
    <div className="p-6 min-h-screen" style={{ background: "#f1f5f9", fontFamily: "Inter, sans-serif" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Librarians
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage department librarians and library responsibilities.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>+ Add Librarian</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Librarians" value="24" icon={<span>👤</span>} />
        <KpiCard label="Active" value={String(activeCount)} icon={<span>✅</span>} />
        <KpiCard label="On Leave" value={String(onLeaveCount)} icon={<span>🏖️</span>} />
        <KpiCard label="Departments Covered" value="12" icon={<span>🏛️</span>} />
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Search librarians..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/40 w-64"
        />
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/40"
        >
          {allDepts.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>

      <Card className="bg-white rounded-[14px] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Librarian</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Library</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Books Managed</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((lib) => (
              <tr key={lib.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={lib.initials} size="sm" />
                    <div>
                      <p className="font-medium text-slate-800">{lib.name}</p>
                      <p className="text-xs text-slate-400">{lib.empId}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-600">{lib.dept}</td>
                <td className="py-3 px-4 text-slate-600">{lib.library}</td>
                <td className="py-3 px-4 text-slate-700 font-medium">{lib.booksManaged.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className={lib.pendingRequests > 0 ? "text-orange-600 font-medium" : "text-slate-400"}>
                    {lib.pendingRequests}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={lib.status === "Active" ? "success" : "warning"}>{lib.status}</Badge>
                </td>
                <td className="py-3 px-4">
                  <Button variant="secondary" size="sm" onClick={() => setSelected(lib)}>
                    View Profile
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {selected && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/30" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-4 mb-3">
                <Avatar initials={selected.initials} size="lg" />
                <div>
                  <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    {selected.name}
                  </h2>
                  <p className="text-sm text-slate-500">{selected.empId}</p>
                  <div className="mt-1">
                    <Badge variant={selected.status === "Active" ? "success" : "warning"}>{selected.status}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-slate-100 space-y-2 text-sm">
              {[
                { label: "Email", value: selected.email },
                { label: "Phone", value: selected.phone },
                { label: "Department", value: selected.dept },
                { label: "Library", value: selected.library },
                { label: "Joined", value: selected.joined },
                { label: "Experience", value: selected.experience },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="text-slate-700 font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Performance Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Books Managed", value: selected.booksManaged.toLocaleString() },
                  { label: "Requests Processed", value: selected.requestsProcessed.toLocaleString() },
                  { label: "Transfers", value: selected.transfersCompleted },
                  { label: "Pending", value: selected.pendingRequests },
                  { label: "Fine Actions", value: selected.fineActions },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-3" style={{ background: "#f8fafc" }}>
                    <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                    <p className="text-lg font-bold text-slate-800" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Recent Activity
              </h3>
              <ul className="space-y-2">
                {selected.recentActivity.map((act, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600">
                    <span className="text-slate-300 flex-shrink-0">•</span>
                    {act}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 flex flex-col gap-2 mt-auto">
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => { setEditForm({ ...selected }); setEditOpen(true); }}>Edit Librarian</Button>
                <Button variant="secondary" size="sm" onClick={() => { setAssignDept(selected.dept); setAssignOpen(true); }}>Assign Department</Button>
              </div>
              <button
                onClick={() => setConfirmDeactivate(true)}
                className="w-full py-2 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors mt-1"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeactivate && selected && (
        <Modal
          open={confirmDeactivate}
          onClose={() => { setConfirmDeactivate(false); setDeactivateReason(""); }}
          title="Deactivate Librarian"
        >
          <div className="p-4 space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to deactivate <strong>{selected.name}</strong>?
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Reason</label>
              <textarea
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="Enter reason for deactivation..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-red-400/40 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={() => { setConfirmDeactivate(false); setDeactivateReason(""); }}>
                Cancel
              </Button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                onClick={handleDeactivate}
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Librarian Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Librarian">
        <div className="p-4 space-y-3">
          <Input label="Full Name" placeholder="Mr./Ms. Name" value={addForm.name} onChange={(v) => setAddForm({ ...addForm, name: v })} />
          <Input label="Employee ID" placeholder="LIB-XXX-001" value={addForm.empId} onChange={(v) => setAddForm({ ...addForm, empId: v })} />
          <Input label="Email" placeholder="name@libsync.edu" value={addForm.email} onChange={(v) => setAddForm({ ...addForm, email: v })} />
          <Input label="Phone" placeholder="+91 98400 XXXXX" value={addForm.phone} onChange={(v) => setAddForm({ ...addForm, phone: v })} />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
            <select value={addForm.dept} onChange={(e) => setAddForm({ ...addForm, dept: e.target.value })} className="w-full border border-slate-200 rounded-xl text-sm py-2.5 px-3 outline-none focus:ring-2 focus:ring-teal-500/40">
              {["Computer Science", "Electronics & Comm", "Mechanical Eng", "Civil Engineering", "Information Technology", "Mathematics", "Physics"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" disabled={!addForm.name.trim()} onClick={handleAddLibrarian}>Add Librarian</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Librarian Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Librarian">
        <div className="p-4 space-y-3">
          <Input label="Full Name" value={editForm.name || ""} onChange={(v) => setEditForm({ ...editForm, name: v })} />
          <Input label="Email" value={editForm.email || ""} onChange={(v) => setEditForm({ ...editForm, email: v })} />
          <Input label="Phone" value={editForm.phone || ""} onChange={(v) => setEditForm({ ...editForm, phone: v })} />
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleEditLibrarian}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Assign Department Modal */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Department">
        <div className="p-4 space-y-3">
          <p className="text-sm text-slate-600">Current department: <strong>{selected?.dept}</strong></p>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">New Department</label>
            <select value={assignDept} onChange={(e) => setAssignDept(e.target.value)} className="w-full border border-slate-200 rounded-xl text-sm py-2.5 px-3 outline-none focus:ring-2 focus:ring-teal-500/40">
              {["Computer Science", "Electronics & Comm", "Mechanical Eng", "Civil Engineering", "Information Technology", "Mathematics", "Physics"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleAssignDept}>Assign</Button>
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
