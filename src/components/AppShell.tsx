import React, { useState } from "react";
import { User } from "../data";
import { Avatar, Badge, SearchBar } from "./ui";

type Screen =
  | "dashboard" | "analytics" | "books" | "ebooks" | "departments"
  | "librarians" | "students" | "requests" | "transfers" | "fines"
  | "reports" | "settings" | "explore" | "book-details" | "my-books"
  | "study-folders" | "ai-assistant" | "notifications" | "add-book" | "profile"
  | "exam-prep" | "book-returns";

const ADMIN_NAV = [
  { id: "dashboard", label: "Dashboard", icon: GridIcon },
  { id: "analytics", label: "Analytics", icon: ChartIcon },
  { id: "books", label: "Books", icon: BookIcon },
  { id: "ebooks", label: "E-Books", icon: TabletIcon },
  { id: "departments", label: "Departments", icon: BuildingIcon },
  { id: "librarians", label: "Librarians", icon: UserIcon },
  { id: "students", label: "Students & Staff", icon: UsersIcon },
  { id: "requests", label: "Requests", icon: InboxIcon },
  { id: "transfers", label: "Book Transfers", icon: ArrowsIcon },
  { id: "fines", label: "Fines & Payments", icon: CreditIcon },
  { id: "reports", label: "Reports", icon: FileIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const LIBRARIAN_NAV = [
  { id: "dashboard", label: "Dashboard", icon: GridIcon },
  { id: "books", label: "My Library Books", icon: BookIcon },
  { id: "ebooks", label: "E-Books", icon: TabletIcon },
  { id: "transfers", label: "Book Transfers", icon: ArrowsIcon },
  { id: "book-returns", label: "Book Returns", icon: ReturnIcon },
  { id: "add-book", label: "Add New Book", icon: PlusIcon },
  { id: "fines", label: "Fines & Payments", icon: CreditIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const STUDENT_NAV = [
  { id: "dashboard", label: "Dashboard", icon: GridIcon },
  { id: "explore", label: "Explore Books", icon: SearchIcon },
  { id: "my-books", label: "My Books", icon: BookIcon },
  { id: "study-folders", label: "Study Folders", icon: FolderIcon },
  { id: "requests", label: "My Requests", icon: InboxIcon },
  { id: "ai-assistant", label: "AI Assistant", icon: SparkleIcon },
  { id: "fines", label: "Fines & Payments", icon: CreditIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

interface AppShellProps {
  user: User;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  notifCount: number;
  children: React.ReactNode;
}

export default function AppShell({ user, activeScreen, onNavigate, onLogout, notifCount, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = user.role === "admin" ? ADMIN_NAV : user.role === "librarian" ? LIBRARIAN_NAV : STUDENT_NAV;

  return (
    <div className="flex h-full bg-[#f1f5f9]">
      {/* Sidebar */}
      <aside className={`flex-shrink-0 flex flex-col bg-[#0f1f3d] transition-all duration-200 ${sidebarOpen ? "w-56" : "w-16"} overflow-hidden`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <LibSyncLogo />
          {sidebarOpen && (
            <div>
              <span className="text-white font-bold text-base" style={{ fontFamily: "'DM Sans', sans-serif" }}>LibSync</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                <span className="text-[10px] text-[#0d9488] font-medium">Connected</span>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Screen)}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium cursor-pointer transition-all ${active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"} ${!sidebarOpen ? "justify-center" : ""}`}
              >
                <Icon className={`flex-shrink-0 ${active ? "text-[#0d9488]" : ""}`} />
                {sidebarOpen && <span>{item.label}</span>}
                {active && sidebarOpen && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0d9488]" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-white cursor-pointer rounded-[8px] hover:bg-white/5 text-xs"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeftIcon /> <span>Collapse</span>
              </>
            ) : <ChevronRightIcon />}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top nav */}
        <header className="flex items-center gap-4 px-6 py-3 bg-white border-b border-[#e2e8f0] z-10">
          <SearchBar placeholder="Search books, authors, topics…" className="flex-1 max-w-sm" />

          <div className="flex items-center gap-2 ml-auto">
            {/* Help */}
            <button className="w-9 h-9 flex items-center justify-center rounded-[8px] text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer">
              <QuestionIcon />
            </button>

            {/* Notifications */}
            <button
              onClick={() => onNavigate("notifications")}
              className="w-9 h-9 flex items-center justify-center rounded-[8px] text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer relative"
            >
              <BellIcon />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-[10px] hover:bg-[#f1f5f9] cursor-pointer"
              >
                <Avatar initials={user.avatar} size="sm" />
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-[#0f1f3d] leading-tight">{user.name.split(" ")[0]}</p>
                  <p className="text-[10px] text-[#64748b] capitalize">{user.role}</p>
                </div>
                <ChevronDownIcon className="text-[#64748b]" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#e2e8f0] rounded-[12px] shadow-lg z-50 py-1.5 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#e2e8f0]">
                      <p className="text-sm font-semibold text-[#0f1f3d]">{user.name}</p>
                      <p className="text-xs text-[#64748b]">{user.email}</p>
                      <Badge variant="primary" className="mt-1 capitalize">{user.role}</Badge>
                    </div>
                    <button onClick={() => { onNavigate("settings"); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-[#0f1f3d] hover:bg-[#f1f5f9] flex items-center gap-2 cursor-pointer">
                      <SettingsIcon /> Profile & Settings
                    </button>
                    <button onClick={onLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer">
                      <LogoutIcon /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Icon components ──────────────────────────────────────────────────────────
function LibSyncLogo() {
  return (
    <div className="w-8 h-8 flex-shrink-0 rounded-[8px] bg-[#0d9488] flex items-center justify-center">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="5" height="16" rx="1" fill="white" opacity="0.9"/>
        <rect x="10" y="4" width="5" height="16" rx="1" fill="white" opacity="0.7"/>
        <circle cx="19" cy="8" r="2.5" stroke="white" strokeWidth="1.5"/>
        <circle cx="19" cy="16" r="2.5" stroke="white" strokeWidth="1.5"/>
        <path d="M17 8.5l-2 3.5 2 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function SvgIcon({ d, className = "" }: { d: string; className?: string }) {
  return <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
}

function GridIcon({ className = "" }) { return <SvgIcon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" className={className} />; }
function ChartIcon({ className = "" }) { return <SvgIcon d="M3 3v18h18M7 16l4-4 4 4 4-8" className={className} />; }
function BookIcon({ className = "" }) { return <SvgIcon d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" className={className} />; }
function TabletIcon({ className = "" }) { return <SvgIcon d="M12 17v.01M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" className={className} />; }
function BuildingIcon({ className = "" }) { return <SvgIcon d="M3 21h18M5 21V7l7-4 7 4v14M9 21V11h6v10" className={className} />; }
function UserIcon({ className = "" }) { return <SvgIcon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" className={className} />; }
function UsersIcon({ className = "" }) { return <SvgIcon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" className={className} />; }
function InboxIcon({ className = "" }) { return <SvgIcon d="M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" className={className} />; }
function ArrowsIcon({ className = "" }) { return <SvgIcon d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" className={className} />; }
function CreditIcon({ className = "" }) { return <SvgIcon d="M20 7H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM1 11h22" className={className} />; }
function FileIcon({ className = "" }) { return <SvgIcon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" className={className} />; }
function SettingsIcon({ className = "" }) { return <SvgIcon d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" className={className} />; }
function SearchIcon({ className = "" }) { return <SvgIcon d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" className={className} />; }
function FolderIcon({ className = "" }) { return <SvgIcon d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" className={className} />; }
function SparkleIcon({ className = "" }) { return <SvgIcon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" className={className} />; }
function BellIcon({ className = "" }) { return <SvgIcon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" className={className} />; }
function QuestionIcon({ className = "" }) { return <SvgIcon d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" className={className} />; }
function ChevronDownIcon({ className = "" }) { return <SvgIcon d="M6 9l6 6 6-6" className={className} />; }
function ChevronLeftIcon({ className = "" }) { return <SvgIcon d="M15 18l-6-6 6-6" className={className} />; }
function ChevronRightIcon({ className = "" }) { return <SvgIcon d="M9 18l6-6-6-6" className={className} />; }
function PlusIcon({ className = "" }) { return <SvgIcon d="M12 5v14M5 12h14" className={className} />; }
function ReturnIcon({ className = "" }) { return <SvgIcon d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" className={className} />; }
function LogoutIcon({ className = "" }) { return <SvgIcon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" className={className} />; }
function TrendIcon({ className = "" }) { return <SvgIcon d="M3 17l4-8 4 5 3-3 4 6M23 6l-4.35 4.35M23 6h-5M23 6v5" className={className} />; }
function NetworkIcon({ className = "" }) { return <SvgIcon d="M12 2a2 2 0 100 4 2 2 0 000-4zM4 18a2 2 0 100 4 2 2 0 000-4zM20 18a2 2 0 100 4 2 2 0 000-4zM12 4v6M4 18l8-8M20 18l-8-8" className={className} />; }
