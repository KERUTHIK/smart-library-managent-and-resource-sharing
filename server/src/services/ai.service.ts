import { Types } from "mongoose";
import { AIConversation } from "../models/AIConversation.js";
import { AIMessage } from "../models/AIMessage.js";
import { Book } from "../models/Book.js";
import { EBook } from "../models/EBook.js";
import { aiProvider } from "../integrations/ai/index.js";
import { AppError } from "../middleware/errorHandler.js";

export class AIService {
  /**
   * Retrieve active conversation messages or create a new one
   */
  async getOrCreateConversation(userId: string, bookContextId?: string) {
    let conversation = await AIConversation.findOne({
      userId: new Types.ObjectId(userId),
    }).sort({ updatedAt: -1 });

    if (!conversation) {
      let bookTitle: string | undefined;
      if (bookContextId) {
        const book = await Book.findById(bookContextId);
        bookTitle = book?.title;
      }
      conversation = await AIConversation.create({
        userId: new Types.ObjectId(userId),
        title: bookTitle ? `Discussion: ${bookTitle}` : "General Study Chat",
        bookContextId: bookContextId ? new Types.ObjectId(bookContextId) : undefined,
        bookContextTitle: bookTitle,
      });
    }

    const messages = await AIMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    return {
      conversationId: conversation._id.toString(),
      title: conversation.title,
      messages: messages.map((m) => ({
        id: m._id.toString(),
        role: m.role,
        content: m.content,
        time: m.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: m.sources && m.sources.length > 0 ? m.sources : undefined,
      })),
    };
  }

  /**
   * Process a chat query with RAG context from library books
   */
  async chat(
    userId: string,
    query: string,
    conversationId?: string,
    bookContextId?: string
  ) {
    if (!query || !query.trim()) {
      throw new AppError("Message content is required", 400);
    }

    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({
        _id: conversationId,
        userId: new Types.ObjectId(userId),
      });
    }

    if (!conversation) {
      let bookTitle: string | undefined;
      if (bookContextId) {
        const book = await Book.findById(bookContextId);
        bookTitle = book?.title;
      }
      conversation = await AIConversation.create({
        userId: new Types.ObjectId(userId),
        title: query.slice(0, 40) + "...",
        bookContextId: bookContextId ? new Types.ObjectId(bookContextId) : undefined,
        bookContextTitle: bookTitle,
      });
    }

    // 1. Save user message to database
    const userMsg = await AIMessage.create({
      conversationId: conversation._id,
      userId: new Types.ObjectId(userId),
      role: "user",
      content: query.trim(),
    });

    // 2. Build RAG context from library catalog
    let ragContext = "";
    const matchedSources: { title: string; chapter: string; page?: number; snippet?: string }[] = [];

    // Search books and ebooks matching keywords
    const keywords = query
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(" ")
      .filter((w) => w.length > 3)
      .slice(0, 5);

    if (keywords.length > 0) {
      const searchRegex = new RegExp(keywords.join("|"), "i");
      const [matchedBooks, matchedEbooks] = await Promise.all([
        Book.find({
          $or: [{ title: searchRegex }, { subject: searchRegex }, { description: searchRegex }],
        })
          .limit(3)
          .lean(),
        EBook.find({
          $or: [{ title: searchRegex }, { subject: searchRegex }, { description: searchRegex }],
        })
          .limit(2)
          .lean(),
      ]);

      matchedBooks.forEach((b) => {
        ragContext += `\nBook: "${b.title}" by ${b.author}. Subject: ${b.subject || "General"}. Overview: ${b.description || "Foundational academic textbook."}`;
        matchedSources.push({
          title: b.title,
          chapter: b.subject ? `${b.subject} Fundamentals` : "Course Overview",
          snippet: b.description ? b.description.slice(0, 100) + "..." : undefined,
        });
      });

      matchedEbooks.forEach((e) => {
        ragContext += `\nE-Book: "${e.title}" by ${e.author}. Subject: ${e.subject || "Academic"}.`;
        if (matchedSources.length < 3) {
          matchedSources.push({
            title: e.title,
            chapter: "Digital Edition",
          });
        }
      });
    }

    // Fallback source if none matched
    if (matchedSources.length === 0) {
      const generalBook = await Book.findOne().lean();
      if (generalBook) {
        matchedSources.push({
          title: generalBook.title,
          chapter: "General Reference",
        });
        ragContext = `Book: "${generalBook.title}" by ${generalBook.author}.`;
      }
    }

    // 3. Generate answer via AI Provider
    const aiResult = await aiProvider.chat(query, undefined, ragContext);

    // 4. Save assistant message
    const assistantMsg = await AIMessage.create({
      conversationId: conversation._id,
      userId: new Types.ObjectId(userId),
      role: "assistant",
      content: aiResult.content,
      sources: matchedSources.length > 0 ? matchedSources : (aiResult.sources as any),
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    return {
      id: assistantMsg._id.toString(),
      role: "assistant",
      content: assistantMsg.content,
      time: assistantMsg.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sources: assistantMsg.sources,
      conversationId: conversation._id.toString(),
    };
  }

  /**
   * Clear conversation history for user
   */
  async clearHistory(userId: string) {
    const conversations = await AIConversation.find({ userId: new Types.ObjectId(userId) });
    const convIds = conversations.map((c) => c._id);
    await Promise.all([
      AIConversation.deleteMany({ userId: new Types.ObjectId(userId) }),
      AIMessage.deleteMany({ conversationId: { $in: convIds } }),
    ]);
    return { message: "Chat history cleared" };
  }
}

export const aiService = new AIService();
