import React, { useState, useEffect } from "react";
import { finesApi } from "../api/client";
import { Card, Badge, Button, KpiCard, Modal, BookCover } from "../components/ui";

type PayStep = "form" | "processing" | "done";
type HistoryTab = "fines" | "history";

export default function FinesScreen() {
  const [fines, setFines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState<any | null>(null);
  const [payAllModal, setPayAllModal] = useState(false);
  const [payStep, setPayStep] = useState<PayStep>("form");
  const [payMethod, setPayMethod] = useState("UPI");
  const [activeTab, setActiveTab] = useState<HistoryTab>("fines");
  const [txnId, setTxnId] = useState("");

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
              book: f.bookTitle || "Academic Textbook",
              cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
              dueDate: new Date(f.createdAt || Date.now()).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              daysOverdue: f.daysOverdue || 0,
              fine: f.amount || 0,
              status: f.status || "unpaid",
              paidDate: f.paidAt ? new Date(f.paidAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null,
              txn: f.transactionReference || "ONLINE-PAY",
            }))
          );
        }
      })
      .catch((err) => console.error("Error fetching fines:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const unpaidFines = fines.filter((f) => f.status === "unpaid");
  const paidFines = fines.filter((f) => f.status === "paid");
  const totalFine = unpaidFines.reduce((s, f) => s + f.fine, 0);

  async function doPay(fineId: string) {
    setPayStep("processing");
    try {
      const res = await finesApi.payFine({
        fineId,
        paymentMethod: payMethod,
      });
      setTxnId(res.payment?.transactionReference || `TXN-${Math.floor(100000 + Math.random() * 900000)}`);
      setPayStep("done");
      fetchFines();
    } catch (err: any) {
      alert(err.message || "Payment failed");
      setPayStep("form");
    }
  }

  async function doPayAll() {
    if (unpaidFines.length === 0) return;
    setPayStep("processing");
    try {
      for (const fine of unpaidFines) {
        await finesApi.payFine({
          fineId: fine.id,
          paymentMethod: payMethod,
        });
      }
      setTxnId(`TXN-BULK-${Math.floor(100000 + Math.random() * 900000)}`);
      setPayStep("done");
      fetchFines();
    } catch (err: any) {
      alert(err.message || "Payment failed");
      setPayStep("form");
    }
  }

  function closePayModal() {
    setPayModal(null);
    setPayAllModal(false);
    setPayStep("form");
  }

  const PaymentForm = ({ fine, amount, onPay }: { fine?: any; amount: number; onPay: () => void }) => (
    <div className="space-y-4">
      {fine ? (
        <div className="flex items-center gap-3 bg-[#f8fafc] rounded-[10px] p-3 border border-[#e2e8f0]">
          <BookCover src={fine.cover} alt={fine.book} size="sm" />
          <div>
            <p className="text-sm font-semibold text-[#0f1f3d]">{fine.book}</p>
            <p className="text-xs text-[#64748b]">{fine.daysOverdue} days overdue · Due {fine.dueDate}</p>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-100 rounded-[10px] p-3 text-center">
          <p className="text-xs text-red-600 mb-0.5">{unpaidFines.length} outstanding fines</p>
          <p className="text-2xl font-bold text-red-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>₹{amount}</p>
        </div>
      )}

      <div className="flex items-center justify-between bg-[#f1f5f9] rounded-[10px] px-4 py-3">
        <span className="text-sm text-[#64748b]">Total Payable</span>
        <span className="text-xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>₹{amount}</span>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#0f1f3d] mb-2">Payment Method</p>
        <div className="grid grid-cols-3 gap-2">
          {[["UPI", "📱"], ["Card", "💳"], ["Net Banking", "🏦"]].map(([m, icon]) => (
            <button
              key={m}
              onClick={() => setPayMethod(m)}
              className={`flex flex-col items-center gap-1.5 border rounded-[10px] p-3 cursor-pointer transition-all ${payMethod === m ? "border-[#0d9488] bg-teal-50" : "border-[#e2e8f0] hover:border-[#0d9488]"}`}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs font-medium text-[#64748b]">{m}</span>
            </button>
          ))}
        </div>
      </div>

      <Button variant="danger" className="w-full" onClick={onPay}>
        Pay ₹{amount} Securely
      </Button>
      <p className="text-[10px] text-[#94a3b8] text-center">🔒 Secured institutional payment gateway</p>
    </div>
  );

  const ProcessingState = () => (
    <div className="text-center py-8">
      <div className="w-14 h-14 rounded-full border-4 border-[#0d9488]/20 border-t-[#0d9488] animate-spin mx-auto mb-4" />
      <p className="font-semibold text-[#0f1f3d]">Processing Payment…</p>
      <p className="text-xs text-[#64748b] mt-1">Please do not close this window</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Fines & Payments</h1>
        <p className="text-[#64748b] mt-0.5">View and pay your library overdue fines online</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total Unpaid Fines"
          value={`₹${totalFine}`}
          icon={<span className="text-xl">💰</span>}
          color="red"
          change={unpaidFines.length > 0 ? `${unpaidFines.length} overdue books` : "No pending fines"}
        />
        <KpiCard
          label="Fine Rate"
          value="₹5 / day"
          icon={<span className="text-xl">📅</span>}
          color="navy"
          change="Standard college policy"
        />
        <KpiCard
          label="Total Paid (All Time)"
          value={`₹${paidFines.reduce((s, f) => s + f.fine, 0)}`}
          icon={<span className="text-xl">✓</span>}
          color="teal"
          change={`${paidFines.length} transactions`}
        />
      </div>

      {/* Unpaid alert */}
      {totalFine > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-[12px] p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl text-red-600">⚠️</div>
            <div>
              <p className="font-semibold text-red-800 text-sm">You have ₹{totalFine} in outstanding fines</p>
              <p className="text-xs text-red-600 mt-0.5">Clear your fines to avoid borrowing restrictions.</p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => setPayAllModal(true)}>
            Pay All (₹{totalFine})
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#e2e8f0]">
        <button
          onClick={() => setActiveTab("fines")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 cursor-pointer transition-all ${activeTab === "fines" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-[#64748b] hover:text-[#0f1f3d]"}`}
        >
          Outstanding Fines ({unpaidFines.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 cursor-pointer transition-all ${activeTab === "history" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-[#64748b] hover:text-[#0f1f3d]"}`}
        >
          Payment History ({paidFines.length})
        </button>
      </div>

      {/* Outstanding fines list */}
      {activeTab === "fines" && (
        <div className="space-y-3">
          {unpaidFines.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-3">✓</div>
              <h3 className="font-semibold text-[#0f1f3d] text-base" style={{ fontFamily: "'DM Sans', sans-serif" }}>No Outstanding Fines</h3>
              <p className="text-xs text-[#64748b] mt-1">You are all clear! Return your books on time to keep it this way.</p>
            </Card>
          ) : (
            unpaidFines.map((f) => (
              <Card key={f.id} className="p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                <BookCover src={f.cover} alt={f.book} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-[#0f1f3d] truncate">{f.book}</p>
                    <Badge variant="danger">Unpaid</Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-[#64748b] flex-wrap">
                    <span>Due Date: <strong className="text-[#0f1f3d]">{f.dueDate}</strong></span>
                    <span>Days Overdue: <strong className="text-red-600">{f.daysOverdue} days</strong></span>
                    <span>Rate: <strong className="text-[#0f1f3d]">₹5/day</strong></span>
                  </div>
                </div>
                <div className="text-right sm:text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-red-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>₹{f.fine}</p>
                  <Button variant="danger" size="sm" className="mt-2" onClick={() => setPayModal(f)}>
                    Pay ₹{f.fine}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Payment history */}
      {activeTab === "history" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                  {["Book", "Amount", "Paid Date", "Method", "Transaction ID", "Status"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-[#64748b] py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8fafc]">
                {paidFines.map((h) => (
                  <tr key={h.id} className="hover:bg-[#f8fafc]">
                    <td className="py-3 px-4 font-medium text-xs text-[#0f1f3d]">{h.book}</td>
                    <td className="py-3 px-4 font-bold text-xs text-[#0f1f3d]">₹{h.fine}</td>
                    <td className="py-3 px-4 text-xs text-[#64748b]">{h.paidDate}</td>
                    <td className="py-3 px-4 text-xs text-[#64748b]">Online</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#94a3b8]">{h.txn}</td>
                    <td className="py-3 px-4"><Badge variant="success">Paid</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pay Single Modal */}
      {payModal && (
        <Modal open={!!payModal} onClose={closePayModal} title={payStep === "done" ? "Payment Successful" : "Pay Fine"}>
          {payStep === "form" && (
            <PaymentForm fine={payModal} amount={payModal.fine} onPay={() => doPay(payModal.id)} />
          )}
          {payStep === "processing" && <ProcessingState />}
          {payStep === "done" && (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto">✓</div>
              <h3 className="font-bold text-lg text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Payment Successful!</h3>
              <p className="text-xs text-[#64748b]">Transaction Reference: <strong className="font-mono text-[#0f1f3d]">{txnId}</strong></p>
              <Button variant="primary" className="w-full mt-4" onClick={closePayModal}>Done</Button>
            </div>
          )}
        </Modal>
      )}

      {/* Pay All Modal */}
      {payAllModal && (
        <Modal open={payAllModal} onClose={closePayModal} title={payStep === "done" ? "All Fines Paid" : "Pay All Outstanding Fines"}>
          {payStep === "form" && (
            <PaymentForm amount={totalFine} onPay={doPayAll} />
          )}
          {payStep === "processing" && <ProcessingState />}
          {payStep === "done" && (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto">✓</div>
              <h3 className="font-bold text-lg text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>All Fines Cleared!</h3>
              <p className="text-xs text-[#64748b]">Total paid: <strong>₹{totalFine}</strong></p>
              <Button variant="primary" className="w-full mt-4" onClick={closePayModal}>Done</Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
