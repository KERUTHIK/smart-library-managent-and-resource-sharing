import React, { useState, useEffect } from "react";
import { finesApi } from "../api/client";
import { Card, KpiCard, Badge, Button, Modal } from "../components/ui";

type FineStatus = "Pending" | "Overdue" | "Paid" | "Waived" | "Cancelled";

const STATUS_VARIANT: Record<FineStatus, "warning" | "danger" | "success" | "secondary" | "info"> = {
  Pending: "warning",
  Overdue: "danger",
  Paid: "success",
  Waived: "secondary",
  Cancelled: "info",
};

export default function LibrarianFinesScreen() {
  const [fines, setFines] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [confirmAction, setConfirmAction] = useState<"paid" | "waive" | "cancel" | null>(null);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchFines = () => {
    setLoading(true);
    finesApi
      .getFines()
      .then((res) => {
        if (res.fines) {
          setFines(
            res.fines.map((f: any) => ({
              id: f._id || f.id,
              fineId: f.fineId || f.id,
              student: f.userId?.name || "Student Member",
              userId: f.userId?.collegeId || "ID",
              book: f.bookTitle || "Academic Reference",
              dueDate: new Date(f.createdAt || Date.now()).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              daysOverdue: f.daysOverdue || 0,
              amount: f.amount || 0,
              status: f.status === "paid" ? "Paid" : f.status === "waived" ? "Waived" : f.daysOverdue > 0 ? "Overdue" : "Pending",
              payDate: f.paidAt ? new Date(f.paidAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null,
            }))
          );
        }
      })
      .catch((err) => console.error("Error loading fines:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const filtered = fines.filter((f) => statusFilter === "All" || f.status === statusFilter);
  const pending = fines.filter((f) => f.status === "Pending");
  const overdue = fines.filter((f) => f.status === "Overdue");
  const pendingTotal = [...pending, ...overdue].reduce((s, f) => s + f.amount, 0);
  const overdueTotal = overdue.reduce((s, f) => s + f.amount, 0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function doAction() {
    if (!selected || !confirmAction) return;

    try {
      if (confirmAction === "paid") {
        await finesApi.payFine({
          fineId: selected.id,
          paymentMethod: "Cash",
        });
        showToast("Fine marked as paid via Cash Desk");
      } else if (confirmAction === "waive" || confirmAction === "cancel") {
        await finesApi.waiveFine(selected.id, reason || "Waived by Department Librarian");
        showToast("Fine waived/cancelled successfully");
      }
      setSelected(null);
      setConfirmAction(null);
      setReason("");
      fetchFines();
    } catch (err: any) {
      alert(err.message || "Failed to update fine");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Fines & Payments</h1>
        <p className="text-[#64748b] mt-0.5">Computer Science Department · Fine Management</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard label="Pending Fines" value={`₹${pendingTotal}`} icon={<span className="text-base">⏳</span>} color="amber" change={`${pending.length + overdue.length} users`} />
        <KpiCard label="Overdue Fines" value={`₹${overdueTotal}`} icon={<span className="text-base">⚠️</span>} color="red" change={`${overdue.length} users`} />
        <KpiCard label="Collected This Month" value="₹8,420" icon={<span className="text-base">✅</span>} color="teal" change="+15% vs last month" />
        <KpiCard label="Total Outstanding" value={`₹${pendingTotal}`} icon={<span className="text-base">💰</span>} color="navy" change="Across all loans" />
        <KpiCard label="Awaiting Action" value={String(pending.length + overdue.length)} icon={<span className="text-base">🔔</span>} color="purple" change="Need your attention" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["All", "Pending", "Overdue", "Paid", "Waived"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-medium cursor-pointer transition-colors ${
              statusFilter === st ? "bg-[#1e3a5f] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                {["Student", "Book", "Due Date", "Overdue", "Fine Amount", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-[#64748b] py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8fafc]">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-[#f8fafc]">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-xs text-[#0f1f3d]">{f.student}</p>
                    <p className="text-[11px] text-[#94a3b8] font-mono">{f.userId}</p>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-[#0f1f3d] max-w-[180px] truncate">{f.book}</td>
                  <td className="py-3 px-4 text-xs text-[#64748b]">{f.dueDate}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-red-600">{f.daysOverdue > 0 ? `${f.daysOverdue} days` : "—"}</td>
                  <td className="py-3 px-4 text-xs font-bold text-[#0f1f3d]">₹{f.amount}</td>
                  <td className="py-3 px-4">
                    <Badge variant={STATUS_VARIANT[f.status as FineStatus] || "secondary"}>{f.status}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    {(f.status === "Pending" || f.status === "Overdue") ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setSelected(f); setConfirmAction("paid"); }}
                          className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-[6px] cursor-pointer"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => { setSelected(f); setConfirmAction("waive"); }}
                          className="px-2.5 py-1 text-[11px] font-medium bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] rounded-[6px] cursor-pointer"
                        >
                          Waive
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#94a3b8]">{f.payDate ? `Paid on ${f.payDate}` : "Completed"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal */}
      {confirmAction && selected && (
        <Modal
          open={!!confirmAction}
          onClose={() => { setConfirmAction(null); setSelected(null); setReason(""); }}
          title={
            confirmAction === "paid" ? "Mark Fine as Paid" :
            confirmAction === "waive" ? "Waive Fine" : "Cancel Fine"
          }
        >
          <div className="space-y-4">
            <div className="bg-[#f8fafc] rounded-[10px] p-3 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-[#64748b]">Student:</span><span className="font-semibold text-[#0f1f3d]">{selected.student}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">Book:</span><span className="font-medium text-[#0f1f3d]">{selected.book}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">Amount:</span><span className="font-bold text-red-600">₹{selected.amount}</span></div>
            </div>

            {(confirmAction === "waive" || confirmAction === "cancel") && (
              <div>
                <label className="text-xs font-semibold text-[#0f1f3d] block mb-1">Reason for {confirmAction === "waive" ? "Waiving" : "Cancelling"}</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Medical emergency approved by HOD..."
                  className="w-full text-xs p-2.5 border border-[#e2e8f0] rounded-[8px] focus:outline-none focus:border-[#0d9488]"
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant={confirmAction === "paid" ? "accent" : "danger"}
                className="flex-1"
                onClick={doAction}
              >
                Confirm {confirmAction === "paid" ? "Payment" : confirmAction === "waive" ? "Waiver" : "Cancellation"}
              </Button>
              <Button variant="outline" onClick={() => { setConfirmAction(null); setSelected(null); }}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#0f1f3d] text-white px-4 py-2.5 rounded-[10px] text-xs shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
