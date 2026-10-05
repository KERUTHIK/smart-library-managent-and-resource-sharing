import { Types } from "mongoose";
import { BorrowTransaction } from "../models/BorrowTransaction.js";
import { ReturnTransaction } from "../models/ReturnTransaction.js";
import { BookCopy } from "../models/BookCopy.js";
import { Book } from "../models/Book.js";
import { Fine } from "../models/Fine.js";
import { WaitlistEntry } from "../models/WaitlistEntry.js";
import { Notification } from "../models/Notification.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  BorrowTransactionStatus,
  BookCopyStatus,
  BookCondition,
  FineStatus,
  WaitlistStatus,
  NotificationType,
  AuditAction,
} from "../constants/index.js";
import { AuditLog } from "../models/AuditLog.js";

export class ReturnService {
  async getActiveBorrowings(departmentName?: string, query?: string) {
    const filter: any = {
      status: { $in: [BorrowTransactionStatus.ACTIVE, BorrowTransactionStatus.OVERDUE] },
    };

    if (departmentName && departmentName !== "All" && departmentName !== "All Departments") {
      filter.userDepartmentName = { $regex: new RegExp(departmentName, "i") };
    }

    if (query) {
      filter.$or = [
        { userName: { $regex: query, $options: "i" } },
        { bookTitle: { $regex: query, $options: "i" } },
        { transactionId: { $regex: query, $options: "i" } },
        { copyCode: { $regex: query, $options: "i" } },
      ];
    }

    const items = await BorrowTransaction.find(filter).sort({ dueDate: 1 }).lean();
    const now = new Date();

    return items.map((r) => {
      const isPastDue = now > r.dueDate;
      const daysOverdue = isPastDue ? Math.ceil((now.getTime() - r.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const fine = daysOverdue * (r.finePerDay || 5);

      const daysRemaining = !isPastDue
        ? Math.ceil((r.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      let status = "Borrowed";
      if (daysOverdue > 0) status = "Overdue";
      else if (daysRemaining <= 2) status = "Due Soon";

      return {
        id: r.transactionId,
        mongoId: r._id.toString(),
        student: r.userName,
        studentId: r.userCollegeId,
        dept: r.userDepartmentName,
        email: r.userEmail,
        book: r.bookTitle,
        author: r.bookAuthor,
        isbn: r.bookIsbn,
        copy: r.copyCode,
        cover: r.bookCover || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
        library: r.libraryName,
        originalLibrary: r.originalLibraryName,
        shelf: r.shelfLocation,
        borrowedDate: r.issuedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        dueDate: r.dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        daysOverdue,
        fine,
        finePerDay: r.finePerDay || 5,
        status,
      };
    });
  }

  async getReturnHistory(departmentName?: string, query?: string) {
    const filter: any = {};
    if (query) {
      filter.$or = [
        { studentName: { $regex: query, $options: "i" } },
        { bookTitle: { $regex: query, $options: "i" } },
        { returnId: { $regex: query, $options: "i" } },
      ];
    }

    const items = await ReturnTransaction.find(filter).sort({ returnedDate: -1 }).lean();

    return items.map((r) => ({
      id: r.borrowTransactionId.toString(),
      returnId: r.returnId,
      student: r.studentName,
      studentId: r.studentCollegeId,
      dept: r.studentDepartmentName,
      book: r.bookTitle,
      author: r.bookAuthor,
      copy: r.copyCode,
      borrowedDate: r.borrowedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      dueDate: r.dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      returnedDate: r.returnedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      daysOverdue: r.daysOverdue,
      fine: r.fineAssessed,
      condition: r.condition,
      returnedBy: r.processedByLibrarianName,
      status: "Returned",
    }));
  }

  async processReturn(
    transactionIdOrMongoId: string,
    condition: BookCondition = BookCondition.GOOD,
    librarianName: string = "Librarian",
    librarianId?: string,
    notes?: string
  ) {
    const transaction = await BorrowTransaction.findOne({
      $or: [
        { transactionId: transactionIdOrMongoId },
        { _id: transactionIdOrMongoId.length === 24 ? transactionIdOrMongoId : undefined },
      ],
    });

    if (!transaction) throw new AppError("Borrow transaction not found", 404);
    if (transaction.status === BorrowTransactionStatus.RETURNED) {
      throw new AppError("This book has already been returned", 400);
    }

    const returnedAt = new Date();
    const isPastDue = returnedAt > transaction.dueDate;
    const daysOverdue = isPastDue
      ? Math.ceil((returnedAt.getTime() - transaction.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const fineAmount = daysOverdue * (transaction.finePerDay || 5);

    // 1. Update Transaction
    transaction.status = BorrowTransactionStatus.RETURNED;
    transaction.returnedAt = returnedAt;
    transaction.daysOverdue = daysOverdue;
    transaction.fineAmount = fineAmount;
    await transaction.save();

    // 2. Create Fine Record if Overdue
    let fineRecord = null;
    if (fineAmount > 0) {
      fineRecord = await Fine.create({
        fineId: `FIN-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: transaction.userId,
        studentName: transaction.userName,
        studentCollegeId: transaction.userCollegeId,
        studentEmail: transaction.userEmail,
        departmentId: transaction.departmentId,
        departmentName: transaction.userDepartmentName,
        bookId: transaction.bookId,
        bookTitle: transaction.bookTitle,
        bookCover: transaction.bookCover,
        borrowTransactionId: transaction._id,
        dueDate: transaction.dueDate,
        daysOverdue,
        dailyRate: transaction.finePerDay || 5,
        amount: fineAmount,
        status: FineStatus.PENDING,
      });

      await Notification.create({
        userId: transaction.userId,
        type: NotificationType.FINE_CREATED,
        uiType: "danger",
        title: "Fine Generated",
        message: `A fine of ₹${fineAmount} has been charged for "${transaction.bookTitle}" (${daysOverdue} days overdue).`,
        metadata: { fineId: fineRecord._id },
      });
    }

    // 3. Update Book Copy
    const copy = await BookCopy.findById(transaction.bookCopyId);
    let reservedForWaitlist = false;

    if (copy) {
      copy.condition = condition;
      copy.currentBorrowerId = undefined;
      copy.currentBorrowerName = undefined;
      copy.currentBorrowTransactionId = undefined;
      copy.dueDate = undefined;

      // 4. Process Next Eligible Waitlisted Requester (FIFO)
      const nextWaitlist = await WaitlistEntry.findOne({
        bookId: transaction.bookId,
        status: WaitlistStatus.WAITING,
      }).sort({ position: 1 });

      if (nextWaitlist) {
        copy.status = BookCopyStatus.RESERVED;
        reservedForWaitlist = true;

        nextWaitlist.status = WaitlistStatus.OFFERED;
        nextWaitlist.offeredAt = new Date();
        nextWaitlist.offerExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h to collect
        nextWaitlist.reservedCopyId = copy._id;
        await nextWaitlist.save();

        await Notification.create({
          userId: nextWaitlist.userId,
          type: NotificationType.WAITLIST_AVAILABLE,
          uiType: "success",
          title: "Waitlisted Book is Now Available!",
          message: `Good news! "${transaction.bookTitle}" is now ready for you at ${copy.libraryName}. Please collect it within 2 days.`,
          metadata: { waitlistId: nextWaitlist._id, bookId: transaction.bookId },
        });
      } else {
        copy.status = BookCopyStatus.AVAILABLE;
        await Book.findByIdAndUpdate(transaction.bookId, {
          $inc: { availableCopies: 1 },
        });
      }

      await copy.save();
    }

    // 5. Create Return Transaction Log
    const returnTxn = await ReturnTransaction.create({
      returnId: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
      borrowTransactionId: transaction._id,
      studentId: transaction.userId,
      studentName: transaction.userName,
      studentCollegeId: transaction.userCollegeId,
      studentDepartmentName: transaction.userDepartmentName,
      bookId: transaction.bookId,
      bookTitle: transaction.bookTitle,
      bookAuthor: transaction.bookAuthor,
      bookCopyId: transaction.bookCopyId,
      copyCode: transaction.copyCode,
      borrowedDate: transaction.issuedAt,
      dueDate: transaction.dueDate,
      returnedDate: returnedAt,
      daysOverdue,
      fineAssessed: fineAmount,
      condition,
      returnedToLibraryName: transaction.libraryName,
      processedByLibrarianName: librarianName,
      processedByLibrarianId: librarianId ? new Types.ObjectId(librarianId) : undefined,
      notes,
    });

    // 6. Audit Log
    await AuditLog.create({
      actorName: librarianName,
      actorRole: "LIBRARIAN",
      action: AuditAction.BOOK_RETURNED,
      resourceType: "BookCopy",
      resourceId: transaction.copyCode,
      departmentName: transaction.userDepartmentName,
      details: `Returned copy ${transaction.copyCode} of "${transaction.bookTitle}" from ${transaction.userName}. Fine: ₹${fineAmount}. Condition: ${condition}`,
    });

    return {
      success: true,
      message: fineAmount > 0
        ? `Book returned successfully. Fine of ₹${fineAmount} has been applied for ${daysOverdue} days overdue.`
        : "Book returned successfully on time with zero fine.",
      returnRecord: returnTxn,
      fineRecord,
      reservedForWaitlist,
    };
  }
}

export const returnService = new ReturnService();
