import { Types } from "mongoose";
import { TransferRequest, ITransferRequest } from "../models/TransferRequest.js";
import { BookCopy } from "../models/BookCopy.js";
import { Book } from "../models/Book.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { BorrowTransaction } from "../models/BorrowTransaction.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  TransferStatus,
  BookCopyStatus,
  NotificationType,
  BorrowTransactionStatus,
  UserRole,
  AuditAction,
} from "../constants/index.js";
import { AuditLog } from "../models/AuditLog.js";

export class TransferService {
  async getTransfers(filter?: string | { dept?: string; status?: string; fromLibrary?: string; toLibrary?: string }) {
    const query: any = {};
    if (typeof filter === "string") {
      if (filter && filter !== "All") {
        query.$or = [
          { sourceDepartmentName: { $regex: filter, $options: "i" } },
          { targetDepartmentName: { $regex: filter, $options: "i" } },
        ];
      }
    } else if (filter) {
      if (filter.dept && filter.dept !== "All") {
        query.$or = [
          { sourceDepartmentName: { $regex: filter.dept, $options: "i" } },
          { targetDepartmentName: { $regex: filter.dept, $options: "i" } },
        ];
      }
      if (filter.status && filter.status !== "All") {
        query.status = filter.status;
      }
      if (filter.fromLibrary) {
        query.sourceLibraryName = { $regex: filter.fromLibrary, $options: "i" };
      }
      if (filter.toLibrary) {
        query.targetLibraryName = { $regex: filter.toLibrary, $options: "i" };
      }
    }

    const items = await TransferRequest.find(query).sort({ createdAt: -1 }).lean();

    return items.map((t) => ({
      id: t.transferId,
      mongoId: t._id.toString(),
      student: t.studentName,
      studentDept: t.studentDept,
      book: t.bookTitle,
      currentLib: t.sourceLibraryName,
      targetLib: t.targetLibraryName,
      status: t.statusLabel || "Transfer Pending",
      rawStatus: t.status,
      requestDate: t.requestDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      steps: t.steps,
    }));
  }

  async notifyLibrarian(transferId: string, actorName: string = "Librarian") {
    const transfer = await TransferRequest.findOne({
      $or: [{ transferId }, { _id: transferId.length === 24 ? transferId : undefined }],
    });
    if (!transfer) throw new AppError("Transfer request not found", 404);

    // Find source librarian
    const sourceLibrarian = await User.findOne({
      departmentId: transfer.sourceDepartmentId,
      role: UserRole.LIBRARIAN,
    });

    if (sourceLibrarian) {
      await Notification.create({
        userId: sourceLibrarian._id,
        type: NotificationType.TRANSFER_REQUESTED,
        uiType: "warning",
        title: "Inter-Department Transfer Request",
        message: `Please dispatch "${transfer.bookTitle}" (Copy ${transfer.copyCode || ""}) to ${transfer.targetLibraryName}.`,
        metadata: { transferId: transfer._id },
      });
    }

    transfer.status = TransferStatus.SOURCE_LIBRARIAN_APPROVED;
    transfer.statusLabel = "In Transit";

    // Mark steps
    transfer.steps = transfer.steps.map((s) => {
      if (s.label.includes("transfer pending") || s.label.includes("initiated")) {
        return { ...s, done: true, active: false };
      }
      if (s.label.includes("Received by")) {
        return { ...s, active: true };
      }
      return s;
    });

    if (transfer.bookCopyId) {
      await BookCopy.findByIdAndUpdate(transfer.bookCopyId, {
        status: BookCopyStatus.IN_TRANSFER,
      });
    }

    await transfer.save();

    await AuditLog.create({
      actorName,
      actorRole: "LIBRARIAN",
      action: AuditAction.TRANSFER_APPROVED,
      resourceType: "TransferRequest",
      resourceId: transfer.transferId,
      departmentName: transfer.sourceDepartmentName,
      details: `Transfer ${transfer.transferId} approved and marked In Transit from ${transfer.sourceLibraryName}`,
    });

    return {
      message: `Notification sent to ${transfer.sourceLibraryName} librarian. Book is now in transit.`,
      transfer,
    };
  }

  async markAsReceived(transferId: string, librarianName: string = "Librarian") {
    const transfer = await TransferRequest.findOne({
      $or: [{ transferId }, { _id: transferId.length === 24 ? transferId : undefined }],
    });
    if (!transfer) throw new AppError("Transfer request not found", 404);

    transfer.status = TransferStatus.RECEIVED_BY_DESTINATION_LIBRARY;
    transfer.statusLabel = "Received";
    transfer.receivedDate = new Date();

    // Update steps
    transfer.steps = transfer.steps.map((s) => {
      if (s.label.includes("Received by")) {
        return { ...s, done: true, active: false };
      }
      if (s.label.includes("pickup") || s.label.includes("student pickup")) {
        return { ...s, active: true };
      }
      return s;
    });

    // Update BookCopy location and status
    if (transfer.bookCopyId) {
      await BookCopy.findByIdAndUpdate(transfer.bookCopyId, {
        departmentId: transfer.targetDepartmentId,
        departmentName: transfer.targetDepartmentName,
        libraryId: transfer.targetLibraryId,
        libraryName: transfer.targetLibraryName,
        status: BookCopyStatus.RESERVED,
      });
    }

    await transfer.save();

    // Notify Student automatically that book has arrived
    await Notification.create({
      userId: transfer.studentId,
      type: NotificationType.TRANSFER_RECEIVED,
      uiType: "info",
      title: "Book Arrived at Library",
      message: `Your requested book "${transfer.bookTitle}" has arrived at ${transfer.targetLibraryName}. Please visit the circulation desk to collect it.`,
      metadata: { transferId: transfer._id },
    });

    await AuditLog.create({
      actorName: librarianName,
      actorRole: "LIBRARIAN",
      action: AuditAction.TRANSFER_RECEIVED,
      resourceType: "TransferRequest",
      resourceId: transfer.transferId,
      departmentName: transfer.targetDepartmentName,
      details: `Transfer ${transfer.transferId} marked as received at ${transfer.targetLibraryName}`,
    });

    return {
      message: `Transfer ${transfer.transferId} marked as received. Book is now at ${transfer.targetLibraryName}.`,
      transfer,
    };
  }

  async notifyStudent(transferId: string) {
    const transfer = await TransferRequest.findOne({
      $or: [{ transferId }, { _id: transferId.length === 24 ? transferId : undefined }],
    });
    if (!transfer) throw new AppError("Transfer request not found", 404);

    await Notification.create({
      userId: transfer.studentId,
      type: NotificationType.BOOK_READY,
      uiType: "success",
      title: "Book Ready for Pickup",
      message: `"${transfer.bookTitle}" is ready for you at ${transfer.targetLibraryName}. Please collect it within 3 business days.`,
      metadata: { transferId: transfer._id },
    });

    return {
      message: `Student ${transfer.studentName} has been notified that the book is ready for pickup.`,
    };
  }

  async issueToStudent(transferId: string, librarianName: string = "Librarian", librarianId?: string) {
    const transfer = await TransferRequest.findOne({
      $or: [{ transferId }, { _id: transferId.length === 24 ? transferId : undefined }],
    });
    if (!transfer) throw new AppError("Transfer request not found", 404);

    const user = await User.findById(transfer.studentId);
    if (!user) throw new AppError("Student record not found", 404);

    const book = await Book.findById(transfer.bookId);
    if (!book) throw new AppError("Book record not found", 404);

    const bookCopy = await BookCopy.findById(transfer.bookCopyId);
    if (!bookCopy) throw new AppError("Book copy record not found", 404);

    const issuedAt = new Date();
    const dueDate = new Date(Date.now() + (book.loanPeriodDays || 14) * 24 * 60 * 60 * 1000);

    // Create active transaction
    const transaction = await BorrowTransaction.create({
      transactionId: `BRW-${Math.floor(1000 + Math.random() * 9000)}`,
      bookId: book._id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookIsbn: book.isbn,
      bookCover: book.coverImage,
      bookCopyId: bookCopy._id,
      copyCode: bookCopy.copyCode,
      barcode: bookCopy.barcode,
      userId: user._id,
      userName: user.name,
      userCollegeId: user.collegeId,
      userDepartmentName: user.departmentName || "General",
      userEmail: user.email,
      departmentId: transfer.targetDepartmentId,
      libraryId: transfer.targetLibraryId,
      libraryName: transfer.targetLibraryName,
      originalLibraryName: transfer.sourceLibraryName,
      shelfLocation: bookCopy.shelfLocation,
      issuedAt,
      dueDate,
      status: BorrowTransactionStatus.ACTIVE,
      issuedBy: librarianId ? new Types.ObjectId(librarianId) : undefined,
    });

    // Update Book Copy
    bookCopy.status = BookCopyStatus.BORROWED;
    bookCopy.currentBorrowerId = user._id;
    bookCopy.currentBorrowerName = user.name;
    bookCopy.currentBorrowTransactionId = transaction._id;
    bookCopy.dueDate = dueDate;
    await bookCopy.save();

    // Mark transfer completed
    transfer.status = TransferStatus.COMPLETED;
    transfer.statusLabel = "Completed";
    transfer.issuedDate = new Date();
    transfer.steps = transfer.steps.map((s) => ({ ...s, done: true, active: false }));
    await transfer.save();

    await Notification.create({
      userId: user._id,
      type: NotificationType.BOOK_ISSUED,
      uiType: "success",
      title: "Book Issued Successfully",
      message: `"${book.title}" has been issued to you. Due date: ${dueDate.toLocaleDateString("en-GB")}.`,
      metadata: { transactionId: transaction._id },
    });

    await AuditLog.create({
      actorName: librarianName,
      actorRole: "LIBRARIAN",
      action: AuditAction.BOOK_COPY_ISSUED,
      resourceType: "BookCopy",
      resourceId: bookCopy.copyCode,
      departmentName: transfer.targetDepartmentName,
      details: `Issued copy ${bookCopy.copyCode} of "${book.title}" to student ${user.name}`,
    });

    return {
      message: `Book issued to ${user.name}. Due on ${dueDate.toLocaleDateString("en-GB")}.`,
      transaction,
      transfer,
    };
  }

  async requestTransfer(
    data: {
      bookId: string;
      bookCopyId?: string;
      sourceDepartmentName: string;
      targetDepartmentName: string;
      notes?: string;
    },
    librarianUserId: string
  ) {
    const librarian = await User.findById(librarianUserId);
    const book = await Book.findById(data.bookId);
    if (!book) throw new AppError("Book not found", 404);

    let copy;
    if (data.bookCopyId) {
      copy = await BookCopy.findById(data.bookCopyId);
    } else {
      copy = await BookCopy.findOne({
        bookId: book._id,
        departmentName: { $regex: new RegExp(data.sourceDepartmentName, "i") },
        status: BookCopyStatus.AVAILABLE,
      });
    }

    if (!copy) throw new AppError("No available copy found in source department", 400);

    const transfer = await TransferRequest.create({
      transferId: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      bookId: book._id,
      bookTitle: book.title,
      bookCopyId: copy._id,
      copyCode: copy.copyCode,
      sourceDepartmentName: data.sourceDepartmentName,
      targetDepartmentName: data.targetDepartmentName,
      sourceLibraryName: `${data.sourceDepartmentName} Library`,
      targetLibraryName: `${data.targetDepartmentName} Library`,
      studentName: librarian?.name || "Librarian Request",
      studentDept: data.targetDepartmentName,
      status: TransferStatus.REQUESTED,
      statusLabel: "Transfer Pending",
      requestDate: new Date(),
      steps: [
        { label: "Transfer initiated", done: true, active: false },
        { label: `Dispatch from ${data.sourceDepartmentName}`, done: false, active: true },
        { label: `Received by ${data.targetDepartmentName}`, done: false, active: false },
        { label: "Available for pickup", done: false, active: false },
      ],
    });

    copy.status = BookCopyStatus.IN_TRANSFER;
    await copy.save();

    return { message: "Transfer request created", transfer };
  }

  async dispatchTransfer(transferId: string, details?: any, librarianUserId?: string) {
    const librarian = librarianUserId ? await User.findById(librarianUserId) : null;
    return this.notifyLibrarian(transferId, librarian?.name || "Librarian");
  }

  async receiveTransfer(
    transferId: string,
    condition?: string,
    shelfLocation?: string,
    librarianUserId?: string
  ) {
    const librarian = librarianUserId ? await User.findById(librarianUserId) : null;
    return this.markAsReceived(transferId, librarian?.name || "Librarian");
  }

  async cancelTransfer(transferId: string, librarianUserId: string, reason?: string) {
    const transfer = await TransferRequest.findOne({
      $or: [{ transferId }, { _id: transferId.length === 24 ? transferId : undefined }],
    });
    if (!transfer) throw new AppError("Transfer request not found", 404);

    transfer.status = TransferStatus.CANCELLED;
    transfer.statusLabel = "Cancelled";
    await transfer.save();

    if (transfer.bookCopyId) {
      await BookCopy.findByIdAndUpdate(transfer.bookCopyId, {
        status: BookCopyStatus.AVAILABLE,
      });
    }

    return { message: "Transfer cancelled successfully", transfer };
  }
}

export const transferService = new TransferService();
