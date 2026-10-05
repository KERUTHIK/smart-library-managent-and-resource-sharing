import React, { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { analyticsApi, booksApi } from "../api/client";
import { KpiCard, Card, Badge, SectionHeader, BookCover } from "../components/ui";

type TimeFilter = "7d" | "30d" | "3m" | "1y";

export default function AdminDashboard({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    kpis: any;
    circulationData: any[];
    deptActivity: any[];
    recentActivity: any[];
  }>({
    kpis: {
      totalBooks: 0,
      ebooks: 0,
      activeUsers: 0,
      pendingRequests: 0,
      overdueBooks: 0,
      departments: 0,
    },
    circulationData: [],
    deptActivity: [],
    recentActivity: [],
  });
  const [popularBooks, setPopularBooks] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      analyticsApi.getAdminStats(timeFilter),
      booksApi.getBooks({ limit: 5 }),
    ])
      .then(([adminData, booksData]) => {
        if (!isMounted) return;
        setStats({
          kpis: adminData.kpis || {},
          circulationData: adminData.circulationData || [],
          deptActivity: adminData.deptActivity || [],
          recentActivity: adminData.recentActivity || [],
        });
        if (booksData.items) {
          setPopularBooks(booksData.items);
        }
      })
      .catch((err) => console.error("Failed to load admin dashboard data:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [timeFilter]);

  const kpiList = [
    { label: "Total Books", value: (stats.kpis.totalBooks || 0).toLocaleString(), icon: <BookSvg />, color: "navy", change: "+148 this month" },
    { label: "E-Books", value: (stats.kpis.ebooks || 0).toLocaleString(), icon: <TabletSvg />, color: "teal", change: "+62 this month" },
    { label: "Active Users", value: (stats.kpis.activeUsers || 0).toLocaleString(), icon: <UsersSvg />, color: "blue", change: "92% engagement rate" },
    { label: "Pending Requests", value: (stats.kpis.pendingRequests || 0).toLocaleString(), icon: <InboxSvg />, color: "amber", change: `${stats.kpis.pendingRequests || 0} need attention` },
    { label: "Overdue Books", value: (stats.kpis.overdueBooks || 0).toLocaleString(), icon: <AlertSvg />, color: "red", change: "Overdue loans" },
    { label: "Departments", value: (stats.kpis.departments || 0).toLocaleString(), icon: <BuildingSvg />, color: "purple", change: "All connected" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Good morning, Admin 👋
        </h1>
        <p className="text-[#64748b] mt-1">Here's what's happening across your institution.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiList.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} icon={k.icon} color={k.color as any} change={k.change} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Circulation trend */}
        <Card className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Library Circulation Trend</h2>
              <p className="text-xs text-[#64748b] mt-0.5">Books borrowed, returned and e-book views</p>
            </div>
            <div className="flex gap-1">
              {(["7d", "30d", "3m", "1y"] as TimeFilter[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeFilter(t)}
                  className={`px-3 py-1 rounded-[7px] text-xs font-medium cursor-pointer ${timeFilter === t ? "bg-[#1e3a5f] text-white" : "text-[#64748b] hover:bg-[#f1f5f9]"}`}
                >
                  {t === "7d" ? "7 Days" : t === "30d" ? "30 Days" : t === "3m" ? "3 Months" : "1 Year"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.circulationData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="borrowed" stroke="#1e3a5f" strokeWidth={2} dot={false} name="Borrowed" />
              <Line type="monotone" dataKey="returned" stroke="#0d9488" strokeWidth={2} dot={false} name="Returned" />
              <Line type="monotone" dataKey="ebooks" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="5 3" name="E-book Views" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Dept Activity */}
        <Card className="p-5">
          <SectionHeader title="Department Activity" subtitle="Book interactions by dept" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.deptActivity} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="dept" type="category" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="activity" fill="#0d9488" radius={[0, 6, 6, 0]} name="Activity" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Most Borrowed Books */}
        <Card className="xl:col-span-2 p-5">
          <SectionHeader title="Most Borrowed Books" action={
            <button onClick={() => onNavigate("books")} className="text-xs font-medium text-[#0d9488] hover:underline cursor-pointer">View all</button>
          } />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f1f5f9]">
                  {["Book", "Department", "Borrows", "Status"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-[#64748b] pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8fafc]">
                {popularBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-[#f8fafc] cursor-pointer" onClick={() => onNavigate("books")}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <BookCover src={book.cover} alt={book.title} size="sm" />
                        <div>
                          <p className="font-medium text-[#0f1f3d] text-xs leading-tight">{book.title}</p>
                          <p className="text-[#64748b] text-[11px] mt-0.5">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-[#64748b]">{book.dept || book.department}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs font-medium text-[#0f1f3d]">{book.total || book.count || 1}</span>
                    </td>
                    <td className="py-3">
                      <Badge variant={book.available > 0 ? "success" : "danger"}>
                        {book.available > 0 ? "Available" : "Unavailable"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-5">
          <SectionHeader title="Recent Activity" />
          <div className="space-y-3">
            {stats.recentActivity.map((act) => (
              <div key={act.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center text-base flex-shrink-0">
                  {act.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#0f1f3d] leading-snug">{act.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[#64748b]">{act.time}</span>
                    <span className="text-[10px] text-[#94a3b8]">·</span>
                    <span className="text-[10px] text-[#0d9488]">{act.dept}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
}

const BookSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z"/></svg>;
const TabletSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1"/></svg>;
const UsersSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const InboxSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>;
const AlertSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const BuildingSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21V11h6v10"/></svg>;
