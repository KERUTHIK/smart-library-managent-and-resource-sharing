import { z } from "zod";
import { UserRole, BookCondition } from "../constants/index.js";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  collegeId: z.string().min(2, "College ID is required"),
  departmentName: z.string().optional(),
  role: z.nativeEnum(UserRole).optional().default(UserRole.STUDENT),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  yearOfStudy: z.string().optional(),
  bio: z.string().optional(),
  notificationPreferences: z
    .object({
      dueReminders: z.boolean().optional(),
      requestUpdates: z.boolean().optional(),
      transferAlerts: z.boolean().optional(),
      fineAlerts: z.boolean().optional(),
      newArrivals: z.boolean().optional(),
      weeklyDigest: z.boolean().optional(),
    })
    .optional(),
});

export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().min(1, "ISBN is required"),
  edition: z.string().optional(),
  publisher: z.string().optional(),
  publicationYear: z.coerce.number().optional(),
  category: z.string().min(1, "Category is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional().default(""),
  keywords: z.union([z.string(), z.array(z.string())]).optional(),
  departmentName: z.string().min(1, "Department is required"),
  copiesCount: z.coerce.number().min(1, "At least 1 copy is required").default(1),
  shelfLocation: z.string().optional().default("A-01"),
  accessionNumber: z.string().optional(),
  coverImage: z.string().optional(),
});

export const updateBookSchema = createBookSchema.partial();

export const createEbookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  publicationYear: z.coerce.number().optional(),
  category: z.string().min(1, "Category is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional().default(""),
  language: z.string().default("English"),
  keywords: z.union([z.string(), z.array(z.string())]).optional(),
  departmentName: z.string().min(1, "Department is required"),
  coverImage: z.string().optional(),
  pdfPath: z.string().optional(),
  pageCount: z.coerce.number().optional(),
  fileSize: z.string().optional(),
});

export const borrowRequestSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
  pickupLibraryName: z.string().optional(),
});

export const transferActionSchema = z.object({
  action: z.enum(["notify_librarian", "mark_received", "notify_student", "issue_to_student", "reject"]),
  notes: z.string().optional(),
});

export const returnBookSchema = z.object({
  borrowTransactionId: z.string().min(1, "Borrow transaction ID is required"),
  condition: z.enum(["Good", "Damaged", "Lost"]).default("Good"),
  notes: z.string().optional(),
});

export const renewalRequestSchema = z.object({
  borrowTransactionId: z.string().min(1, "Borrow transaction ID is required"),
});

export const processRenewalSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

export const fineActionSchema = z.object({
  action: z.enum(["paid", "waive", "cancel"]),
  reason: z.string().optional(),
});

export const payFineSchema = z.object({
  fineId: z.string().min(1, "Fine ID is required"),
  method: z.enum(["UPI", "Card", "Net Banking"]).default("UPI"),
});

export const payAllFinesSchema = z.object({
  method: z.enum(["UPI", "Card", "Net Banking"]).default("UPI"),
});

export const createStudyFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  description: z.string().optional().default(""),
  emoji: z.string().optional().default("📁"),
  color: z.string().optional().default("teal"),
});

export const addStudyItemSchema = z.object({
  itemType: z.enum(["book", "ebook"]),
  bookId: z.string().optional(),
  ebookId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  coverImage: z.string().optional(),
  notes: z.string().optional(),
});

export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export const createBookmarkSchema = z.object({
  ebookId: z.string().min(1, "EBook ID is required"),
  title: z.string().min(1, "Title is required"),
  pageNumber: z.coerce.number().min(1, "Page number must be at least 1"),
  note: z.string().optional(),
});

export const chatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  conversationId: z.string().optional(),
  bookContextId: z.string().optional(),
});

export const askBookSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
  question: z.string().min(1, "Question cannot be empty"),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required"),
  head: z.string().min(2, "Department head is required"),
  libraryName: z.string().min(2, "Library name is required"),
  icon: z.string().optional().default("🏛️"),
  description: z.string().optional(),
});

export const createLibrarianSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  empId: z.string().min(2, "Employee ID required"),
  phone: z.string().optional(),
  departmentName: z.string().min(1, "Department is required"),
  experience: z.string().optional().default("3 yrs"),
});

export const createMemberSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  collegeId: z.string().min(2, "College/User ID required"),
  type: z.enum(["Student", "Faculty", "Staff"]).default("Student"),
  departmentName: z.string().min(1, "Department is required"),
});
