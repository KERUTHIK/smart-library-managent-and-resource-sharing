/**
 * LibSync Production API Client
 * Connects React frontend directly to the Express + MongoDB backend.
 */

const API_BASE = "/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("libsync_token");

  const headers = new Headers(options.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // If body is not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg) as any;
    err.status = res.status;
    err.code = data.code;
    err.errors = data.errors;
    throw err;
  }

  return data as T;
}

// ==================== AUTH API ====================
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiFetch<{ success: boolean; token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (res.token) {
      localStorage.setItem("libsync_token", res.token);
      localStorage.setItem("libsync_user", JSON.stringify(res.user));
    }
    return res;
  },

  getMe: async () => {
    return apiFetch<{ success: boolean; user: any }>("/auth/me");
  },

  logout: () => {
    localStorage.removeItem("libsync_token");
    localStorage.removeItem("libsync_user");
  },
};

// ==================== BOOKS API ====================
export const booksApi = {
  getBooks: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "All") {
        query.set(key, String(val));
      }
    });
    return apiFetch<{ success: boolean; items: any[]; total: number; page: number; totalPages: number }>(
      `/books?${query.toString()}`
    );
  },

  getBookById: async (id: string) => {
    return apiFetch<{ success: boolean; book: any }>(`/books/${id}`);
  },

  checkDuplicate: async (payload: {
    isbn?: string;
    title: string;
    author: string;
    edition?: string;
    publisher?: string;
    excludeBookId?: string;
  }) => {
    return apiFetch<{
      success: boolean;
      isDuplicate: boolean;
      matchReason?: string;
      existingBook?: any;
    }>("/books/check-duplicate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createBook: async (data: any) => {
    return apiFetch<{ success: boolean; book: any }>("/books", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateBook: async (id: string, data: any) => {
    return apiFetch<{ success: boolean; book: any }>(`/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteBook: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/books/${id}`, {
      method: "DELETE",
    });
  },

  addCopy: async (bookId: string, data: { departmentName: string; count: number; shelfLocation?: string }) => {
    return apiFetch<{ success: boolean; copies: any[] }>(`/books/${bookId}/copies`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ==================== EBOOKS API ====================
export const ebooksApi = {
  getEBooks: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "All") {
        query.set(key, String(val));
      }
    });
    return apiFetch<{ success: boolean; ebooks: any[]; total: number }>(`/ebooks?${query.toString()}`);
  },

  getEBookById: async (id: string) => {
    return apiFetch<{ success: boolean; ebook: any }>(`/ebooks/${id}`);
  },

  uploadEBook: async (formData: FormData) => {
    return apiFetch<{ success: boolean; ebook: any }>("/ebooks/upload", {
      method: "POST",
      body: formData,
    });
  },
};

// ==================== REQUESTS API ====================
export const requestsApi = {
  getRequests: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "All") {
        query.set(key, String(val));
      }
    });
    return apiFetch<{ success: boolean; requests: any[] }>(`/requests?${query.toString()}`);
  },

  createRequest: async (data: { bookId: string; notes?: string }) => {
    return apiFetch<{ success: boolean; status: string; message: string; request: any }>("/requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  approveRequest: async (id: string) => {
    return apiFetch<{ success: boolean; request: any }>(`/requests/${id}/approve`, {
      method: "POST",
    });
  },

  rejectRequest: async (id: string, rejectionReason: string) => {
    return apiFetch<{ success: boolean; request: any }>(`/requests/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejectionReason }),
    });
  },

  cancelRequest: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/requests/${id}/cancel`, {
      method: "POST",
    });
  },
};

// ==================== TRANSFERS API ====================
export const transfersApi = {
  getTransfers: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "All") {
        query.set(key, String(val));
      }
    });
    return apiFetch<{ success: boolean; transfers: any[] }>(`/transfers?${query.toString()}`);
  },

  dispatchTransfer: async (id: string, notes?: string) => {
    return apiFetch<{ success: boolean; transfer: any }>(`/transfers/${id}/dispatch`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
  },

  receiveTransfer: async (id: string, notes?: string) => {
    return apiFetch<{ success: boolean; transfer: any }>(`/transfers/${id}/receive`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
  },

  getStats: async () => {
    return apiFetch<{ success: boolean; stats: any }>("/transfers/stats");
  },
};

// ==================== RETURNS & LOANS API ====================
export const returnsApi = {
  getActiveLoans: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "All") {
        query.set(key, String(val));
      }
    });
    return apiFetch<{ success: boolean; loans: any[] }>(`/returns/active-loans?${query.toString()}`);
  },

  processReturn: async (data: {
    borrowId: string;
    condition: "Good" | "Minor Damage" | "Damaged" | "Lost";
    conditionNotes?: string;
  }) => {
    return apiFetch<{
      success: boolean;
      borrowRecord: any;
      fineAmount: number;
      conditionFineAmount: number;
      overdueFineAmount: number;
      message: string;
    }>("/returns", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ==================== RENEWALS API ====================
export const renewalsApi = {
  requestRenewal: async (borrowId: string, reason?: string) => {
    return apiFetch<{ success: boolean; newDueDate: string; renewalCount: number; message: string }>("/renewals", {
      method: "POST",
      body: JSON.stringify({ borrowId, reason }),
    });
  },

  getRenewalHistory: async (borrowId: string) => {
    return apiFetch<{ success: boolean; history: any[] }>(`/renewals/${borrowId}`);
  },
};

// ==================== FINES API ====================
export const finesApi = {
  getFines: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "All") {
        query.set(key, String(val));
      }
    });
    return apiFetch<{ success: boolean; fines: any[]; totalAmount: number; unpaidAmount: number }>(
      `/fines?${query.toString()}`
    );
  },

  payFine: async (data: { fineId: string; paymentMethod: string; transactionReference?: string }) => {
    return apiFetch<{ success: boolean; payment: any; message: string }>("/fines/pay", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  waiveFine: async (id: string, reason: string) => {
    return apiFetch<{ success: boolean; fine: any; message: string }>(`/fines/${id}/waive`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  cancelFine: async (id: string, reason: string) => {
    return apiFetch<{ success: boolean; fine: any; message: string }>(`/fines/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};

// ==================== STUDY FOLDERS API ====================
export const studyFoldersApi = {
  getFolders: async () => {
    return apiFetch<{ success: boolean; folders: any[] }>("/study-folders");
  },

  getFolderById: async (id: string) => {
    return apiFetch<{ success: boolean; folder: any; items: any[]; notes: any[] }>(`/study-folders/${id}`);
  },

  createFolder: async (data: { name: string; emoji?: string; color?: string; description?: string }) => {
    return apiFetch<{ success: boolean; folder: any }>("/study-folders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteFolder: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/study-folders/${id}`, {
      method: "DELETE",
    });
  },

  addItem: async (folderId: string, data: { itemType: string; itemId: string; title: string; subtitle?: string; metadata?: any }) => {
    return apiFetch<{ success: boolean; item: any }>(`/study-folders/${folderId}/items`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  removeItem: async (folderId: string, itemId: string) => {
    return apiFetch<{ success: boolean }>(`/study-folders/${folderId}/items/${itemId}`, {
      method: "DELETE",
    });
  },

  addNote: async (folderId: string, data: { title: string; content: string }) => {
    return apiFetch<{ success: boolean; note: any }>(`/study-folders/${folderId}/notes`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteNote: async (folderId: string, noteId: string) => {
    return apiFetch<{ success: boolean }>(`/study-folders/${folderId}/notes/${noteId}`, {
      method: "DELETE",
    });
  },
};

// ==================== AI ASSISTANT API ====================
export const aiApi = {
  chat: async (data: {
    message: string;
    conversationId?: string;
    studyFolderId?: string;
    bookId?: string;
  }) => {
    return apiFetch<{
      success: boolean;
      conversationId: string;
      answer: string;
      sources: Array<{ title: string; chapter?: string; page?: number; relevanceScore?: number; previewSnippet?: string }>;
    }>("/ai/chat", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getConversations: async () => {
    return apiFetch<{ success: boolean; conversations: any[] }>("/ai/conversations");
  },

  getMessages: async (conversationId: string) => {
    return apiFetch<{ success: boolean; messages: any[] }>(`/ai/conversations/${conversationId}/messages`);
  },
};

// ==================== NOTIFICATIONS API ====================
export const notificationsApi = {
  getNotifications: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.set(key, String(val));
      }
    });
    return apiFetch<{ success: boolean; notifications: any[]; unreadCount: number }>(
      `/notifications?${query.toString()}`
    );
  },

  markAsRead: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/notifications/${id}/read`, {
      method: "POST",
    });
  },

  markAllAsRead: async () => {
    return apiFetch<{ success: boolean }>(`/notifications/read-all`, {
      method: "POST",
    });
  },
};

// ==================== ANALYTICS API ====================
export const analyticsApi = {
  getAdminStats: async (timeFilter: string = "week") => {
    return apiFetch<{ success: boolean; kpis: any; circulationData: any[]; deptActivity: any[]; recentActivity: any[] }>(
      `/analytics/admin?timeFilter=${timeFilter}`
    );
  },

  getLibrarianStats: async () => {
    return apiFetch<{
      success: boolean;
      kpis: any;
      pendingRequests: any[];
      recentTransfers: any[];
      inventoryHealth: any[];
    }>("/analytics/librarian");
  },

  getStudentStats: async () => {
    return apiFetch<{
      success: boolean;
      activeLoans: any[];
      loanHistory: any[];
      unpaidFines: any[];
      totalFines: number;
      pendingRequests: any[];
      studyFolders: any[];
      popularBooks: any[];
    }>("/analytics/student");
  },

  getDemandForecast: async () => {
    return apiFetch<{
      success: boolean;
      kpis: any;
      historicalAndForecast: any[];
      subjectDemand: any[];
      highDemandAlerts: any[];
    }>("/analytics/demand-forecast");
  },

  getResourceOptimization: async () => {
    return apiFetch<{
      success: boolean;
      kpis: any;
      imbalanceAlerts: any[];
      underutilizedBooks: any[];
      reallocationRecommendations: any[];
    }>("/analytics/resource-optimization");
  },
};

// ==================== DEPARTMENTS API ====================
export const departmentsApi = {
  getDepartments: async () => {
    return apiFetch<{ success: boolean; departments: any[] }>("/departments");
  },

  getDepartmentById: async (id: string) => {
    return apiFetch<{ success: boolean; department: any }>(`/departments/${id}`);
  },
};

// ==================== LIBRARIANS API ====================
export const librariansApi = {
  getLibrarians: async () => {
    return apiFetch<{ success: boolean; librarians: any[] }>("/librarians");
  },

  createLibrarian: async (data: any) => {
    return apiFetch<{ success: boolean; librarian: any }>("/librarians", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ==================== USERS / STUDENTS API ====================
export const usersApi = {
  getStudents: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "All") {
        query.set(key, String(val));
      }
    });
    return apiFetch<{ success: boolean; students: any[]; total: number }>(`/users/students?${query.toString()}`);
  },

  updateStatus: async (id: string, status: string) => {
    return apiFetch<{ success: boolean; user: any }>(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
