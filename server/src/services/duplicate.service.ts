import { Book, IBook } from "../models/Book.js";
import { BookCopy } from "../models/BookCopy.js";
import { EBook } from "../models/EBook.js";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchReason?: string;
  existingBook?: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    totalCopies: number;
    availableCopies: number;
    locations: { libraryName: string; count: number }[];
  };
}

export class DuplicateService {
  normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  async checkBookDuplicate(params: {
    isbn?: string;
    title: string;
    author: string;
    edition?: string;
    publisher?: string;
    excludeBookId?: string;
  }): Promise<DuplicateCheckResult> {
    const cleanIsbn = params.isbn?.replace(/[-\s]/g, "").trim();

    // 1. Primary Signal: ISBN match
    if (params.isbn && params.isbn.trim()) {
      const rawIsbn = params.isbn.trim();
      const cleanDigits = rawIsbn.replace(/[-\s]/g, "");
      const pattern = cleanDigits.split("").join("[- ]?");
      const isbnQuery: any = {
        $or: [
          { isbn: { $regex: new RegExp(`^${pattern}$`, "i") } },
          { isbn: rawIsbn },
        ],
      };
      if (params.excludeBookId) {
        isbnQuery._id = { $ne: params.excludeBookId };
      }
      const isbnBook = await Book.findOne(isbnQuery);

      if (isbnBook) {
        return this.buildDuplicateResponse(isbnBook, "Exact ISBN match");
      }
    }

    // 2. Secondary Composite Signal: Normalized Title + Normalized Author
    const normTitle = this.normalizeString(params.title);
    const normAuthor = this.normalizeString(params.author);

    if (normTitle && normAuthor) {
      const titleRegex = new RegExp(params.title.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const titleQuery: any = { title: { $regex: titleRegex } };
      if (params.excludeBookId) {
        titleQuery._id = { $ne: params.excludeBookId };
      }
      const candidateBooks = await Book.find(titleQuery);

      for (const book of candidateBooks) {
        const titleMatch = this.normalizeString(book.title) === normTitle;
        const authorMatch =
          this.normalizeString(book.author).includes(normAuthor) ||
          normAuthor.includes(this.normalizeString(book.author));

        if (titleMatch && authorMatch) {
          return this.buildDuplicateResponse(book, "Title and Author match");
        }
      }
    }

    return { isDuplicate: false };
  }

  private async buildDuplicateResponse(book: IBook, reason: string): Promise<DuplicateCheckResult> {
    const copies = await BookCopy.find({ bookId: book._id });
    const locationMap: Record<string, number> = {};

    copies.forEach((c) => {
      locationMap[c.libraryName] = (locationMap[c.libraryName] || 0) + 1;
    });

    const locations = Object.entries(locationMap).map(([libraryName, count]) => ({
      libraryName,
      count,
    }));

    return {
      isDuplicate: true,
      matchReason: reason,
      existingBook: {
        id: book._id.toString(),
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        locations,
      },
    };
  }
}

export const duplicateService = new DuplicateService();
