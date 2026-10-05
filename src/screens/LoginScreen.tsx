import React, { useState } from "react";
import { User } from "../data";
import { authApi } from "../api/client";
import { Button, Input, Toast } from "../components/ui";

interface Props {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.user) {
        onLogin(res.user);
      } else {
        setError("Invalid credentials. Try admin@libsync.edu, librarian@libsync.edu or student@libsync.edu");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  }

  const demos = [
    { label: "Admin", email: "admin@libsync.edu", color: "navy" },
    { label: "Librarian", email: "librarian@libsync.edu", color: "teal" },
    { label: "Student", email: "student@libsync.edu", color: "blue" },
  ];

  return (
    <div className="min-h-full flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-[#0f1f3d] p-12 relative overflow-hidden">
        {/* Network illustration */}
        <div className="absolute inset-0 overflow-hidden">
          <NetworkIllustration />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-[10px] bg-[#0d9488] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="5" height="16" rx="1" fill="white" opacity="0.9"/>
                <rect x="10" y="4" width="5" height="16" rx="1" fill="white" opacity="0.7"/>
                <circle cx="19" cy="8" r="2.5" stroke="white" strokeWidth="1.5"/>
                <circle cx="19" cy="16" r="2.5" stroke="white" strokeWidth="1.5"/>
                <path d="M17 8.5l-2 3.5 2 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>LibSync</span>
          </div>

          <div className="mt-auto pt-32">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Your Campus.<br />Your Library.<br />
              <span className="text-[#0d9488]">One Place.</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              A smart centralized platform connecting all department libraries into one unified system — powered by AI.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { value: "24,582", label: "Total Books" },
                { value: "12", label: "Departments" },
                { value: "6,284", label: "Active Users" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-[12px] px-4 py-3 border border-white/10">
                  <div className="text-xl font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {["Computer Science", "Electronics", "Mechanical", "Civil", "Mathematics", "Physics"].map((d) => (
                <span key={d} className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-xs border border-white/10">{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-8 bg-[#f1f5f9]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-[8px] bg-[#0d9488] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="5" height="16" rx="1" fill="white"/>
                <rect x="10" y="4" width="5" height="16" rx="1" fill="white" opacity="0.7"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-[#0f1f3d]">LibSync</span>
          </div>

          <div className="bg-white rounded-[16px] border border-[#e2e8f0] shadow-sm p-8">
            <h2 className="text-2xl font-bold text-[#0f1f3d] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Welcome back</h2>
            <p className="text-[#64748b] text-sm mb-6">Sign in to your LibSync account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="College ID / Email"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={setEmail}
                icon={<MailIcon />}
              />
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                icon={<LockIcon />}
                suffix={
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-[#64748b] hover:text-[#0f1f3d] cursor-pointer">
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-[#e2e8f0] accent-[#0d9488]"
                  />
                  <span className="text-sm text-[#64748b]">Remember me</span>
                </label>
                <button type="button" className="text-sm text-[#0d9488] hover:text-[#0f766e] font-medium cursor-pointer">
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-[10px] p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-xs text-[#94a3b8] mt-6">
              Secure access for students, staff and library administrators.
            </p>
          </div>

          {/* Quick demo access */}
          <div className="mt-6">
            <p className="text-xs text-center text-[#94a3b8] mb-3">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {demos.map((d) => (
                <button
                  key={d.label}
                  onClick={() => { setEmail(d.email); setPassword("demo123"); }}
                  className="py-2 px-3 rounded-[10px] border border-[#e2e8f0] bg-white text-xs font-medium text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488] cursor-pointer transition-all"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NetworkIllustration() {
  const nodes = [
    { x: 180, y: 200, label: "CSE", r: 36 },
    { x: 380, y: 120, label: "ECE", r: 28 },
    { x: 480, y: 280, label: "MECH", r: 28 },
    { x: 280, y: 360, label: "CIVIL", r: 24 },
    { x: 100, y: 340, label: "MATH", r: 22 },
    { x: 420, y: 420, label: "PHY", r: 22 },
    { x: 320, y: 220, label: "CORE", r: 14 },
  ];
  const edges = [[0,1],[0,2],[0,3],[0,4],[1,2],[2,5],[3,5],[6,0],[6,1],[6,2]];

  return (
    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke="#0d9488" strokeWidth="1" strokeDasharray="4 4"
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke="#0d9488" strokeWidth="1.5" />
          <circle cx={n.x} cy={n.y} r={n.r * 0.5} fill="#0d9488" opacity="0.4" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill="white" fontSize="8" opacity="0.7">{n.label}</text>
        </g>
      ))}
    </svg>
  );
}

const MailIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>;
const LockIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const EyeIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>;
