import React, { useState, useEffect } from "react";
import { requestsApi, analyticsApi } from "../api/client";
import { KpiCard, Card, Badge, Button, SectionHeader, Modal, Tabs } from "../components/ui";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "secondary"> = {
  "Approved": "success",
  "auto_approved": "success",
  "approved": "success",
  "Transfer Required": "warning",
  "pending_transfer": "warning",
  "Pending": "info",
  "pending": "info",
  "Waitlisted": "secondary",
  "waitlisted": "secondary",
  "Rejected": "danger",
  "rejected": "danger",
};

export default function LibrarianDashboard({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalBooks: 0,
    available: 0,
    issued: 0,
    pendingRequests: 0,
    overdue: 0,
    inTransfer: 0,
    returnedToday: 0,
    pendingReturns: 0,
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      requestsApi.getRequests(),
      analyticsApi.getLibrarianStats(),
    ])
      .then(([reqRes, statsRes]) => {
        if (reqRes.requests) {
          setRequests(
            reqRes.requests.map((r: any) => ({
              id: r._id || r.id,
              requestId: r.requestId || r.id,
              student: r.studentName || r.student?.name || "Student",
              studentId: r.studentCollegeId || r.student?.collegeId || "ID",
              book: r.bookTitle || r.book?.title || "Book",
              requestDate: new Date(r.createdAt || Date.now()).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              availability: r.availabilityNote || (r.sourceLibraryName ? `Available — ${r.sourceLibraryName}` : "In Review"),
              location: r.pickupLibraryName || "Central Library",
              status: formatStatus(r.status),
              rawStatus: r.status,
              aiRecommendation: r.aiRecommendation,
            }))
          );
        }
        if (statsRes.kpis) {
          setKpis({
            totalBooks: statsRes.kpis.totalBooks || 0,
            available: statsRes.kpis.available || 0,
            issued: statsRes.kpis.issued || 0,
            pendingRequests: statsRes.kpis.pendingRequests || 0,
            overdue: statsRes.kpis.overdue || 0,
            inTransfer: statsRes.kpis.inTransfer || 0,
            returnedToday: statsRes.kpis.returnedToday || 0,
            pendingReturns: statsRes.kpis.pendingReturns || 0,
          });
        }
      })
      .catch((err) => console.error("Failed to load librarian dashboard data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  function formatStatus(status: string) {
    if (status === "pending") return "Pending";
    if (status === "auto_approved" || status === "approved") return "Approved";
    if (status === "pending_transfer") return "Transfer Required";
    if (status === "waitlisted") return "Waitlisted";
    if (status === "rejected") return "Rejected";
    return status;
  }

  const filtered = activeTab === "all" ? requests : requests.filter((r) => {
    if (activeTab === "pending") return r.status === "Pending";
    if (activeTab === "transfer") return r.status === "Transfer Required";
    if (activeTab === "approved") return r.status === "Approved";
    return true;
  });

  async function approve(id: string) {
    try {
      await requestsApi.approveRequest(id);
      loadData();
      setSelectedReq(null);
    } catch (err: any) {
      alert(err.message || "Failed to approve request");
    }
  }

  async function reject(id: string) {
    const reason = prompt("Enter reason for rejection:") || "Rejected by librarian";
    try {
      await requestsApi.rejectRequest(id, reason);
      loadData();
      setSelectedReq(null);
    } catch (err: any) {
      alert(err.message || "Failed to reject request");
    }
  }

  const kpiList = [
    { label: "Total Books", value: (kpis.totalBooks || 0).toLocaleString(), icon: <BookSvg />, color: "navy" },
    { label: "Available", value: (kpis.available || 0).toLocaleString(), icon: <CheckSvg />, color: "teal" },
    { label: "Issued", value: (kpis.issued || 0).toLocaleString(), icon: <IssuedSvg />, color: "blue" },
    { label: "Pending Requests", value: (kpis.pendingRequests || 0).toLocaleString(), icon: <InboxSvg />, color: "amber" },
    { label: "Overdue", value: (kpis.overdue || 0).toLocaleString(), icon: <AlertSvg />, color: "red" },
    { label: "In Transfer", value: (kpis.inTransfer || 0).toLocaleString(), icon: <ArrowSvg />, color: "purple" },
    { label: "Returned Today", value: (kpis.returnedToday || 0).toLocaleString(), icon: <ReturnSvg />, color: "teal" },
    { label: "Pending Returns", value: (kpis.pendingReturns || 0).toLocaleString(), icon: <ClockSvg />, color: "amber" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Good morning, Librarian 👋
          </h1>
          <p className="text-[#64748b] mt-0.5">Manage your department library efficiently.</p>
        </div>
        <div className="bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-[12px] px-4 py-2.5 text-right hidden sm:block">
          <p className="text-xs text-[#0d9488] font-medium">Your Department</p>
          <p className="text-sm font-semibold text-[#0f1f3d]">Computer Science Dept Library</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {kpiList.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} icon={k.icon} color={k.color as any} />
        ))}
      </div>

      {/* Borrow Requests Table */}
      <Card className="p-5">
        <SectionHeader
          title="Borrow Requests"
          subtitle="Review and approve student book requests"
          action={
            <Button variant="accent" size="sm" onClick={() => onNavigate("add-book")}>
              + Add Book
            </Button>
          }
        />

        <Tabs
          active={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "all", label: "All Requests", count: requests.length },
            { id: "pending", label: "Pending", count: requests.filter((r) => r.status === "Pending").length },
            { id: "transfer", label: "Transfer Required", count: requests.filter((r) => r.status === "Transfer Required").length },
            { id: "approved", label: "Approved", count: requests.filter((r) => r.status === "Approved").length },
          ]}
        />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f1f5f9]">
                {["Student", "Book", "Request Date", "Availability", "Location", "Status", "✨ AI Recommendation", "Actions"].map((h) => (
                  <th key={h} className={`text-left text-xs font-medium pb-3 pr-4 whitespace-nowrap ${h.includes("AI") ? "text-purple-600" : "text-[#64748b]"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8fafc]">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-[#f8fafc]">
                  <td className="py-3 pr-4">
                    <div>
                      <p className="font-medium text-[#0f1f3d] text-xs">{req.student}</p>
                      <p className="text-[#94a3b8] text-[11px] font-mono">{req.studentId}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-xs font-medium text-[#0f1f3d] max-w-[140px] leading-tight">{req.book}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-[#64748b]">{req.requestDate}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-md ${
                      req.availability.includes("CSE") ? "bg-emerald-50 text-emerald-700" :
                      req.availability.includes("Transfer") ? "bg-amber-50 text-amber-700" :
                      req.availability.includes("Issued") ? "bg-red-50 text-red-700" :
                      "bg-blue-50 text-blue-700"
                    }`}>{req.availability}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-[#64748b]">{req.location}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={STATUS_VARIANT[req.status] || "secondary"}>{req.status}</Badge>
                  </td>
                  <td className="py-3 pr-4 max-w-[180px]">
                    {req.aiRecommendation ? (
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[10px]">✨</span>
                          <span className={`text-[10px] font-semibold ${req.aiRecommendation.action?.includes("APPROVE") ? "text-emerald-700" : "text-amber-700"}`}>
                            {req.aiRecommendation.action}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#94a3b8] leading-snug">{req.aiRecommendation.reason}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#94a3b8]">Verified</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {req.rawStatus === "pending" || req.status === "Pending" || req.status === "Transfer Required" ? (
                        <>
                          <button
                            onClick={() => approve(req.id)}
                            className="text-[11px] px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-[6px] cursor-pointer font-medium"
                          >Approve</button>
                          <button
                            onClick={() => reject(req.id)}
                            className="text-[11px] px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-[6px] cursor-pointer font-medium"
                          >Reject</button>
                        </>
                      ) : null}
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="text-[11px] px-2.5 py-1 bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] rounded-[6px] cursor-pointer"
                      >Details</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Request Detail Modal */}
      {selectedReq && (
        <Modal open={!!selectedReq} onClose={() => setSelectedReq(null)} title="Request Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Request ID", selectedReq.requestId || selectedReq.id],
                ["Student", selectedReq.student],
                ["Student ID", selectedReq.studentId],
                ["Book", selectedReq.book],
                ["Request Date", selectedReq.requestDate],
                ["Availability", selectedReq.availability],
                ["Location", selectedReq.location],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-[#64748b] mb-0.5">{k}</p>
                  <p className="text-sm font-medium text-[#0f1f3d]">{v}</p>
                </div>
              ))}
              <div>
                <p className="text-xs text-[#64748b] mb-0.5">Status</p>
                <Badge variant={STATUS_VARIANT[selectedReq.status] || "secondary"}>{selectedReq.status}</Badge>
              </div>
            </div>

            {selectedReq.status === "Transfer Required" && (
              <div className="bg-amber-50 border border-amber-100 rounded-[10px] p-3 text-sm text-amber-800">
                📦 This book needs to be transferred from another department library. Approving will initiate the transfer request.
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {(selectedReq.rawStatus === "pending" || selectedReq.status === "Pending" || selectedReq.status === "Transfer Required") && (
                <>
                  <Button variant="accent" className="flex-1" onClick={() => approve(selectedReq.id)}>Approve Request</Button>
                  <Button variant="danger" className="flex-1" onClick={() => reject(selectedReq.id)}>Reject</Button>
                </>
              )}
              <Button variant="outline" onClick={() => setSelectedReq(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

const BookSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z"/></svg>;
const CheckSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>;
const IssuedSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M12 11v6M9 14h6"/></svg>;
const InboxSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>;
const AlertSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const ArrowSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>;
const ReturnSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M20.49 9A9 9 0 005.64 5.64L1 10"/><path d="M23 20v-6h-6M3.51 15a9 9 0 0014.85 3.36L23 14"/></svg>;
const ClockSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
