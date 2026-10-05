/**
 * LibSync Institutional Data Contracts & Domain Types
 * Runtime records are fetched dynamically from MongoDB through the REST API.
 */

export type UserRole = "admin" | "librarian" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  collegeId: string;
  avatar: string;
  phone?: string;
  year?: string;
  semester?: number;
  status?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  department: string;
  count?: number;
  totalCopies?: number;
  availableCopies?: number;
  available: boolean;
  cover?: string;
  coverImage?: string;
  rating?: number;
  isbn?: string;
  publisher?: string;
  edition?: string;
  year?: number;
  category?: string;
  subject?: string;
  language?: string;
  description?: string;
  ebook?: boolean;
  ebookAvailable?: boolean;
  ebookPdfUrl?: string;
  copies?: {
    cse?: number;
    ece?: number;
    main?: number;
    [key: string]: number | undefined;
  };
}

export interface BorrowRequestItem {
  id: string;
  student: string;
  studentId: string;
  book: string;
  requestDate: string;
  availability: string;
  location: string;
  status: string;
  statusColor?: string;
}

export interface MyBookItem {
  id: string;
  title: string;
  author: string;
  cover: string;
  borrowedDate: string;
  dueDate: string;
  daysRemaining: number;
  status: "borrowed" | "renewed" | "overdue" | "returned";
}

export interface FineItem {
  id: string;
  book: string;
  dueDate: string;
  daysOverdue: number;
  fine: number;
  status: "pending" | "paid" | "waived" | "overdue";
  paidDate?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "warning" | "info" | "success" | "danger";
  link?: string;
}

export interface StudyFolderItem {
  id: string;
  name: string;
  bookCount: number;
  color: string;
  description: string;
  createdAt: string;
  emoji?: string;
  items?: any[];
  notes?: any[];
}

// Runtime records are populated from MongoDB via API clients in src/api/client.ts
export const DEMO_USERS: Record<string, User> = {};
export const CIRCULATION_DATA: any[] = [];
export const DEPT_ACTIVITY: any[] = [];
export const POPULAR_BOOKS: Book[] = [];
export const BORROW_REQUESTS: BorrowRequestItem[] = [];
export const MY_BOOKS: MyBookItem[] = [];
export const FINES: FineItem[] = [];
export const NOTIFICATIONS: NotificationItem[] = [];
export const STUDY_FOLDERS: StudyFolderItem[] = [];
export const ADMIN_RECENT_ACTIVITY: any[] = [];
export const AI_CHAT_MESSAGES: any[] = [];
