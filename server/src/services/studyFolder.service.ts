import { Types } from "mongoose";
import { StudyFolder, IStudyFolder } from "../models/StudyFolder.js";
import { StudyFolderItem } from "../models/StudyFolderItem.js";
import { StudyNote } from "../models/StudyNote.js";
import { Bookmark } from "../models/Bookmark.js";
import { Book } from "../models/Book.js";
import { EBook } from "../models/EBook.js";
import { AppError } from "../middleware/errorHandler.js";

export class StudyFolderService {
  /**
   * Get all study folders for a user with populated book/notes counts and items
   */
  async getFolders(userId: string) {
    const folders = await StudyFolder.find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .lean();

    const results = await Promise.all(
      folders.map(async (f) => {
        const [items, notes] = await Promise.all([
          StudyFolderItem.find({ folderId: f._id }).sort({ createdAt: -1 }).lean(),
          StudyNote.find({ folderId: f._id }).sort({ createdAt: -1 }).lean(),
        ]);

        const folderBooks = items.map((item) => ({
          id: item._id.toString(),
          bookId: item.bookId ? item.bookId.toString() : undefined,
          ebookId: item.ebookId ? item.ebookId.toString() : undefined,
          title: item.title,
          author: item.author,
          cover: item.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=80&h=110&fit=crop",
          ebook: item.isEbook,
          notes: item.notes,
        }));

        const mappedNotes = notes.map((n) => ({
          id: n._id.toString(),
          title: n.title,
          content: n.content,
          date: n.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        }));

        return {
          id: f._id.toString(),
          name: f.name,
          description: f.description,
          emoji: f.emoji || "📁",
          color: f.color || "indigo",
          bookCount: folderBooks.length,
          books: folderBooks.map((b) => b.title),
          folderBooks,
          notes: mappedNotes,
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
        };
      })
    );

    return results;
  }

  /**
   * Create a new study folder
   */
  async createFolder(
    userId: string,
    data: { name: string; description?: string; color?: string; emoji?: string }
  ) {
    if (!data.name || !data.name.trim()) {
      throw new AppError("Folder name is required", 400);
    }

    const folder = await StudyFolder.create({
      userId: new Types.ObjectId(userId),
      name: data.name.trim(),
      description: data.description || "",
      color: data.color || "indigo",
      emoji: data.emoji || "📁",
      bookCount: 0,
    });

    return {
      id: folder._id.toString(),
      name: folder.name,
      description: folder.description,
      emoji: folder.emoji,
      color: folder.color,
      bookCount: 0,
      books: [],
      folderBooks: [],
      notes: [],
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    };
  }

  /**
   * Delete study folder and cascade delete items and notes
   */
  async deleteFolder(folderId: string, userId: string) {
    const folder = await StudyFolder.findOne({
      _id: folderId,
      userId: new Types.ObjectId(userId),
    });

    if (!folder) {
      throw new AppError("Study folder not found", 404);
    }

    await Promise.all([
      StudyFolder.deleteOne({ _id: folder._id }),
      StudyFolderItem.deleteMany({ folderId: folder._id }),
      StudyNote.deleteMany({ folderId: folder._id }),
    ]);

    return { message: "Folder and contents deleted successfully" };
  }

  /**
   * Add a book or ebook to folder
   */
  async addBookToFolder(
    folderId: string,
    userId: string,
    bookIdOrEbookId: string,
    isEbook: boolean = false
  ) {
    const folder = await StudyFolder.findOne({
      _id: folderId,
      userId: new Types.ObjectId(userId),
    });

    if (!folder) {
      throw new AppError("Study folder not found", 404);
    }

    let title = "";
    let author = "";
    let cover = "";

    if (isEbook) {
      const ebook = await EBook.findById(bookIdOrEbookId);
      if (!ebook) throw new AppError("E-Book not found", 404);
      title = ebook.title;
      author = ebook.author;
      cover = ebook.coverImage || "";

      // Check if already in folder
      const exists = await StudyFolderItem.findOne({ folderId: folder._id, ebookId: ebook._id });
      if (exists) throw new AppError("E-Book already in this folder", 400);

      await StudyFolderItem.create({
        folderId: folder._id,
        userId: new Types.ObjectId(userId),
        itemType: "ebook",
        ebookId: ebook._id,
        title,
        author,
        coverImage: cover,
        isEbook: true,
      });
    } else {
      const book = await Book.findById(bookIdOrEbookId);
      if (!book) throw new AppError("Book not found", 404);
      title = book.title;
      author = book.author;
      cover = book.coverImage || "";

      const exists = await StudyFolderItem.findOne({ folderId: folder._id, bookId: book._id });
      if (exists) throw new AppError("Book already in this folder", 400);

      await StudyFolderItem.create({
        folderId: folder._id,
        userId: new Types.ObjectId(userId),
        itemType: "book",
        bookId: book._id,
        title,
        author,
        coverImage: cover,
        isEbook: false,
      });
    }

    folder.bookCount = await StudyFolderItem.countDocuments({ folderId: folder._id });
    await folder.save();

    return { message: `"${title}" added to folder` };
  }

  /**
   * Remove item from folder
   */
  async removeBookFromFolder(folderId: string, itemId: string, userId: string) {
    const folder = await StudyFolder.findOne({
      _id: folderId,
      userId: new Types.ObjectId(userId),
    });

    if (!folder) throw new AppError("Folder not found", 404);

    await StudyFolderItem.deleteOne({ _id: itemId, folderId: folder._id });
    folder.bookCount = await StudyFolderItem.countDocuments({ folderId: folder._id });
    await folder.save();

    return { message: "Item removed from folder" };
  }

  /**
   * Add a study note
   */
  async addNote(
    folderId: string,
    userId: string,
    data: { title: string; content: string }
  ) {
    const folder = await StudyFolder.findOne({
      _id: folderId,
      userId: new Types.ObjectId(userId),
    });

    if (!folder) throw new AppError("Folder not found", 404);
    if (!data.title || !data.title.trim()) throw new AppError("Note title is required", 400);

    const note = await StudyNote.create({
      folderId: folder._id,
      userId: new Types.ObjectId(userId),
      title: data.title.trim(),
      content: data.content || "",
    });

    return {
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      date: note.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
  }

  /**
   * Delete a study note
   */
  async deleteNote(noteId: string, userId: string) {
    const result = await StudyNote.deleteOne({
      _id: noteId,
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) throw new AppError("Note not found", 404);
    return { message: "Note deleted successfully" };
  }

  /**
   * Bookmarks for E-Books
   */
  async getBookmarks(userId: string, ebookId?: string) {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (ebookId) query.ebookId = new Types.ObjectId(ebookId);

    const bookmarks = await Bookmark.find(query).sort({ pageNumber: 1 }).lean();
    return bookmarks.map((b) => ({
      id: b._id.toString(),
      ebookId: b.ebookId.toString(),
      title: b.title,
      pageNumber: b.pageNumber,
      note: b.note,
      createdAt: b.createdAt,
    }));
  }

  async addBookmark(
    userId: string,
    ebookId: string,
    data: { title: string; pageNumber: number; note?: string }
  ) {
    const bookmark = await Bookmark.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        ebookId: new Types.ObjectId(ebookId),
        pageNumber: data.pageNumber,
      },
      {
        $set: {
          title: data.title || `Page ${data.pageNumber}`,
          note: data.note,
        },
      },
      { upsert: true, new: true }
    );

    return {
      id: bookmark._id.toString(),
      ebookId: bookmark.ebookId.toString(),
      title: bookmark.title,
      pageNumber: bookmark.pageNumber,
      note: bookmark.note,
    };
  }

  async deleteBookmark(bookmarkId: string, userId: string) {
    const res = await Bookmark.deleteOne({
      _id: bookmarkId,
      userId: new Types.ObjectId(userId),
    });
    if (res.deletedCount === 0) throw new AppError("Bookmark not found", 404);
    return { message: "Bookmark removed" };
  }
}

export const studyFolderService = new StudyFolderService();
