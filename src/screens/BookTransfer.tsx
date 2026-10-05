import React, { useState, useEffect } from "react";
import { transfersApi } from "../api/client";
import { Card, Badge, Button, SectionHeader } from "../components/ui";

interface Transfer {
  id: string;
  _id?: string;
  transferId: string;
  student: string;
  studentDept: string;
  book: string;
  currentLib: string;
  targetLib: string;
  status: string;
  rawStatus: string;
  requestDate: string;
  steps: { label: string; done: boolean; active?: boolean }[];
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "info" | "secondary"> = {
  "Transfer Pending": "warning",
  "requested": "warning",
  "In Transit": "info",
  "in_transit": "info",
  "dispatched": "info",
  "Completed": "success",
  "completed": "success",
  "Received": "success",
  "received": "success",
};

interface Props {
  role: "admin" | "librarian" | "student";
}

export default function BookTransfer({ role }: Props) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [selected, setSelected] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const fetchTransfers = () => {
    setLoading(true);
    transfersApi
      .getTransfers()
      .then((res) => {
        if (res.transfers && res.transfers.length > 0) {
          const items: Transfer[] = res.transfers.map((t: any) => {
            const isCompleted = t.status === "completed";
            const isReceived = t.status === "received" || isCompleted;
            const isInTransit = t.status === "dispatched" || t.status === "in_transit" || isReceived;

            const steps = [
              { label: "Request received", done: true },
              { label: "Request approved", done: true },
              { label: `${t.fromLibraryName || "Source"} Library notified`, done: true },
              { label: "Book dispatched / in transit", done: isInTransit, active: t.status === "dispatched" || t.status === "in_transit" },
              { label: `Received by ${t.toLibraryName || "Target"} Library`, done: isReceived, active: t.status === "received" },
              { label: "Ready for student pickup", done: isCompleted, active: t.status === "ready_for_pickup" },
              { label: "Issued to student", done: isCompleted },
            ];

            const displayStatus =
              t.status === "dispatched" || t.status === "in_transit"
                ? "In Transit"
                : t.status === "received"
                ? "Received"
                : t.status === "completed"
                ? "Completed"
                : "Transfer Pending";

            return {
              id: t.transferId || t._id,
              _id: t._id,
              transferId: t.transferId || t._id,
              student: t.borrowRequestId?.studentName || "Student Member",
              studentDept: t.borrowRequestId?.studentDepartmentName || "CSE",
              book: t.bookTitle || "Academic Textbook",
              currentLib: t.fromLibraryName || "Source Library",
              targetLib: t.toLibraryName || "Destination Library",
              status: displayStatus,
              rawStatus: t.status,
              requestDate: new Date(t.createdAt || Date.now()).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              steps,
            };
          });

          setTransfers(items);
          setSelected((prev) => (prev ? items.find((x) => x.id === prev.id) || items[0] : items[0]));
        } else {
          setTransfers([]);
          setSelected(null);
        }
      })
      .catch((err) => console.error("Error fetching transfers:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleDispatch() {
    if (!selected) return;
    try {
      await transfersApi.dispatchTransfer(selected._id || selected.id, "Courier dispatched");
      showToast(`Transfer ${selected.transferId} marked as dispatched and in transit.`);
      fetchTransfers();
    } catch (err: any) {
      alert(err.message || "Failed to dispatch transfer");
    }
  }

  async function handleMarkReceived() {
    if (!selected) return;
    try {
      await transfersApi.receiveTransfer(selected._id || selected.id, "Received in good condition");
      showToast(`Transfer ${selected.transferId} marked as received at ${selected.targetLib}.`);
      fetchTransfers();
    } catch (err: any) {
      alert(err.message || "Failed to mark transfer as received");
    }
  }

  const isLibrarian = role === "librarian" || role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Book Transfers</h1>
        <p className="text-[#64748b] mt-0.5">Track and manage inter-department book transfer requests across campus libraries</p>
      </div>

      {/* Transfer workflow diagram */}
      <Card className="p-6">
        <h2 className="font-semibold text-[#0f1f3d] mb-6 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>Transfer Workflow</h2>
        <div className="flex items-center justify-between max-w-3xl mx-auto overflow-x-auto">
          {[
            { icon: "👤", label: "Student\nRequest" },
            { icon: "📋", label: "Central\nLibrarian" },
            { icon: "📚", label: "Source\nLibrary" },
            { icon: "🔄", label: "Inter-Dept\nTransit" },
            { icon: "🏛️", label: "Target\nLibrary" },
            { icon: "✅", label: "Student\nPickup" },
          ].map((step, i, arr) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-2 min-w-[60px]">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${i < 4 ? "bg-[#0d9488] shadow-md" : "bg-[#e2e8f0]"}`}
                  style={{ boxShadow: i < 4 ? "0 4px 12px rgba(13,148,136,0.3)" : undefined }}>
                  {step.icon}
                </div>
                <p className="text-[10px] text-center text-[#64748b] leading-tight whitespace-pre-line">{step.label}</p>
              </div>
              {i < arr.length - 1 && (
                <div className={`flex-1 h-0.5 mt-[-16px] ${i < 3 ? "bg-[#0d9488]" : "bg-[#e2e8f0]"}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {transfers.length === 0 && !loading ? (
        <Card className="p-12 text-center">
          <p className="text-base font-semibold text-[#0f1f3d]">No Active Transfers</p>
          <p className="text-xs text-[#64748b] mt-1">Inter-department transfers are automatically initiated when a student requests a book located in another department.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Transfer list */}
          <div className="space-y-3">
            <SectionHeader title="Active Transfers" />
            {transfers.map((t) => (
              <Card
                key={t.id}
                className={`p-4 cursor-pointer transition-all ${selected?.id === t.id ? "ring-2 ring-[#0d9488] shadow-md" : ""}`}
                onClick={() => setSelected(t)}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-mono font-semibold text-[#0d9488]">{t.id}</p>
                  <Badge variant={STATUS_VARIANT[t.status] || "secondary"}>{t.status}</Badge>
                </div>
                <p className="text-sm font-semibold text-[#0f1f3d] leading-tight">{t.book}</p>
                <p className="text-xs text-[#64748b] mt-1">{t.student} · {t.studentDept}</p>
                <div className="mt-2 text-[11px] text-[#94a3b8]">
                  <div>{t.currentLib} →</div>
                  <div className="text-[#0d9488]">{t.targetLib}</div>
                </div>
                <p className="text-[10px] text-[#94a3b8] mt-1">Requested: {t.requestDate}</p>
              </Card>
            ))}
          </div>

          {/* Transfer detail */}
          {selected && (
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-mono font-semibold text-[#0d9488]">REQUEST {selected.id}</p>
                    <Badge variant={STATUS_VARIANT[selected.status] || "secondary"}>{selected.status}</Badge>
                  </div>
                  <h2 className="text-xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{selected.book}</h2>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  ["Student", selected.student],
                  ["Department", selected.studentDept],
                  ["From Library", selected.currentLib],
                  ["To Library", selected.targetLib],
                  ["Request Date", selected.requestDate],
                ].map(([k, v]) => (
                  <div key={k} className="bg-[#f8fafc] rounded-[10px] px-4 py-3">
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide">{k}</p>
                    <p className="text-sm font-medium text-[#0f1f3d] mt-0.5">{v}</p>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#0f1f3d] mb-4">Transfer Timeline</h3>
                <div className="space-y-3">
                  {selected.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? "bg-[#0d9488]" : step.active ? "bg-[#1e3a5f] ring-4 ring-[#1e3a5f]/20" : "bg-[#e2e8f0]"}`}>
                        {step.done ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M9 11l3 3L22 4"/></svg>
                        ) : step.active ? (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#94a3b8]" />
                        )}
                      </div>
                      <span className={`text-sm ${step.done ? "text-[#0f1f3d]" : step.active ? "text-[#1e3a5f] font-semibold" : "text-[#94a3b8]"}`}>
                        {step.label}
                      </span>
                      {step.active && <Badge variant="warning" className="ml-auto">In Progress</Badge>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selected.status !== "Completed" && (
                <div className="flex gap-2 flex-wrap">
                  {isLibrarian && (
                    <>
                      {selected.rawStatus === "requested" && (
                        <Button variant="accent" size="sm" onClick={handleDispatch}>Dispatch Transfer</Button>
                      )}
                      {(selected.rawStatus === "dispatched" || selected.rawStatus === "in_transit") && (
                        <Button variant="accent" size="sm" onClick={handleMarkReceived}>Mark as Received</Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => showToast(`Notification sent to ${selected.targetLib} staff.`)}>Notify Staff</Button>
                    </>
                  )}
                  {!isLibrarian && (
                    <p className="text-xs text-[#94a3b8] italic">Transfer tracking is managed through institutional courier logistics.</p>
                  )}
                </div>
              )}
              {selected.status === "Completed" && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-[10px] p-3 text-sm text-emerald-700 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                  Transfer completed successfully.
                </div>
              )}
            </Card>
          )}
        </div>
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
