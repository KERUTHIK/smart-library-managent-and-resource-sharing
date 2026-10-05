import React, { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, KpiCard } from "../components/ui";
import { analyticsApi } from "../api/client";

type Period = "7d" | "30d" | "3m" | "1y";

const DEFAULT_SUBJECTS = [
  { subject: "Computer Science", count: 184 },
  { subject: "Electronics", count: 142 },
  { subject: "Mechanical", count: 118 },
  { subject: "Information Tech", count: 96 },
  { subject: "Mathematics", count: 74 },
  { subject: "Physics", count: 52 },
];

const PEAK_USAGE = [
  { hour: "8AM", usage: 14 }, { hour: "9AM", usage: 38 }, { hour: "10AM", usage: 72 },
  { hour: "11AM", usage: 94 }, { hour: "12PM", usage: 68 }, { hour: "1PM", usage: 46 },
  { hour: "2PM", usage: 82 }, { hour: "3PM", usage: 104 }, { hour: "4PM", usage: 118 },
  { hour: "5PM", usage: 86 }, { hour: "6PM", usage: 48 }, { hour: "7PM", usage: 22 },
];

export default function Analytics({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [period, setPeriod] = useState<Period>("30d");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await analyticsApi.getAdminStats(period);
        if (res && res.success) {
          setStats(res);
        }
      } catch (err) {
        console.error("Failed to load analytics stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [period]);

  const circulationData = stats?.circulationData && stats.circulationData.length > 0
    ? stats.circulationData
    : [
        { date: "Day 1", borrowed: 18, returned: 14, ebooks: 12 },
        { date: "Day 2", borrowed: 24, returned: 19, ebooks: 15 },
        { date: "Day 3", borrowed: 31, returned: 26, ebooks: 22 },
        { date: "Day 4", borrowed: 28, returned: 22, ebooks: 18 },
      ];

  const deptPerformance = stats?.deptActivity && stats.deptActivity.length > 0
    ? stats.deptActivity.map((d: any, idx: number) => ({
        dept: d.dept || "General",
        borrowing: d.activity || 12,
        returns: Math.round((d.activity || 12) * 0.85),
        users: Math.round((d.activity || 12) * 0.7),
        utilization: Math.min(95, 60 + (idx * 7) % 35),
      }))
    : [
        { dept: "Computer Science", borrowing: 48, returns: 42, users: 34, utilization: 88 },
        { dept: "Electronics", borrowing: 36, returns: 31, users: 27, utilization: 76 },
        { dept: "Information Tech", borrowing: 29, returns: 25, users: 21, utilization: 72 },
        { dept: "Mechanical", borrowing: 22, returns: 19, users: 16, utilization: 64 },
        { dept: "Civil", borrowing: 17, returns: 14, users: 12, utilization: 55 },
      ];

  const totalBorrowed = circulationData.reduce((s: number, c: any) => s + (c.borrowed || 0), 0);
  const totalReturned = circulationData.reduce((s: number, c: any) => s + (c.returned || 0), 0);
  const totalEbooks = circulationData.reduce((s: number, c: any) => s + (c.ebooks || 0), 0);
  const totalCirculation = totalBorrowed + totalEbooks;
  const physicalPct = totalCirculation > 0 ? Math.round((totalBorrowed / totalCirculation) * 100) : 60;
  const ebookPct = 100 - physicalPct;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Library Analytics
          </h1>
          <p className="text-[#64748b] mt-0.5 max-w-xl">
            Understand library usage, circulation, departments and resource trends across your institution.
          </p>
        </div>
        <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-[10px]">
          {(["7d", "30d", "3m", "1y"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-medium cursor-pointer transition-all ${period === p ? "bg-white text-[#0f1f3d] shadow-sm" : "text-[#64748b] hover:text-[#0f1f3d]"}`}
            >
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : p === "3m" ? "3 Months" : "1 Year"}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Circulation" value={totalCirculation.toLocaleString()} icon={<span className="text-base">📊</span>} color="navy" change="Real-time loans" />
        <KpiCard label="Active Users" value={stats?.kpis?.find((k: any) => k.label === "Active Users")?.value || "24"} icon={<span className="text-base">👥</span>} color="teal" change="Registered campus" />
        <KpiCard label="E-Book Usage" value={totalEbooks.toLocaleString()} icon={<span className="text-base">📱</span>} color="blue" change="Digital downloads" />
        <KpiCard label="Physical Usage" value={totalBorrowed.toLocaleString()} icon={<span className="text-base">📚</span>} color="amber" change="Checked out" />
        <KpiCard label="Top Department" value="CSE" icon={<span className="text-base">🏆</span>} color="purple" change="Computer Science" />
        <KpiCard label="Resource Utilization" value="84%" icon={<span className="text-base">📈</span>} color="teal" change="Optimal capacity" />
      </div>

      {/* Circulation Trend */}
      <Card className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Library Circulation Trend</h2>
            <p className="text-xs text-[#64748b] mt-0.5">Books borrowed, returned and e-book views over time</p>
          </div>
          {loading && <span className="text-xs text-[#64748b] animate-pulse">Updating metrics...</span>}
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={circulationData} margin={{ left: -15, right: 10, top: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="borrowed" stroke="#1e3a5f" strokeWidth={2.5} dot={false} name="Borrowed" />
            <Line type="monotone" dataKey="returned" stroke="#0d9488" strokeWidth={2} dot={false} name="Returned" />
            <Line type="monotone" dataKey="ebooks" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 3" dot={false} name="E-Book Views" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Department Performance + Subjects */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Dept Performance */}
        <Card className="xl:col-span-2 p-5">
          <h2 className="font-semibold text-[#0f1f3d] mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Department Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f1f5f9]">
                  {["Department", "Borrowing", "Returns", "Active Users", "Utilization"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-[#64748b] pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8fafc]">
                {deptPerformance.map((d: any) => (
                  <tr key={d.dept} className="hover:bg-[#f8fafc]">
                    <td className="py-3 pr-4 text-xs font-medium text-[#0f1f3d]">{d.dept}</td>
                    <td className="py-3 pr-4 text-xs font-mono text-[#0f1f3d]">{d.borrowing.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-xs font-mono text-[#64748b]">{d.returns.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-xs font-mono text-[#64748b]">{d.users.toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#f1f5f9] rounded-full max-w-[60px]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${d.utilization}%`, backgroundColor: d.utilization >= 80 ? "#0d9488" : d.utilization >= 60 ? "#f59e0b" : "#94a3b8" }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#0f1f3d]">{d.utilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Popular Subjects */}
        <Card className="p-5">
          <h2 className="font-semibold text-[#0f1f3d] mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Popular Subjects</h2>
          <div className="space-y-3">
            {DEFAULT_SUBJECTS.map((s, i) => {
              const max = DEFAULT_SUBJECTS[0].count;
              return (
                <div key={s.subject}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-[#0f1f3d]">{s.subject}</span>
                    <span className="text-[#64748b] font-mono">{s.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-[#f1f5f9] rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(s.count / max) * 100}%`,
                        backgroundColor: ["#1e3a5f", "#0d9488", "#6366f1", "#f59e0b", "#059669", "#94a3b8"][i],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Physical vs E-Book + Peak Usage */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Physical vs E-Book */}
        <Card className="p-5">
          <h2 className="font-semibold text-[#0f1f3d] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Physical vs E-Book Usage</h2>
          <p className="text-xs text-[#64748b] mb-4">Circulation split between physical books and e-books</p>
          <div className="flex gap-6 mb-4">
            {[
              { label: "Physical Books", value: totalBorrowed, pct: physicalPct, color: "#1e3a5f" },
              { label: "E-Books", value: totalEbooks, pct: ebookPct, color: "#6366f1" },
            ].map((item) => (
              <div key={item.label} className="flex-1 text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={item.color} strokeWidth="3"
                      strokeDasharray={`${item.pct} ${100 - item.pct}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#0f1f3d]">{item.pct}%</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-[#0f1f3d]">{item.label}</p>
                <p className="text-xs text-[#64748b]">{item.value.toLocaleString()} uses</p>
              </div>
            ))}
            <div className="flex-1">
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide font-medium mb-2">Trend</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-[#64748b]">E-book growth</span><span className="font-semibold text-emerald-600">+18%</span></div>
                <div className="flex justify-between"><span className="text-[#64748b]">Physical growth</span><span className="font-semibold text-[#0d9488]">+6%</span></div>
                <div className="flex justify-between"><span className="text-[#64748b]">Mobile reads</span><span className="font-semibold text-purple-600">+34%</span></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Peak Usage */}
        <Card className="p-5">
          <h2 className="font-semibold text-[#0f1f3d] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Peak Usage Periods</h2>
          <p className="text-xs text-[#64748b] mb-4">Library resource usage by hour of day</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={PEAK_USAGE} margin={{ left: -20, right: 5, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }} />
              <Bar dataKey="usage" name="Activity" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex gap-4 text-xs">
            <div><span className="text-[#94a3b8]">Peak time: </span><span className="font-semibold text-[#0f1f3d]">4:00 PM</span></div>
            <div><span className="text-[#94a3b8]">Quietest: </span><span className="font-semibold text-[#0f1f3d]">8:00 AM</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
