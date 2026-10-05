import React, { useState, useEffect } from "react";
import { User } from "./data";
import { authApi, notificationsApi } from "./api/client";
import LoginScreen from "./screens/LoginScreen";
import AdminDashboard from "./screens/AdminDashboard";
import LibrarianDashboard from "./screens/LibrarianDashboard";
import StudentDashboard from "./screens/StudentDashboard";
import ExploreBooks from "./screens/ExploreBooks";
import BookDetails from "./screens/BookDetails";
import BookTransfer from "./screens/BookTransfer";
import AddBook from "./screens/AddBook";
import MyBooks from "./screens/MyBooks";
import FinesScreen from "./screens/FinesScreen";
import AdminFinesScreen from "./screens/AdminFinesScreen";
import LibrarianFinesScreen from "./screens/LibrarianFinesScreen";
import StudyFolders from "./screens/StudyFolders";
import AIAssistant from "./screens/AIAssistant";
import Notifications from "./screens/Notifications";
import Settings from "./screens/Settings";
import Analytics from "./screens/Analytics";
import ExamPrep from "./screens/ExamPrep";
import BooksPage from "./screens/BooksPage";
import EBooksPage from "./screens/EBooksPage";
import DepartmentsPage from "./screens/DepartmentsPage";
import LibrariansPage from "./screens/LibrariansPage";
import StudentsPage from "./screens/StudentsPage";
import BookReturnsPage from "./screens/BookReturnsPage";
import AppShell from "./components/AppShell";

type Screen =
  | "dashboard" | "analytics" | "books" | "ebooks" | "departments"
  | "librarians" | "students" | "requests" | "transfers" | "fines"
  | "reports" | "settings" | "explore" | "book-details" | "my-books"
  | "study-folders" | "ai-assistant" | "notifications" | "add-book" | "profile"
  | "exam-prep" | "book-returns";

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("libsync_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("libsync_token")) {
      authApi.getMe()
        .then((res) => {
          if (res.user) setUser(res.user);
        })
        .catch(() => {
          authApi.logout();
          setUser(null);
        });

      notificationsApi.getNotifications()
        .then((res) => {
          setNotifCount(res.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, []);

  function handleLogin(u: User) {
    setUser(u);
    setScreen("dashboard");
    notificationsApi.getNotifications()
      .then((res) => setNotifCount(res.unreadCount || 0))
      .catch(() => {});
  }

  function handleLogout() {
    authApi.logout();
    setUser(null);
    setScreen("dashboard");
  }

  function navigate(s: string) {
    setScreen(s as Screen);
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  function renderScreen() {
    switch (screen) {
      case "dashboard":
        if (user!.role === "admin") return <AdminDashboard onNavigate={navigate} />;
        if (user!.role === "librarian") return <LibrarianDashboard onNavigate={navigate} />;
        return <StudentDashboard onNavigate={navigate} />;

      case "explore":
        return <ExploreBooks onNavigate={navigate} />;

      case "book-details":
        return <BookDetails onNavigate={navigate} />;

      case "transfers":
        return <BookTransfer role={user!.role} />;

      case "add-book":
        return <AddBook />;

      case "my-books":
        return <MyBooks onNavigate={navigate} />;

      case "fines":
        if (user!.role === "admin") return <AdminFinesScreen />;
        if (user!.role === "librarian") return <LibrarianFinesScreen />;
        return <FinesScreen />;

      case "study-folders":
        return <StudyFolders />;

      case "ai-assistant":
        return <AIAssistant />;

      case "notifications":
        return <Notifications />;

      case "settings":
        return <Settings user={user!} />;

      // Shared placeholder screens for admin navigation items
      case "analytics":
        return <Analytics onNavigate={navigate} />;
      case "books":
        return <BooksPage role={user!.role} onNavigate={navigate} />;
      case "ebooks":
        return <EBooksPage role={user!.role} onNavigate={navigate} />;
      case "departments":
        return <DepartmentsPage role={user!.role} onNavigate={navigate} />;
      case "librarians":
        return <LibrariansPage onNavigate={navigate} />;
      case "students":
        return <StudentsPage onNavigate={navigate} />;
      case "requests":
        return user!.role === "librarian" ? <LibrarianDashboard onNavigate={navigate} /> : <AdminPlaceholder title="Requests" icon="📋" description="View all borrow and transfer requests." />;
      case "exam-prep":
        return <ExamPrep onNavigate={navigate} />;

      case "book-returns":
        return <BookReturnsPage />;

      case "reports":
        return <AdminPlaceholder title="Reports" icon="📈" description="Generate and export library reports." />;

      default:
        return <StudentDashboard onNavigate={navigate} />;
    }
  }

  return (
    <AppShell
      user={user}
      activeScreen={screen}
      onNavigate={navigate}
      onLogout={handleLogout}
      notifCount={notifCount}
    >
      {renderScreen()}
    </AppShell>
  );
}

function AdminPlaceholder({ title, icon, description }: { title: string; icon: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-xl font-bold text-[#0f1f3d] mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{title}</h2>
      <p className="text-[#64748b] max-w-xs">{description}</p>
      <div className="mt-4 px-4 py-2 bg-[#f1f5f9] rounded-full text-xs text-[#94a3b8]">Full implementation in production build</div>
    </div>
  );
}
