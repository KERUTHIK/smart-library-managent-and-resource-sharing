import fs from "node:fs";
import path from "node:path";
import pdfParse from "pdf-parse";
import { EBook, IEBook } from "../models/EBook.js";
import { Department } from "../models/Department.js";
import { getAIProvider } from "../integrations/ai/index.js";
import { duplicateService } from "./duplicate.service.js";
import { storageService } from "../integrations/storage/StorageService.js";
import { AppError } from "../middleware/errorHandler.js";
import { Types } from "mongoose";

export class EBookService {
  /**
   * Section 15: AI PDF METADATA EXTRACTION
   * 1. Receive PDF
   * 2. Extract text and page count via pdf-parse
   * 3. Send text to AI provider (Gemini / Heuristic)
   * 4. AI identifies title, author, ISBN, publisher, edition, year, category, subject, language, description, keywords
   * 5. Perform duplicate check
   * 6. Return metadata for user confirmation before saving
   */
  async extractMetadataFromPdf(filePath: string, originalName: string) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      throw new AppError("Uploaded PDF file not found", 404);
    }

    const dataBuffer = fs.readFileSync(fullPath);
    let extractedText = "";
    let pageCount = 100;

    try {
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text || "";
      pageCount = pdfData.numpages || 100;
    } catch (err: any) {
      console.warn("pdf-parse extraction notice:", err.message);
      extractedText = originalName;
    }

    const ai = getAIProvider();
    const metadata = await ai.extractMetadataFromText(extractedText, originalName);

    // Duplicate Check
    const duplicateCheck = await duplicateService.checkBookDuplicate({
      isbn: metadata.isbn,
      title: metadata.title,
      author: metadata.author,
      edition: metadata.edition,
      publisher: metadata.publisher,
    });

    const stats = fs.statSync(fullPath);
    const fileSizeMb = (stats.size / (1024 * 1024)).toFixed(1) + " MB";

    return {
      metadata: {
        ...metadata,
        pageCount,
        fileSize: fileSizeMb,
        tempFilePath: filePath,
        fileName: originalName,
      },
      duplicateCheck,
      aiProvider: ai.name,
    };
  }

  async getEBooks(query: {
    search?: string;
    department?: string;
    subject?: string;
    sortBy?: string;
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
        { subject: { $regex: q, $options: "i" } },
      ];
    }

    if (query.department && query.department !== "All Departments" && query.department !== "All") {
      filter.departmentName = { $regex: new RegExp(query.department, "i") };
    }

    if (query.subject && query.subject !== "All Subjects" && query.subject !== "All") {
      filter.subject = { $regex: new RegExp(query.subject, "i") };
    }

    let sort: any = { createdAt: -1 };
    if (query.sortBy === "az") sort = { title: 1 };
    if (query.sortBy === "popular") sort = { rating: -1, readCount: -1 };

    const [items, total] = await Promise.all([
      EBook.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      EBook.countDocuments(filter),
    ]);

    return {
      items: items.map((b) => ({
        id: b._id.toString(),
        title: b.title,
        author: b.author,
        dept: b.departmentName,
        subject: b.subject,
        format: "PDF",
        pages: b.pageCount,
        rating: b.rating,
        cover: b.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&h=160&fit=crop",
        size: b.fileSize,
        year: b.publicationYear || 2020,
        readCount: b.readCount,
        description: b.description,
        pdfUrl: `/api/ebooks/${b._id}/pdf`,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getEBookById(id: string) {
    const ebook = await EBook.findById(id).lean();
    if (!ebook) throw new AppError("E-Book not found", 404);
    return {
      id: ebook._id.toString(),
      title: ebook.title,
      author: ebook.author,
      dept: ebook.departmentName,
      subject: ebook.subject,
      format: "PDF",
      pages: ebook.pageCount,
      rating: ebook.rating,
      cover: ebook.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&h=160&fit=crop",
      size: ebook.fileSize,
      year: ebook.publicationYear || 2020,
      description: ebook.description,
      language: ebook.language,
      keywords: ebook.keywords,
      pdfUrl: `/api/ebooks/${ebook._id}/pdf`,
    };
  }

  async createEBook(data: any, actorId?: string) {
    let dept = await Department.findOne({
      name: { $regex: new RegExp(`^${data.departmentName?.trim() || "Computer Science"}`, "i") },
    });
    if (!dept) {
      dept = await Department.findOne() || (await Department.create({
        name: data.departmentName || "Computer Science",
        code: "CSE",
        libraryName: "CSE Library",
        head: "Head of Dept",
      }));
    }

    const ebook = await EBook.create({
      title: data.title,
      normalizedTitle: data.title.toLowerCase().trim(),
      author: data.author,
      normalizedAuthor: data.author.toLowerCase().trim(),
      isbn: data.isbn,
      publisher: data.publisher,
      edition: data.edition,
      publicationYear: data.publicationYear || new Date().getFullYear(),
      category: data.category || "Computer Science",
      subject: data.subject || "Computer Science",
      description: data.description || "",
      language: data.language || "English",
      keywords: Array.isArray(data.keywords) ? data.keywords : typeof data.keywords === "string" ? data.keywords.split(",") : ["EBook"],
      coverImage: data.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&h=160&fit=crop",
      pdfPath: data.pdfPath || "uploads/sample.pdf",
      fileSize: data.fileSize || "18.4 MB",
      pageCount: data.pageCount || 842,
      departmentId: dept._id,
      departmentName: dept.name,
      rating: 4.8,
      readCount: 0,
      isAiExtracted: !!data.isAiExtracted,
      createdBy: actorId ? new Types.ObjectId(actorId) : undefined,
    });

    return ebook;
  }

  async getPdfPath(id: string): Promise<string> {
    const ebook = await EBook.findById(id).lean();
    if (!ebook) throw new AppError("E-Book not found", 404);
    return storageService.getFilePath(ebook.pdfPath);
  }

  async extractMetadataOnly(file: Express.Multer.File) {
    return this.extractMetadataFromPdf(file.path, file.originalname);
  }

  async createEBookWithFile(file: Express.Multer.File, data: any, actorId?: string) {
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    const ebook = await this.createEBook(
      {
        ...data,
        pdfPath: file.path,
        fileSize: fileSizeMb,
      },
      actorId
    );
    return ebook;
  }

  async deleteEBook(id: string) {
    const ebook = await EBook.findById(id);
    if (!ebook) throw new AppError("E-Book not found", 404);

    if (ebook.pdfPath && fs.existsSync(ebook.pdfPath)) {
      try {
        fs.unlinkSync(ebook.pdfPath);
      } catch (err) {
        console.warn("Could not delete file:", err);
      }
    }

    await EBook.deleteOne({ _id: ebook._id });
    return { message: "E-Book deleted successfully" };
  }
}

export const ebookService = new EBookService();
