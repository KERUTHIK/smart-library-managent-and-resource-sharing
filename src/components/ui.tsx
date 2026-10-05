import React, { useState } from "react";

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = "success" | "warning" | "danger" | "info" | "secondary" | "primary" | "accent";
export function Badge({ variant = "secondary", children, className = "" }: {
  variant?: BadgeVariant; children: React.ReactNode; className?: string;
}) {
  const styles: Record<BadgeVariant, string> = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    secondary: "bg-slate-100 text-slate-600",
    primary: "bg-[#1e3a5f]/10 text-[#1e3a5f]",
    accent: "bg-teal-100 text-teal-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent" | "outline";
export function Button({ variant = "primary", size = "md", children, className = "", disabled, onClick, type = "button" }: {
  variant?: ButtonVariant; size?: "sm" | "md" | "lg"; children: React.ReactNode;
  className?: string; disabled?: boolean; onClick?: () => void; type?: "button" | "submit";
}) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-[10px] cursor-pointer select-none focus-visible:outline-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#1e3a5f] text-white hover:bg-[#152d4a] shadow-sm",
    secondary: "bg-[#e8eef7] text-[#1e3a5f] hover:bg-[#dce8ff]",
    ghost: "bg-transparent text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f1f3d]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    accent: "bg-[#0d9488] text-white hover:bg-[#0f766e] shadow-sm",
    outline: "border border-[#e2e8f0] bg-white text-[#0f1f3d] hover:bg-[#f8fafc]",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[14px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${onClick ? "cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5" : ""} ${className}`}
      style={{ transition: "box-shadow 150ms, transform 150ms" }}
    >
      {children}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
export function KpiCard({ label, value, change, icon, color = "navy" }: {
  label: string; value: string | number; change?: string; icon: React.ReactNode; color?: string;
}) {
  const colors: Record<string, string> = {
    navy: "bg-[#1e3a5f]/10 text-[#1e3a5f]",
    teal: "bg-teal-100 text-teal-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#64748b] uppercase tracking-wide">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{value}</p>
          {change && <p className="mt-1 text-xs text-[#64748b]">{change}</p>}
        </div>
        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, type = "text", placeholder, value, onChange, icon, suffix, className = "" }: {
  label?: string; type?: string; placeholder?: string; value?: string;
  onChange?: (v: string) => void; icon?: React.ReactNode; suffix?: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-[#0f1f3d] mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full border border-[#e2e8f0] rounded-[10px] bg-white text-[#0f1f3d] placeholder:text-[#94a3b8] text-sm py-2.5 focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 ${icon ? "pl-9" : "pl-3.5"} ${suffix ? "pr-10" : "pr-3.5"}`}
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
export function SearchBar({ placeholder, value, onChange, className = "" }: {
  placeholder?: string; value?: string; onChange?: (v: string) => void; className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-[#0f1f3d] placeholder:text-[#94a3b8] text-sm py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20"
      />
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-[10px] w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-all cursor-pointer ${active === tab.id ? "bg-white text-[#0f1f3d] shadow-sm" : "text-[#64748b] hover:text-[#0f1f3d]"}`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${active === tab.id ? "bg-[#0d9488] text-white" : "bg-[#e2e8f0] text-[#64748b]"}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = "max-w-lg" }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <Card className={`relative z-10 w-full ${width} p-6 shadow-xl`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f1f5f9] text-[#64748b] cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ message, type = "success", onClose }: {
  message: string; type?: "success" | "error" | "info"; onClose: () => void;
}) {
  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-[12px] border shadow-lg max-w-sm ${styles[type]}`}>
      <span className="text-sm font-medium">{icons[type]}</span>
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-auto opacity-60 hover:opacity-100 cursor-pointer">✕</button>
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, options, value, onChange, className = "" }: {
  label?: string; options: { value: string; label: string }[]; value?: string;
  onChange?: (v: string) => void; className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-[#0f1f3d] mb-1.5">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-[#0f1f3d] text-sm py-2.5 px-3.5 focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 cursor-pointer"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: string; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-[#0f1f3d] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>{title}</h3>
      <p className="text-sm text-[#64748b] max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <svg className={`animate-spin text-[#0d9488] ${s[size]}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── AI Badge ─────────────────────────────────────────────────────────────────
export function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
      AI Generated
    </span>
  );
}

// ─── Book Cover ───────────────────────────────────────────────────────────────
export function BookCover({ src, alt, size = "md" }: { src: string; alt: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-10 h-14", md: "w-14 h-20", lg: "w-32 h-44" };
  return (
    <div className={`${sizes[size]} rounded-[6px] overflow-hidden bg-slate-200 flex-shrink-0 shadow-sm`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}

// ─── Rating Stars ─────────────────────────────────────────────────────────────
export function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} className={i <= Math.round(rating) ? "text-amber-400" : "text-slate-200"} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span className="text-xs text-[#64748b] ml-1">{rating}</span>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = "md", color = "navy" }: { initials: string; size?: "sm" | "md" | "lg"; color?: string }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className={`${sizes[size]} rounded-full bg-[#1e3a5f] text-white font-medium flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-lg font-semibold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{title}</h2>
        {subtitle && <p className="text-sm text-[#64748b] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Status Dot ───────────────────────────────────────────────────────────────
export function StatusDot({ status }: { status: "active" | "idle" | "offline" }) {
  const colors = { active: "bg-emerald-500", idle: "bg-amber-400", offline: "bg-slate-300" };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]}`} />;
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = "teal" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const colors: Record<string, string> = {
    teal: "bg-[#0d9488]",
    navy: "bg-[#1e3a5f]",
    amber: "bg-amber-400",
    red: "bg-red-500",
  };
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${colors[color]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, placeholder, value, onChange, rows = 3, className = "" }: {
  label?: string; placeholder?: string; value?: string; onChange?: (v: string) => void; rows?: number; className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-[#0f1f3d] mb-1.5">{label}</label>}
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-[#0f1f3d] placeholder:text-[#94a3b8] text-sm py-2.5 px-3.5 focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 resize-none"
      />
    </div>
  );
}
