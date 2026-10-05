import { Types } from "mongoose";
import { Book, IBook } from "../models/Book.js";
import { BookCopy, IBookCopy } from "../models/BookCopy.js";
import { Department } from "../models/Department.js";
import { Library } from "../models/Library.js";
import { AppError } from "../middleware/errorHandler.js";
import { BookCopyStatus, BookCondition, AuditAction } from "../constants/index.js";
import { duplicateService } from "./duplicate.service.js";
import { AuditLog } from "../models/AuditLog.js";

export interface CreateBookDTO {
  title: string;
  author: string;
  isbn: string;
  edition?: string;
  publisher?: string;
  publicationYear?: number;
  category: string;
  subject: string;
  description?: string;
  keywords?: string | string[];
  departmentName: string;
  copiesCount: number;
  shelfLocation?: string;
  accessionNumber?: string;
  coverImage?: string;
  bypassDuplicateCheck?: boolean;
}

export class BookService {
  async getBooks(query: {
    search?: string;
    department?: string;
    availability?: string;
    subject?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.search) {
      const q = query.search.trim();
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
        { isbn: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
      ];
    }

    if (query.department && query.department !== "All Departments" && query.department !== "All") {
      filter.departmentName = { $regex: new RegExp(query.department, "i") };
    }

    if (query.subject && query.subject !== "All Subjects" && query.subject !== "All") {
      filter.subject = { $regex: new RegExp(query.subject, "i") };
    }

    if (query.availability) {
      if (query.availability === "available") {
        filter.availableCopies = { $gt: 0 };
      } else if (query.availability === "unavailable") {
        filter.availableCopies = 0;
      }
    }

    const [items, total] = await Promise.all([
      Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Book.countDocuments(filter),
    ]);

    // Format for frontend
    const formatted = items.map((b) => ({
      id: b._id.toString(),
      title: b.title,
      author: b.author,
      dept: b.departmentName,
      subject: b.subject,
      category: b.category,
      isbn: b.isbn,
      edition: b.edition || "1st",
      publisher: b.publisher || "Academic Press",
      year: b.publicationYear || 2020,
      rating: b.rating,
      available: b.availableCopies,
      total: b.totalCopies,
      location: `${b.departmentName} Library`,
      shelf: b.shelfLocation,
      description: b.description,
      cover: b.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
      ebook: b.hasEbook,
    }));

    return {
      items: formatted,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBookById(id: string) {
    const book = await Book.findById(id).lean();
    if (!book) throw new AppError("Book not found", 404, "BOOK_NOT_FOUND");

    // Fetch individual copies across all libraries
    const copies = await BookCopy.find({ bookId: book._id }).lean();
    const copiesByLibrary: Record<string, number> = {};

    copies.forEach((c) => {
      if (c.status === BookCopyStatus.AVAILABLE) {
        copiesByLibrary[c.libraryName] = (copiesByLibrary[c.libraryName] || 0) + 1;
      } else if (!copiesByLibrary[c.libraryName]) {
        copiesByLibrary[c.libraryName] = 0;
      }
    });

    return {
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      dept: book.departmentName,
      subject: book.subject,
      category: book.category,
      isbn: book.isbn,
      edition: book.edition || "1st",
      publisher: book.publisher || "Academic Press",
      year: book.publicationYear || 2020,
      rating: book.rating,
      available: book.availableCopies,
      total: book.totalCopies,
      location: `${book.departmentName} Library`,
      shelf: book.shelfLocation,
      description: book.description,
      cover: book.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
      ebook: book.hasEbook,
      keywords: book.keywords,
      copiesByLibrary,
    };
  }

  async createBook(data: CreateBookDTO, actorId?: string, actorName: string = "System") {
    // 1. Check duplicate
    if (!data.bypassDuplicateCheck) {
      const duplicateResult = await duplicateService.checkBookDuplicate({
        isbn: data.isbn,
        title: data.title,
        author: data.author,
        edition: data.edition,
        publisher: data.publisher,
      });

      if (duplicateResult.isDuplicate) {
        throw new AppError("Duplicate book detected in library catalog", 409, "DUPLICATE_BOOK", [duplicateResult]);
      }
    }

    // 2. Resolve department & library
    let dept = await Department.findOne({
      name: { $regex: new RegExp(`^${data.departmentName.trim()}`, "i") },
    });
    if (!dept) {
      dept = await Department.findOne() || (await Department.create({
        name: data.departmentName,
        code: data.departmentName.slice(0, 3).toUpperCase(),
        libraryName: `${data.departmentName} Library`,
        head: "Department Head",
      }));
    }

    let library = await Library.findOne({ departmentId: dept._id });
    if (!library) {
      library = await Library.create({
        name: dept.libraryName,
        code: `${dept.code}-LIB`,
        departmentId: dept._id,
        location: `${dept.name} Building, 2nd Floor`,
        shelfPrefixes: ["A", "B", "C"],
      });
    }

    const kw = Array.isArray(data.keywords)
      ? data.keywords
      : typeof data.keywords === "string"
      ? data.keywords.split(",").map((s) => s.trim())
      : ["Textbook", data.subject];

    const book = await Book.create({
      title: data.title,
      normalizedTitle: data.title.toLowerCase().trim(),
      author: data.author,
      normalizedAuthor: data.author.toLowerCase().trim(),
      isbn: data.isbn,
      edition: data.edition || "1st",
      publisher: data.publisher || "Academic Press",
      publicationYear: data.publicationYear || new Date().getFullYear(),
      category: data.category,
      subject: data.subject,
      description: data.description || "",
      keywords: kw,
      coverImage: data.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
      departmentId: dept._id,
      departmentName: dept.name,
      rating: 4.8,
      loanPeriodDays: 14,
      shelfLocation: data.shelfLocation || "A-01",
      totalCopies: data.copiesCount,
      availableCopies: data.copiesCount,
      hasEbook: false,
      createdBy: actorId ? new Types.ObjectId(actorId) : undefined,
    });

    // 3. Generate Book Copies with Barcodes
    const copies: any[] = [];
    const prefix = dept.code.toUpperCase();
    for (let i = 1; i <= data.copiesCount; i++) {
      const copyNum = String(i).padStart(3, "0");
      const barcode = `BC${Math.floor(100000 + Math.random() * 900000)}`;
      copies.push({
        bookId: book._id,
        copyCode: `${prefix}-${copyNum}`,
        barcode,
        departmentId: dept._id,
        departmentName: dept.name,
        libraryId: library._id,
        libraryName: library.name,
        shelfLocation: data.shelfLocation || "A-01",
        status: BookCopyStatus.AVAILABLE,
        condition: BookCondition.GOOD,
      });
    }
    await BookCopy.insertMany(copies);

    // Audit Log
    await AuditLog.create({
      actorId: actorId ? new Types.ObjectId(actorId) : undefined,
      actorName,
      actorRole: "LIBRARIAN",
      action: AuditAction.BOOK_CREATED,
      resourceType: "Book",
      resourceId: book._id.toString(),
      departmentName: dept.name,
      details: `Registered book "${book.title}" with ${data.copiesCount} physical copies`,
    });

    return book;
  }

  async updateBook(id: string, updateData: Partial<CreateBookDTO>, actorName: string = "Admin") {
    const book = await Book.findById(id);
    if (!book) throw new AppError("Book not found", 404, "BOOK_NOT_FOUND");

    if (updateData.title) {
      book.title = updateData.title;
      book.normalizedTitle = updateData.title.toLowerCase().trim();
    }
    if (updateData.author) {
      book.author = updateData.author;
      book.normalizedAuthor = updateData.author.toLowerCase().trim();
    }
    if (updateData.isbn) book.isbn = updateData.isbn;
    if (updateData.edition) book.edition = updateData.edition;
    if (updateData.publisher) book.publisher = updateData.publisher;
    if (updateData.publicationYear) book.publicationYear = updateData.publicationYear;
    if (updateData.shelfLocation) book.shelfLocation = updateData.shelfLocation;
    if (updateData.description !== undefined) book.description = updateData.description;

    await book.save();

    await AuditLog.create({
      actorName,
      actorRole: "ADMIN",
      action: AuditAction.BOOK_UPDATED,
      resourceType: "Book",
      resourceId: book._id.toString(),
      details: `Updated metadata for "${book.title}"`,
    });

    return book;
  }

  async getBookInventory(bookId: string) {
    const book = await Book.findById(bookId).lean();
    if (!book) throw new AppError("Book not found", 404, "BOOK_NOT_FOUND");

    const copies = await BookCopy.find({ bookId: book._id }).lean();
    return {
      bookId: book._id.toString(),
      title: book.title,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      copies: copies.map((c) => ({
        id: c._id.toString(),
        copyId: c.copyCode,
        barcode: c.barcode,
        status: c.status,
        condition: c.condition,
        borrower: c.currentBorrowerName || "—",
        dueDate: c.dueDate ? c.dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—",
        location: c.shelfLocation,
        library: c.libraryName,
      })),
    };
  }

  async importBooksFromCsv(csvContent: string, departmentName: string = "Computer Science") {
    const lines = csvContent.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length <= 1) {
      throw new AppError("CSV file must have a header row and at least one data row", 400);
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const titleIdx = headers.findIndex((h) => h.includes("title"));
    const authorIdx = headers.findIndex((h) => h.includes("author"));
    const isbnIdx = headers.findIndex((h) => h.includes("isbn"));
    const copiesIdx = headers.findIndex((h) => h.includes("copies"));

    if (titleIdx === -1 || authorIdx === -1) {
      throw new AppError("CSV must contain 'title' and 'author' columns", 400);
    }

    let successCount = 0;
    const failedRows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      const title = row[titleIdx];
      const author = row[authorIdx];
      const isbn = isbnIdx !== -1 && row[isbnIdx] ? row[isbnIdx] : `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const copies = copiesIdx !== -1 && parseInt(row[copiesIdx], 10) > 0 ? parseInt(row[copiesIdx], 10) : 3;

      if (!title || !author) {
        failedRows.push({ row: i + 1, reason: "Missing title or author" });
        continue;
      }

      try {
        await this.createBook({
          title,
          author,
          isbn,
          category: "Computer Science",
          subject: "Computer Science",
          departmentName,
          copiesCount: copies,
          bypassDuplicateCheck: true,
        });
        successCount++;
      } catch (err: any) {
        failedRows.push({ row: i + 1, title, reason: err.message });
      }
    }

    return {
      success: true,
      importedCount: successCount,
      failedCount: failedRows.length,
      failedRows,
    };
  }

  async deleteBook(id: string) {
    const book = await Book.findById(id);
    if (!book) throw new AppError("Book not found", 404);

    await Promise.all([
      Book.deleteOne({ _id: book._id }),
      BookCopy.deleteMany({ bookId: book._id }),
    ]);

    return { message: "Book and copies deleted successfully" };
  }

  async addCopy(bookId: string, data: { shelfLocation?: string; condition?: BookCondition }) {
    const book = await Book.findById(bookId);
    if (!book) throw new AppError("Book not found", 404);

    const dept = await Department.findById(book.departmentId) || await Department.findOne();
    const lib = await Library.findOne({ departmentId: dept?._id }) || await Library.findOne();

    const count = await BookCopy.countDocuments({ bookId: book._id });
    const copyNum = String(count + 1).padStart(2, "0");
    const copyCode = `${book.isbn.slice(-4)}-${copyNum}`;
    const barcode = `BC-${Math.floor(100000 + Math.random() * 900000)}`;

    const copy = await BookCopy.create({
      bookId: book._id,
      bookTitle: book.title,
      copyCode,
      barcode,
      accessionNumber: `ACC-${Math.floor(10000 + Math.random() * 90000)}`,
      libraryId: lib?._id,
      libraryName: lib?.name || "Main Library",
      departmentId: dept?._id,
      departmentName: dept?.name || book.departmentName,
      shelfLocation: data.shelfLocation || book.shelfLocation || "A-01",
      condition: data.condition || BookCondition.GOOD,
      status: BookCopyStatus.AVAILABLE,
    });

    book.totalCopies += 1;
    book.availableCopies += 1;
    await book.save();

    return { message: "Book copy added successfully", copy };
  }

  async getPopularBooks(limit: number = 10) {
    const books = await Book.find().sort({ rating: -1, availableCopies: -1 }).limit(limit).lean();
    return books.map((b) => ({
      id: b._id.toString(),
      title: b.title,
      author: b.author,
      dept: b.departmentName,
      subject: b.subject,
      category: b.category,
      isbn: b.isbn,
      edition: b.edition || "1st",
      publisher: b.publisher || "Academic Press",
      year: b.publicationYear || 2020,
      rating: b.rating,
      available: b.availableCopies,
      total: b.totalCopies,
      location: `${b.departmentName} Library`,
      shelf: b.shelfLocation,
      cover: b.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
      ebook: b.hasEbook,
    }));
  }
}

export const bookService = new BookService();
