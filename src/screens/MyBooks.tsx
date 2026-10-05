import React, { useState, useEffect } from "react";
import { analyticsApi, renewalsApi, requestsApi } from "../api/client";
import { Card, Badge, Button, Tabs, BookCover, ProgressBar, Modal } from "../components/ui";

export default function MyBooks({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [activeTab, setActiveTab] = useState("borrowed");
  const [borrowed, setBorrowed] = useState<any[]>([]);
  const [requested, setRequested] = useState<any[]>([]);
  const [returned, setReturned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [renewBook, setRenewBook] = useState<any | null>(null);
  const [renewToast, setRenewToast] = useState<string | null>(null);
  const [returnRequestBook, setReturnRequestBook] = useState<any | null>(null);
  const [returnToast, setReturnToast] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    analyticsApi
      .getStudentStats()
      .then((res) => {
        if (res) {
          setBorrowed(
            (res.activeLoans || []).map((b: any) => ({
              id: b._id || b.id,
              borrowId: b._id || b.id,
              title: b.title || b.bookTitle,
              author: b.author || b.bookAuthor || "Author",
              cover: b.cover || b.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
              borrowedDate: b.borrowDate ? new Date(b.borrowDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Recent",
              dueDate: b.dueDate ? new Date(b.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Soon",
              daysRemaining: typeof b.daysRemaining === "number" ? b.daysRemaining : 7,
              renewalCount: b.renewalCount || 0,
              status: "borrowed",
            }))
          );

          setRequested(
            (res.pendingRequests || []).map((r: any) => ({
              id: r._id || r.id,
              requestId: r._id || r.id,
              title: r.bookTitle || "Requested Book",
              author: "Academic Library",
              cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&h=160&fit=crop",
              status: "requested",
              requestStatus: r.status === "pending_transfer" ? "Transfer In Progress" : r.status === "waitlisted" ? "Waitlisted" : "In Review",
            }))
          );

          setReturned(
            (res.loanHistory || []).map((h: any) => ({
              id: h._id || h.id,
              title: h.bookTitle || "Returned Book",
              author: h.bookAuthor || "Author",
              cover: h.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
              returnedDate: h.returnDate ? new Date(h.returnDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Completed",
              status: "returned",
              progress: 100,
            }))
          );
        }
      })
      .catch((err) => console.error("Error loading student books:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  async function handleRenew() {
    if (!renewBook) return;
    try {
      const res = await renewalsApi.requestRenewal(renewBook.borrowId || renewBook.id, "Student requested extension");
      setRenewBook(null);
      setRenewToast(res.message || "Book successfully renewed for 14 additional days!");
      setTimeout(() => setRenewToast(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Could not renew book. Check renewal policy limits.");
    }
  }

  async function handleCancelRequest(reqId: string) {
    if (!confirm("Are you sure you want to cancel this borrow request?")) return;
    try {
      await requestsApi.cancelRequest(reqId);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to cancel request");
    }
  }

  const tabMap: Record<string, any[]> = {
    borrowed,
    requested,
    returned,
  };

  const books = tabMap[activeTab] || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>My Books</h1>
        <p className="text-[#64748b] mt-0.5">Track your borrowed, requested, and returned books</p>
      </div>

      <Tabs
        active={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "borrowed", label: "Currently Borrowed", count: borrowed.length },
          { id: "requested", label: "Requested", count: requested.length },
          { id: "returned", label: "Returned", count: returned.length },
        ]}
      />

      {books.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-5xl mb-3">📚</div>
          <p className="font-semibold text-[#0f1f3d]">No books in this category</p>
          <p className="text-sm text-[#64748b] mt-1">Explore our centralized catalog to find books you'd like to read</p>
          <Button variant="accent" className="mt-4" onClick={() => onNavigate("books")}>Explore Books</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {books.map((book) => (
            <Card key={book.id} className="p-5">
              <div className="flex gap-4">
                <BookCover src={book.cover} alt={book.title} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0f1f3d] text-sm leading-tight">{book.title}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{book.author}</p>

                  {book.status === "borrowed" && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#94a3b8]">Borrowed</span>
                        <span className="text-[#64748b] font-medium">{book.borrowedDate}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#94a3b8]">Due</span>
                        <span className={`font-medium ${book.daysRemaining <= 4 ? "text-amber-600" : "text-[#0f1f3d]"}`}>
                          {book.dueDate}
                        </span>
                      </div>
                      <div className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 ${
                        book.daysRemaining <= 4 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {book.daysRemaining <= 4 ? "⚠" : "✓"} {book.daysRemaining} days remaining
                      </div>
                    </div>
                  )}

                  {book.status === "requested" && (
                    <div className="mt-3">
                      <Badge variant="warning">{book.requestStatus}</Badge>
                      <p className="text-[11px] text-[#94a3b8] mt-2">Institutional routing active</p>
                    </div>
                  )}

                  {book.status === "returned" && (
                    <div className="mt-3 space-y-1">
                      <p className="text-[11px] text-[#94a3b8] mt-1">Returned: {book.returnedDate}</p>
                      <Badge variant="success" className="text-[10px]">Returned to Inventory</Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4 border-t border-[#f8fafc] pt-3">
                {book.status === "borrowed" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setRenewBook(book)}
                    >
                      Renew Book
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => onNavigate("books")}
                    >
                      View Details
                    </Button>
                  </>
                )}
                {book.status === "requested" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:bg-red-50"
                    onClick={() => handleCancelRequest(book.requestId || book.id)}
                  >
                    Cancel Request
                  </Button>
                )}
                {book.status === "returned" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onNavigate("books")}
                  >
                    Borrow Again
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Renew Modal */}
      {renewBook && (
        <Modal open={!!renewBook} onClose={() => setRenewBook(null)} title="Renew Book">
          <div className="space-y-4">
            <p className="text-sm text-[#374151]">
              Renew <strong>{renewBook.title}</strong> for an additional 14 days?
            </p>
            <p className="text-xs text-[#64748b]">
              Note: Maximum 2 renewals permitted per checkout according to institutional library regulations.
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="accent" className="flex-1" onClick={handleRenew}>Confirm Renewal</Button>
              <Button variant="outline" onClick={() => setRenewBook(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}

      {renewToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2.5 rounded-[10px] text-xs shadow-xl z-50 flex items-center gap-2">
          <span>✓</span>
          <span>{renewToast}</span>
        </div>
      )}
    </div>
  );
}
