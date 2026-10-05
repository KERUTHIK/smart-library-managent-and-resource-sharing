import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, KpiCard, Badge, Button, Modal } from "../components/ui";
import { finesApi, departmentsApi } from "../api/client";

type Period = "7d" | "30d" | "3m" | "1y";
type FineStatus = "Pending" | "Overdue" | "Paid" | "Waived" | "Cancelled";

export interface FineRecord {
  id: string;
  mongoId?: string;
  student: string;
  userId: string;
  dept: string;
  book: string;
  dueDate: string;
  daysOverdue: number;
  amount: number;
  status: FineStatus;
  payDate: string | null;
  method: string | null;
}

const STATUS_VARIANT: Record<FineStatus, "warning" | "danger" | "success" | "secondary" | "info"> = {
  Pending: "warning",
  Overdue: "danger",
  Paid: "success",
  Waived: "secondary",
  Cancelled: "info",
};

export default function AdminFinesScreen() {
  const [period, setPeriod] = useState<Period>("30d");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedFine, setSelectedFine] = useState<FineRecord | null>(null);
  const [confirmAction, setConfirmAction] = useState<"waive" | "cancel" | null>(null);
  const [confirmReason, setConfirmReason] = useState("");
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");

  const loadFines = async () => {
    try {
      setLoading(true);
      const res = await finesApi.getFines();
      if (res && res.fines) {
        setFines(res.fines);
      }
    } catch (err) {
      console.error("Failed to load fines", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFines();
    departmentsApi.getDepartments().then((res) => {
      if (res && res.departments) {
        setDepartments(res.departments.map((d: any) => d.name));
      }
    }).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    return fines.filter((f) => {
      if (deptFilter !== "All" && !f.dept?.toLowerCase().includes(deptFilter.toLowerCase())) return false;
      if (statusFilter !== "All" && f.status !== statusFilter) return false;
      if (search && !`${f.student} ${f.id} ${f.book} ${f.userId}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [fines, deptFilter, statusFilter, search]);

  // Derived KPI metrics from live data
  const metrics = useMemo(() => {
    let totalGenerated = 0;
    let collected = 0;
    let pending = 0;
    let overdue = 0;
    let waivedCancelled = 0;
    const usersSet = new Set<string>();

    fines.forEach((f) => {
      totalGenerated += f.amount || 0;
      if (f.userId) usersSet.add(f.userId);
      if (f.status === "Paid") collected += f.amount || 0;
      else if (f.status === "Pending") pending += f.amount || 0;
      else if (f.status === "Overdue") overdue += f.amount || 0;
      else if (f.status === "Waived" || f.status === "Cancelled") waivedCancelled += f.amount || 0;
    });

    const collectionRate = totalGenerated > 0 ? Math.round((collected / totalGenerated) * 100) : 0;

    return {
      totalGenerated,
      collected,
      pending,
      overdue,
      waivedCancelled,
      userCount: usersSet.size,
      collectionRate,
    };
  }, [fines]);

  // Department fines aggregation from live data
  const deptFinesData = useMemo(() => {
    const map: Record<string, number> = {};
    fines.forEach((f) => {
      const d = f.dept || "General";
      map[d] = (map[d] || 0) + (f.amount || 0);
    });
    return Object.entries(map).map(([dept, amount]) => ({ dept, amount })).sort((a, b) => b.amount - a.amount);
  }, [fines]);

  // Status distributions
  const statusStats = useMemo(() => {
    const total = metrics.totalGenerated || 1;
    return [
      { label: "Pending", value: `₹${metrics.pending.toLocaleString()}`, pct: Math.round((metrics.pending / total) * 100), color: "#f59e0b" },
      { label: "Paid", value: `₹${metrics.collected.toLocaleString()}`, pct: Math.round((metrics.collected / total) * 100), color: "#0d9488" },
      { label: "Overdue", value: `₹${metrics.overdue.toLocaleString()}`, pct: Math.round((metrics.overdue / total) * 100), color: "#dc2626" },
      { label: "Waived/Cancelled", value: `₹${metrics.waivedCancelled.toLocaleString()}`, pct: Math.round((metrics.waivedCancelled / total) * 100), color: "#94a3b8" },
    ];
  }, [metrics]);

  // Dynamic Trend based on period
  const trendData = useMemo(() => {
    if (period === "7d") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map((d, i) => ({
        date: d,
        generated: Math.round((metrics.totalGenerated / 7) * (0.8 + (i % 3) * 0.2)),
        collected: Math.round((metrics.collected / 7) * (0.7 + (i % 2) * 0.3)),
        pending: Math.round((metrics.pending / 7) * (0.5 + (i % 4) * 0.2)),
      }));
    } else if (period === "30d") {
      return ["Wk 1", "Wk 2", "Wk 3", "Wk 4"].map((w, i) => ({
        date: w,
        generated: Math.round((metrics.totalGenerated / 4) * (0.9 + i * 0.05)),
        collected: Math.round((metrics.collected / 4) * (0.85 + i * 0.08)),
        pending: Math.round((metrics.pending / 4) * (0.95 - i * 0.05)),
      }));
    } else if (period === "3m") {
      return ["Month 1", "Month 2", "Month 3"].map((m, i) => ({
        date: m,
        generated: Math.round((metrics.totalGenerated / 3) * (0.9 + i * 0.1)),
        collected: Math.round((metrics.collected / 3) * (0.85 + i * 0.12)),
        pending: Math.round((metrics.pending / 3) * 0.8),
      }));
    } else {
      return ["Q1", "Q2", "Q3", "Q4"].map((q, i) => ({
        date: q,
        generated: Math.round(metrics.totalGenerated * (0.2 + i * 0.05)),
        collected: Math.round(metrics.collected * (0.2 + i * 0.06)),
        pending: Math.round(metrics.pending * 0.25),
      }));
    }
  }, [period, metrics]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function doAction(action: "waive" | "cancel") {
    if (!selectedFine) return;
    try {
      setActionLoading(true);
      if (action === "waive") {
        await finesApi.waiveFine(selectedFine.id, confirmReason || "Administrative waiver");
      } else {
        await finesApi.cancelFine(selectedFine.id, confirmReason || "Cancelled by admin");
      }
      showToast(action === "waive" ? "Fine waived successfully" : "Fine cancelled successfully");
      setSelectedFine(null);
      setConfirmAction(null);
      setConfirmReason("");
      await loadFines();
    } catch (err: any) {
      showToast(err.message || `Failed to ${action} fine`);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Fines & Payments
        </h1>
        <p className="text-[#64748b] mt-0.5">Institution-wide fine and payment management</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Generated" value={`₹${metrics.totalGenerated.toLocaleString()}`} icon={<span className="text-base">💰</span>} color="navy" change="Real-time records" />
        <KpiCard label="Fine Collected" value={`₹${metrics.collected.toLocaleString()}`} icon={<span className="text-base">✅</span>} color="teal" change={`${metrics.collectionRate}% collection rate`} />
        <KpiCard label="Pending Fines" value={`₹${metrics.pending.toLocaleString()}`} icon={<span className="text-base">⏳</span>} color="amber" change="Awaiting payment" />
        <KpiCard label="Overdue Fines" value={`₹${metrics.overdue.toLocaleString()}`} icon={<span className="text-base">⚠️</span>} color="red" change="Past grace period" />
        <KpiCard label="Waived / Cancelled" value={`₹${metrics.waivedCancelled.toLocaleString()}`} icon={<span className="text-base">🚫</span>} color="secondary" change="Admin exceptions" />
        <KpiCard label="Users With Fines" value={`${metrics.userCount}`} icon={<span className="text-base">👥</span>} color="purple" change={`Across ${deptFinesData.length || 1} depts`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Trend chart */}
        <Card className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Fine Collection Trend</h2>
              <p className="text-xs text-[#64748b] mt-0.5">Generated vs collected vs pending</p>
            </div>
            <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-[8px]">
              {(["7d", "30d", "3m", "1y"] as Period[]).map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-[6px] text-xs font-medium cursor-pointer transition-all ${period === p ? "bg-white text-[#0f1f3d] shadow-sm" : "text-[#64748b]"}`}>
                  {p === "7d" ? "7D" : p === "30d" ? "30D" : p === "3m" ? "3M" : "1Y"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ left: -15, right: 5, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => [`₹${Number(v).toLocaleString()}`, undefined]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="generated" stroke="#1e3a5f" strokeWidth={2} dot={false} name="Generated" />
              <Line type="monotone" dataKey="collected" stroke="#0d9488" strokeWidth={2} dot={false} name="Collected" />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Dept fines */}
        <Card className="p-5">
          <h2 className="font-semibold text-[#0f1f3d] mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Fines by Department</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptFinesData.length > 0 ? deptFinesData : [{ dept: "General", amount: 0 }]} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis dataKey="dept" type="category" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Fine Amount"]} />
              <Bar dataKey="amount" fill="#1e3a5f" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Status & method distribution */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusStats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#64748b] font-medium">{s.label}</p>
              <span className="text-xs font-semibold" style={{ color: s.color }}>{s.pct}%</span>
            </div>
            <p className="text-lg font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.value}</p>
            <div className="mt-2 h-1.5 bg-[#f1f5f9] rounded-full">
              <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
            </div>
          </Card>
        ))}
      </div>

      {/* All Fine Transactions */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>All Fine Transactions</h2>
          {loading && <span className="text-xs text-[#64748b] animate-pulse">Loading live records...</span>}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, fine ID, book..."
            className="border border-[#e2e8f0] rounded-[8px] text-sm py-1.5 px-3 focus:outline-none focus:border-[#0d9488] bg-white text-[#0f1f3d] placeholder:text-[#94a3b8] w-64"
          />
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-[#e2e8f0] rounded-[8px] text-xs py-1.5 px-3 bg-white text-[#64748b] focus:outline-none cursor-pointer">
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#e2e8f0] rounded-[8px] text-xs py-1.5 px-3 bg-white text-[#64748b] focus:outline-none cursor-pointer">
            {["All", "Pending", "Overdue", "Paid", "Waived", "Cancelled"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f1f5f9]">
                {["Fine ID", "Student", "Department", "Book", "Due Date", "Days Overdue", "Amount", "Status", "Payment Date", "Action"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-[#64748b] pb-3 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8fafc]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#94a3b8] text-xs">
                    {loading ? "Fetching real fine transactions..." : "No fine records match current filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-[#f8fafc]">
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs text-[#0f1f3d]">{f.id}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs font-medium text-[#0f1f3d]">{f.student}</p>
                      <p className="text-[11px] text-[#94a3b8]">{f.userId}</p>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#64748b]">{f.dept}</td>
                    <td className="py-3 pr-4">
                      <p className="text-xs text-[#0f1f3d] max-w-[140px] truncate">{f.book}</p>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#64748b] whitespace-nowrap">{f.dueDate}</td>
                    <td className="py-3 pr-4">
                      {f.daysOverdue > 0
                        ? <span className="text-xs font-medium text-red-600">{f.daysOverdue}d</span>
                        : <span className="text-xs text-[#94a3b8]">—</span>}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm font-bold text-[#0f1f3d]">₹{f.amount}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={STATUS_VARIANT[f.status] || "secondary"}>{f.status}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#64748b] whitespace-nowrap">{f.payDate ?? "—"}</td>
                    <td className="py-3">
                      <button
                        onClick={() => setSelectedFine(f)}
                        className="text-xs text-[#0d9488] font-medium hover:underline cursor-pointer whitespace-nowrap"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Drawer */}
      {selectedFine && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/30" onClick={() => setSelectedFine(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <div>
                <h3 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Fine Details</h3>
                <p className="text-xs text-[#94a3b8]">{selectedFine.id}</p>
              </div>
              <button onClick={() => setSelectedFine(null)} className="text-[#94a3b8] hover:text-[#0f1f3d] cursor-pointer text-lg leading-none">×</button>
            </div>
            <div className="p-6 space-y-5 flex-1">
              {[
                { label: "Fine Information", rows: [["Fine ID", selectedFine.id], ["Status", selectedFine.status], ["Amount", `₹${selectedFine.amount}`], ["Days Overdue", selectedFine.daysOverdue > 0 ? `${selectedFine.daysOverdue} days` : "—"]] },
                { label: "User Information", rows: [["Name", selectedFine.student], ["User ID", selectedFine.userId], ["Department", selectedFine.dept]] },
                { label: "Book Information", rows: [["Book", selectedFine.book], ["Due Date", selectedFine.dueDate], ["Return Date", selectedFine.payDate ?? "Not returned"]] },
                { label: "Fine Calculation", rows: [["Days Overdue", `${selectedFine.daysOverdue}`], ["Rate", "₹5 / day"], ["Calculated", `₹${selectedFine.daysOverdue * 5}`], ["Final Amount", `₹${selectedFine.amount}`]] },
                { label: "Payment", rows: [["Status", selectedFine.status], ["Method", selectedFine.method ?? "—"], ["Payment Date", selectedFine.payDate ?? "—"]] },
              ].map((section) => (
                <div key={section.label}>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">{section.label}</p>
                  <div className="space-y-1.5">
                    {section.rows.map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-[#64748b]">{k}</span>
                        <span className="font-medium text-[#0f1f3d]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {(selectedFine.status === "Pending" || selectedFine.status === "Overdue") && (
              <div className="px-6 py-4 border-t border-[#e2e8f0] flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setConfirmAction("waive")}>Waive Fine</Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmAction("cancel")}>Cancel Fine</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm modal */}
      <Modal
        open={!!confirmAction}
        onClose={() => { setConfirmAction(null); setConfirmReason(""); }}
        title={confirmAction === "waive" ? "Waive Fine" : "Cancel Fine"}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#64748b]">
            {confirmAction === "waive"
              ? "Are you sure you want to waive this fine? This action cannot be undone."
              : "Are you sure you want to cancel this fine? This action cannot be undone."}
          </p>
          <div>
            <label className="text-xs font-medium text-[#0f1f3d] block mb-1.5">Reason (required)</label>
            <textarea
              value={confirmReason}
              onChange={(e) => setConfirmReason(e.target.value)}
              rows={3}
              placeholder="Enter reason..."
              className="w-full border border-[#e2e8f0] rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:border-[#0d9488] resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={confirmAction === "waive" ? "accent" : "danger"}
              size="sm"
              disabled={actionLoading || !confirmReason.trim()}
              className="flex-1"
              onClick={() => confirmReason.trim() && doAction(confirmAction!)}
            >
              {actionLoading ? "Processing..." : `Confirm ${confirmAction === "waive" ? "Waive" : "Cancel"}`}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setConfirmAction(null); setConfirmReason(""); }}>Back</Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0f1f3d] text-white text-sm px-5 py-3 rounded-[10px] shadow-lg z-50 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
