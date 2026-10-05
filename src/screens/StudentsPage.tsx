import React, { useState, useEffect } from "react";
import { usersApi } from "../api/client";
import { Card, KpiCard, Badge, Button, Modal, Avatar, Input } from "../components/ui";

type UserType = "Student" | "Faculty" | "Staff";
type UserStatus = "Active" | "Suspended" | "Fine Pending";

interface BorrowRecord {
  book: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string;
  status: string;
}

interface LibraryUser {
  id: string | number;
  _id?: string;
  name: string;
  initials: string;
  userId: string;
  type: UserType;
  dept: string;
  email: string;
  status: UserStatus;
  borrowed: number;
  returned: number;
  overdue: number;
  fine: number;
  pendingRequests: number;
  ebooksRead: number;
  studyFolders: number;
  borrowHistory: BorrowRecord[];
}

const typeOptions: Array<"All" | UserType> = ["All", "Student", "Faculty", "Staff"];

function statusBadgeVariant(status: UserStatus): "success" | "danger" | "warning" {
  if (status === "Active") return "success";
  if (status === "Suspended") return "danger";
  return "warning";
}

function typeBadgeVariant(type: UserType): "info" | "accent" | "secondary" {
  if (type === "Student") return "info";
  if (type === "Faculty") return "accent";
  return "secondary";
}

interface Props {
  onNavigate: (s: string) => void;
}

export default function StudentsPage({ onNavigate: _onNavigate }: Props) {
  const [userList, setUserList] = useState<LibraryUser[]>([]);
  const [selected, setSelected] = useState<LibraryUser | null>(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [typeFilter, setTypeFilter] = useState<"All" | UserType>("All");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [suspendConfirm, setSuspendConfirm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", userId: "", email: "", type: "Student" as UserType, dept: "CSE" });
  const [editForm, setEditForm] = useState<Partial<LibraryUser>>({});
  const [importFile, setImportFile] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function handleSuspend() {
    if (!selected) return;
    const newStatus: UserStatus = selected.status === "Suspended" ? "Active" : "Suspended";
    setUserList((prev) => prev.map((u) => u.id === selected.id ? { ...u, status: newStatus } : u));
    setSelected((s) => s ? { ...s, status: newStatus } : s);
    setSuspendConfirm(false);
    showToast(newStatus === "Suspended" ? `${selected.name}'s access has been suspended.` : `${selected.name}'s access has been restored.`);
  }

  function handleAddMember() {
    setAddOpen(false);
    setAddForm({ name: "", userId: "", email: "", type: "Student", dept: "CSE" });
    showToast("Member added successfully.");
  }

  function handleImport() {
    setImportOpen(false);
    setImportFile(null);
    showToast("5 members imported successfully.");
  }

  const filtered = userList.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.userId.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || u.type === typeFilter;
    const matchDept = deptFilter === "All Departments" || u.dept === deptFilter;
    return matchSearch && matchType && matchDept;
  });

  return (
    <div className="p-6 min-h-screen" style={{ background: "#f1f5f9", fontFamily: "Inter, sans-serif" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Students &amp; Staff
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage library members, borrowing activity, and access.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>Import Members</Button>
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>+ Add Member</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <KpiCard label="Total Members" value="6,284" icon={<span>👥</span>} />
        <KpiCard label="Students" value="5,820" icon={<span>🎓</span>} />
        <KpiCard label="Staff" value="464" icon={<span>👔</span>} />
        <KpiCard label="Active Borrowers" value="2,842" icon={<span>📖</span>} />
        <KpiCard label="Users With Fines" value="126" icon={<span>⚠️</span>} />
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/40 w-56"
        />
        <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden text-sm">
          {typeOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setTypeFilter(opt)}
              className={`px-3 py-2 transition-colors ${typeFilter === opt ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {opt}
            </button>
          ))}
        </div>
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
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Borrowed</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Overdue</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fine</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={u.initials} size="sm" />
                    <div>
                      <p className="font-medium text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.userId}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={typeBadgeVariant(u.type)}>{u.type}</Badge>
                </td>
                <td className="py-3 px-4 text-slate-600">{u.dept}</td>
                <td className="py-3 px-4 text-slate-700 font-medium">{u.borrowed}</td>
                <td className="py-3 px-4">
                  <span className={u.overdue > 0 ? "text-red-600 font-medium" : "text-slate-400"}>{u.overdue}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={u.fine > 0 ? "text-red-600 font-medium" : "text-slate-400"}>
                    {u.fine > 0 ? `₹${u.fine}` : "₹0"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={statusBadgeVariant(u.status)}>{u.status}</Badge>
                </td>
                <td className="py-3 px-4">
                  <Button variant="secondary" size="sm" onClick={() => setSelected(u)}>
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
              <div className="flex items-center gap-4">
                <Avatar initials={selected.initials} size="lg" />
                <div>
                  <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    {selected.name}
                  </h2>
                  <p className="text-sm text-slate-500">{selected.userId}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={typeBadgeVariant(selected.type)}>{selected.type}</Badge>
                    <Badge variant={statusBadgeVariant(selected.status)}>{selected.status}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-slate-100 space-y-2 text-sm">
              {[
                { label: "Department", value: selected.dept },
                { label: "Email", value: selected.email },
                { label: "Status", value: selected.status },
                { label: "Account Type", value: selected.type },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="text-slate-700 font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Library Activity
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Currently Borrowed", value: selected.borrowed },
                  { label: "Books Returned", value: selected.returned },
                  { label: "Pending Requests", value: selected.pendingRequests },
                  { label: "Overdue", value: selected.overdue },
                  { label: "Outstanding Fine", value: selected.fine > 0 ? `₹${selected.fine}` : "₹0" },
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
                Reading Activity
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "E-Books Read", value: selected.ebooksRead },
                  { label: "Study Folders", value: selected.studyFolders },
                  { label: "Most Active", value: selected.dept },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "#f0fdfa" }}>
                    <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                    <p className="text-base font-bold text-teal-700" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Borrowing History
              </h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left pb-2 text-slate-400 font-medium">Book</th>
                    <th className="text-left pb-2 text-slate-400 font-medium">Borrowed</th>
                    <th className="text-left pb-2 text-slate-400 font-medium">Due</th>
                    <th className="text-left pb-2 text-slate-400 font-medium">Returned</th>
                    <th className="text-left pb-2 text-slate-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.borrowHistory.map((h, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-2 text-slate-700 font-medium pr-2">{h.book}</td>
                      <td className="py-2 text-slate-500">{h.borrowDate}</td>
                      <td className="py-2 text-slate-500">{h.dueDate}</td>
                      <td className="py-2 text-slate-500">{h.returnDate}</td>
                      <td className="py-2">
                        <Badge
                          variant={
                            h.status === "Returned" ? "success" :
                            h.status === "Overdue" ? "danger" : "info"
                          }
                        >
                          {h.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 flex gap-2 mt-auto">
              <Button variant="secondary" size="sm" onClick={() => { setEditForm({ ...selected }); setEditOpen(true); }}>Edit Profile</Button>
              {selected.status === "Suspended" ? (
                <Button variant="secondary" size="sm" onClick={() => setSuspendConfirm(true)}>Restore Access</Button>
              ) : (
                <button className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors" onClick={() => setSuspendConfirm(true)}>
                  Suspend Access
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suspend / Restore Confirm */}
      {suspendConfirm && selected && (
        <Modal open title={selected.status === "Suspended" ? "Restore Access" : "Suspend Access"} onClose={() => setSuspendConfirm(false)}>
          <div className="p-4 space-y-4">
            <p className="text-sm text-slate-600">
              {selected.status === "Suspended"
                ? `Restore library access for ${selected.name}?`
                : `Suspend library access for ${selected.name}? They will not be able to borrow books or access library services.`}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setSuspendConfirm(false)}>Cancel</Button>
              <button
                className={`flex-1 px-4 py-2 rounded-[10px] text-sm font-medium text-white transition-colors ${selected.status === "Suspended" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
                onClick={handleSuspend}
              >
                {selected.status === "Suspended" ? "Restore Access" : "Suspend Access"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Member Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Member">
        <div className="p-4 space-y-3">
          <Input label="Full Name" placeholder="Student/Staff name" value={addForm.name} onChange={(v) => setAddForm({ ...addForm, name: v })} />
          <Input label="User ID" placeholder="e.g. CSE2024-0001" value={addForm.userId} onChange={(v) => setAddForm({ ...addForm, userId: v })} />
          <Input label="Email" placeholder="email@libsync.edu" value={addForm.email} onChange={(v) => setAddForm({ ...addForm, email: v })} />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
            <select value={addForm.type} onChange={(e) => setAddForm({ ...addForm, type: e.target.value as UserType })} className="w-full border border-slate-200 rounded-xl text-sm py-2.5 px-3 outline-none">
              <option>Student</option><option>Faculty</option><option>Staff</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
            <select value={addForm.dept} onChange={(e) => setAddForm({ ...addForm, dept: e.target.value })} className="w-full border border-slate-200 rounded-xl text-sm py-2.5 px-3 outline-none">
              {["CSE", "ECE", "IT", "Mechanical", "Civil"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" disabled={!addForm.name.trim()} onClick={handleAddMember}>Add Member</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Member Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Member">
        <div className="p-4 space-y-3">
          <Input label="Full Name" value={editForm.name || ""} onChange={(v) => setEditForm({ ...editForm, name: v })} />
          <Input label="Email" value={editForm.email || ""} onChange={(v) => setEditForm({ ...editForm, email: v })} />
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={() => { setEditOpen(false); showToast("Member profile updated."); }}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Import Members Modal */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import Members from CSV">
        <div className="p-4 space-y-4">
          <div
            className="border-2 border-dashed border-[#e2e8f0] rounded-[10px] p-8 text-center cursor-pointer hover:border-[#0d9488] transition-colors"
            onClick={() => setImportFile("members_import.csv")}
          >
            <svg className="mx-auto mb-2 text-[#94a3b8]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p className="text-sm text-[#64748b]">{importFile ? `Selected: ${importFile}` : "Click to select CSV file"}</p>
          </div>
          {importFile && (
            <div className="rounded-[10px] p-3 text-sm space-y-1.5" style={{ background: "#f8fafc" }}>
              <div className="flex justify-between"><span className="text-slate-400">Records found</span><span className="text-slate-700 font-medium">5</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Valid</span><span className="text-emerald-600 font-medium">5</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Errors</span><span className="text-slate-400">0</span></div>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" disabled={!importFile} onClick={handleImport}>Import Members</Button>
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
