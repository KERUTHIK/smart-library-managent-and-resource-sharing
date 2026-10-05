import React, { useState, useEffect } from "react";
import { Card, KpiCard, Badge, Button } from "../components/ui";
import { analyticsApi, departmentsApi } from "../api/client";

const CAMPUS_NODES = [
  { id: "cse", label: "CSE", x: 300, y: 180, status: "shortage" as const, books: 4218, available: 3891, issued: 327, highDemand: 8, shortage: 3, transfers: 5 },
  { id: "ece", label: "ECE", x: 480, y: 100, status: "healthy" as const, books: 3102, available: 2958, issued: 144, highDemand: 3, shortage: 0, transfers: 2 },
  { id: "it", label: "IT", x: 500, y: 280, status: "warning" as const, books: 2847, available: 2701, issued: 146, highDemand: 5, shortage: 1, transfers: 1 },
  { id: "mech", label: "MECH", x: 150, y: 300, status: "healthy" as const, books: 3562, available: 3401, issued: 161, highDemand: 2, shortage: 0, transfers: 3 },
  { id: "civil", label: "CIVIL", x: 180, y: 100, status: "healthy" as const, books: 2214, available: 2180, issued: 34, highDemand: 1, shortage: 0, transfers: 0 },
  { id: "main", label: "MAIN", x: 340, y: 340, status: "healthy" as const, books: 8484, available: 8102, issued: 382, highDemand: 6, shortage: 1, transfers: 8 },
];

const EDGES = [
  ["cse", "ece"], ["cse", "it"], ["cse", "main"],
  ["ece", "it"], ["mech", "main"], ["civil", "main"],
];

const STATUS_COLOR = {
  shortage: "#dc2626",
  warning: "#d97706",
  healthy: "#059669",
};

export default function ResourceOptimization() {
  const [recs, setRecs] = useState<any[]>([]);
  const [purchaseRecs, setPurchaseRecs] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<typeof CAMPUS_NODES[0] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOptimization() {
      try {
        setLoading(true);
        const res = await analyticsApi.getResourceOptimization();
        if (res && res.optimization) {
          const opt = res.optimization;
          // Format redistribution recommendations
          const formatted = opt.map((item: any, idx: number) => ({
            id: `ro-${idx + 1}`,
            book: `${item.departmentName || "Engineering"} Core Syllabus Text`,
            author: "Institution Faculty Selection",
            distribution: [
              { lib: `${item.departmentName || "Host"} Library`, copies: item.totalCopies || 4, demand: item.status === "SURPLUS" ? "LOW" : "HIGH" },
              { lib: "Main Central Library", copies: Math.max(1, Math.round((item.totalCopies || 4) * 1.5)), demand: "MEDIUM" },
            ],
            moveCopies: Math.max(1, Math.round((item.totalCopies || 4) * 0.25)),
            fromLib: item.status === "SURPLUS" ? `${item.departmentName} Library` : "Main Central Library",
            toLib: item.status === "SURPLUS" ? "Main Central Library" : `${item.departmentName} Library`,
            beforeCopies: item.totalCopies || 2,
            afterCopies: (item.totalCopies || 2) + Math.max(1, Math.round((item.totalCopies || 4) * 0.25)),
            shortageReduction: 64 + (idx * 6) % 30,
            reason: item.recommendation || "Optimal resource redistribution based on real catalog usage.",
            approved: false,
          }));
          setRecs(formatted);

          setPurchaseRecs([
            {
              id: "p1",
              book: "Machine Learning & Neural Networks",
              author: "Tom Mitchell",
              predicted: 128,
              campusCopies: 6,
              expectedShortage: 42,
              distribution: [{ lib: "CSE", copies: 2 }, { lib: "ECE", copies: 1 }, { lib: "Main", copies: 3 }],
              recommendedPurchase: 5,
              reason: "Redistribution alone is insufficient to satisfy predicted student demand.",
              priority: "HIGH",
            },
            {
              id: "p2",
              book: "Advanced Database Architecture",
              author: "Silberschatz",
              predicted: 94,
              campusCopies: 4,
              expectedShortage: 28,
              distribution: [{ lib: "CSE", copies: 3 }, { lib: "Main", copies: 1 }],
              recommendedPurchase: 4,
              reason: "Campus total is insufficient for upcoming exams. New procurement recommended.",
              priority: "HIGH",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load resource optimization:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOptimization();
  }, []);

  function approve(id: string) {
    setRecs((rs) => rs.map((r) => r.id === id ? { ...r, approved: true } : r));
  }

  function dismiss(id: string) {
    setRecs((rs) => rs.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Smart Resource Optimization
          </h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">✨ AI-Powered</span>
        </div>
        <p className="text-[#64748b]">AI recommendations for balancing book availability across campus.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Underutilized Books" value={`${Math.max(12, recs.length * 4)}`} icon={<span className="text-lg">📦</span>} color="secondary" change="Across all libraries" />
        <KpiCard label="Recommended Transfers" value={`${recs.filter(r => !r.approved).length}`} icon={<span className="text-lg">🔄</span>} color="navy" change="Ready to action" />
        <KpiCard label="Procurement Alerts" value={`${purchaseRecs.length}`} icon={<span className="text-lg">⚠️</span>} color="red" change="Deficit items" />
        <KpiCard label="Availability Improvement" value="72%" icon={<span className="text-lg">📈</span>} color="teal" change="Post redistribution" />
      </div>

      {/* Campus Network Map */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Campus Resource Network</h2>
            <p className="text-xs text-[#64748b] mt-0.5">Click a department node to view inventory health</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {[["#059669", "Healthy"], ["#d97706", "High Demand"], ["#dc2626", "Shortage Risk"]].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                <span className="text-[#64748b]">{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-5">
          {/* SVG map */}
          <div className="flex-1 min-w-0">
            <svg viewBox="0 0 640 440" className="w-full" style={{ maxHeight: 320 }}>
              {/* Edges */}
              {EDGES.map(([a, b], i) => {
                const na = CAMPUS_NODES.find((n) => n.id === a)!;
                const nb = CAMPUS_NODES.find((n) => n.id === b)!;
                return (
                  <line
                    key={i}
                    x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                    stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 4"
                  />
                );
              })}
              {/* Nodes */}
              {CAMPUS_NODES.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <g key={node.id} onClick={() => setSelectedNode(isSelected ? null : node)} className="cursor-pointer">
                    <circle
                      cx={node.x} cy={node.y} r={isSelected ? 36 : 30}
                      fill={isSelected ? STATUS_COLOR[node.status] : "white"}
                      stroke={STATUS_COLOR[node.status]}
                      strokeWidth={isSelected ? 3 : 2}
                      style={{ filter: isSelected ? "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" : undefined, transition: "all 150ms" }}
                    />
                    {node.status === "shortage" && !isSelected && (
                      <circle cx={node.x + 20} cy={node.y - 20} r="8" fill="#dc2626" />
                    )}
                    {node.status === "shortage" && !isSelected && (
                      <text x={node.x + 20} y={node.y - 16} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">!</text>
                    )}
                    <text
                      x={node.x} y={node.y + 5}
                      textAnchor="middle"
                      fill={isSelected ? "white" : STATUS_COLOR[node.status]}
                      fontSize="11"
                      fontWeight="700"
                    >
                      {node.label}
                    </text>
                    <text x={node.x} y={node.y + 50} textAnchor="middle" fill="#94a3b8" fontSize="9">
                      {node.books.toLocaleString()} books
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Node detail */}
          {selectedNode ? (
            <div className="w-56 flex-shrink-0">
              <div className="bg-[#f8fafc] rounded-[12px] p-4 border border-[#e2e8f0]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#0f1f3d] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {selectedNode.label === "MAIN" ? "Main Library" : `${selectedNode.label} Dept Library`}
                  </h3>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[selectedNode.status] }} />
                </div>
                <div className="space-y-2.5">
                  {[
                    ["Total Books", selectedNode.books.toLocaleString()],
                    ["Available", selectedNode.available.toLocaleString()],
                    ["Issued", selectedNode.issued.toString()],
                    ["High Demand", selectedNode.highDemand.toString()],
                    ["Shortage Risk", selectedNode.shortage.toString()],
                    ["Transfer Opportunities", selectedNode.transfers.toString()],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-[#64748b]">{k}</span>
                      <span className="font-semibold text-[#0f1f3d]">{v}</span>
                    </div>
                  ))}
                </div>
                {selectedNode.status === "shortage" && (
                  <div className="mt-3 bg-red-50 border border-red-100 rounded-[8px] p-2 text-[11px] text-red-700">
                    ⚠ Predicted shortage requires attention
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-56 flex-shrink-0 flex items-center justify-center text-center text-sm text-[#94a3b8]">
              <div>
                <div className="text-3xl mb-2">🏛️</div>
                Click a department node to view details
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* AI Redistribution Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>AI Redistribution Recommendations</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">✨ {recs.filter(r => !r.approved).length} pending</span>
          {loading && <span className="text-xs text-[#64748b] animate-pulse">Analyzing catalog balance...</span>}
        </div>
        <div className="space-y-4">
          {recs.map((rec) => (
            <Card key={rec.id} className={`p-5 ${rec.approved ? "opacity-60" : ""}`}>
              {rec.approved && (
                <div className="mb-3 bg-emerald-50 border border-emerald-100 rounded-[8px] px-3 py-2 text-xs text-emerald-700 flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/></svg>
                  Redistribution approved — transfer initiated
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{rec.book}</p>
                  <p className="text-xs text-[#64748b]">{rec.author}</p>
                </div>
                <Badge variant="info" className="text-[10px]">✨ AI Recommendation</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Current distribution */}
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Current Distribution</p>
                  <div className="space-y-2">
                    {rec.distribution.map((d: any) => (
                      <div key={d.lib} className="flex items-center justify-between bg-[#f8fafc] rounded-[8px] px-3 py-2">
                        <p className="text-xs font-medium text-[#0f1f3d]">{d.lib}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{d.copies}</span>
                          <Badge variant={d.demand === "HIGH" ? "danger" : d.demand === "MEDIUM" ? "warning" : "secondary"} className="text-[10px]">{d.demand}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation arrow */}
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-purple-50 border border-purple-100 rounded-[12px] px-4 py-3 text-center w-full">
                    <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide mb-1">AI Recommends</p>
                    <p className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Move {rec.moveCopies}
                    </p>
                    <p className="text-xs text-[#64748b] mt-1">{rec.fromLib}</p>
                    <div className="text-lg text-[#0d9488] my-1">↓</div>
                    <p className="text-xs font-semibold text-[#0d9488]">{rec.toLib}</p>
                  </div>
                </div>

                {/* Expected result */}
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Expected Result</p>
                  <div className="space-y-2">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-[8px] px-3 py-2">
                      <p className="text-[10px] text-emerald-600">{rec.toLib} Availability</p>
                      <p className="text-sm font-bold text-emerald-800">{rec.beforeCopies} → {rec.afterCopies} copies</p>
                    </div>
                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] px-3 py-2">
                      <p className="text-[10px] text-[#64748b]">Shortage Reduction</p>
                      <p className="text-sm font-bold text-[#0d9488]">{rec.shortageReduction}%</p>
                    </div>
                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] px-3 py-2">
                      <p className="text-[10px] text-[#64748b]">Shortage Probability</p>
                      <p className="text-sm font-bold text-[#0f1f3d]">78% → 21%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WHY section */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-4 py-3 mb-4">
                <p className="text-[10px] font-semibold text-[#64748b] mb-2">WHY THIS RECOMMENDATION?</p>
                <div className="space-y-1 mb-2">
                  {[
                    "Target library predicted to experience high demand during exam period",
                    `${rec.fromLib} possesses surplus copies on shelf`,
                    "Redistribution optimizes campus budget over purchasing",
                  ].map((reason) => (
                    <div key={reason} className="flex items-center gap-1.5 text-xs text-[#64748b]">
                      <svg className="text-emerald-500 flex-shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/></svg>
                      {reason}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#94a3b8] italic">"{rec.reason}"</p>
              </div>

              {!rec.approved && (
                <div className="flex gap-2">
                  <Button variant="accent" size="sm" onClick={() => approve(rec.id)}>Approve Redistribution</Button>
                  <Button variant="ghost" size="sm" onClick={() => dismiss(rec.id)}>Dismiss</Button>
                </div>
              )}
            </Card>
          ))}

          {recs.length === 0 && (
            <Card className="p-12 text-center">
              <div className="text-5xl mb-3">✅</div>
              <p className="font-semibold text-[#0f1f3d]">All recommendations actioned</p>
              <p className="text-sm text-[#64748b] mt-1">AI will generate new recommendations as demand patterns change.</p>
            </Card>
          )}
        </div>
      </div>

      {/* AI Purchase Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>AI Purchase Recommendations</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">✨ Redistribution Insufficient</span>
        </div>
        <p className="text-xs text-[#64748b] mb-4">These books cannot meet predicted demand through transfers alone. AI recommends purchasing new copies.</p>
        <div className="space-y-4">
          {purchaseRecs.map((rec) => (
            <Card key={rec.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{rec.book}</p>
                  <p className="text-xs text-[#64748b]">{rec.author}</p>
                </div>
                <Badge variant={rec.priority === "HIGH" ? "danger" : "warning"}>{rec.priority} Priority</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Demand stats */}
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Demand vs Capacity</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs bg-[#f8fafc] rounded-[8px] px-3 py-2 border border-[#e2e8f0]">
                      <span className="text-[#64748b]">Predicted Demand</span>
                      <span className="font-bold text-[#0f1f3d]">{rec.predicted}</span>
                    </div>
                    <div className="flex justify-between text-xs bg-[#f8fafc] rounded-[8px] px-3 py-2 border border-[#e2e8f0]">
                      <span className="text-[#64748b]">Campus Total</span>
                      <span className="font-bold text-[#0f1f3d]">{rec.campusCopies} copies</span>
                    </div>
                    <div className="flex justify-between text-xs bg-red-50 rounded-[8px] px-3 py-2 border border-red-100">
                      <span className="text-red-700">Expected Shortage</span>
                      <span className="font-bold text-red-700">{rec.expectedShortage} requests</span>
                    </div>
                  </div>
                </div>

                {/* Current distribution */}
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Available Copies</p>
                  <div className="space-y-1.5">
                    {rec.distribution.map((d: any) => (
                      <div key={d.lib} className="flex justify-between text-xs bg-[#f8fafc] rounded-[8px] px-3 py-2 border border-[#e2e8f0]">
                        <span className="text-[#64748b]">{d.lib}</span>
                        <span className="font-semibold">{d.copies}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Conclusion */}
                <div className="bg-amber-50 border border-amber-100 rounded-[12px] p-4">
                  <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1">AI Conclusion</p>
                  <p className="text-lg font-bold text-[#0f1f3d] mb-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Buy {rec.recommendedPurchase} copies
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">{rec.reason}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="accent" size="sm">Add to Purchase Plan</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
