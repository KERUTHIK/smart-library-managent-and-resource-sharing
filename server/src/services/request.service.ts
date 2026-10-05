import { Types } from "mongoose";
import { Book } from "../models/Book.js";
import { BookCopy } from "../models/BookCopy.js";
import { Library } from "../models/Library.js";
import { User } from "../models/User.js";
import { BorrowRequest, IBorrowRequest } from "../models/BorrowRequest.js";
import { TransferRequest } from "../models/TransferRequest.js";
import { WaitlistEntry } from "../models/WaitlistEntry.js";
import { BorrowTransaction } from "../models/BorrowTransaction.js";
import { Notification } from "../models/Notification.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  BorrowRequestStatus,
  BorrowTransactionStatus,
  BookCopyStatus,
  TransferStatus,
  WaitlistStatus,
  LibraryType,
  NotificationType,
  AuditAction,
} from "../constants/index.js";
import { AuditLog } from "../models/AuditLog.js";

export class RequestService {
  /**
   * Evaluates student's book request against Section 18 institutional rules.
   */
  async createBorrowRequest(userId: string, bookId: string, preferredPickupLibraryName?: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const book = await Book.findById(bookId);
    if (!book) throw new AppError("Book not found", 404);

    const requestId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    // Resolve user's own department library
    const userDeptLibrary = await Library.findOne({ departmentId: user.departmentId });
    // Resolve Central/Main Library
    const centralLibrary = await Library.findOne({ type: LibraryType.CENTRAL }) ||
      await Library.findOne({ name: { $regex: /central|main/i } });

    // Determine pickup library
    let pickupLibrary = userDeptLibrary;
    if (preferredPickupLibraryName) {
      const preferred = await Library.findOne({
        name: { $regex: new RegExp(preferredPickupLibraryName, "i") },
      });
      if (preferred) pickupLibrary = preferred;
    }
    if (!pickupLibrary) {
      pickupLibrary = (await Library.findOne())!;
    }

    // ── STEP 1: Check user's own department library ────────────────────────────
    if (userDeptLibrary) {
      const localCopy = await BookCopy.findOne({
        bookId: book._id,
        libraryId: userDeptLibrary._id,
        status: BookCopyStatus.AVAILABLE,
      });

      if (localCopy) {
        // AUTO APPROVE
        localCopy.status = BookCopyStatus.RESERVED;
        await localCopy.save();

        book.availableCopies = Math.max(0, book.availableCopies - 1);
        await book.save();

        const req = await BorrowRequest.create({
          requestId,
          studentId: user._id,
          studentName: user.name,
          studentCollegeId: user.collegeId,
          studentDepartmentId: user.departmentId,
          studentDepartmentName: user.departmentName || "General",
          bookId: book._id,
          bookTitle: book.title,
          sourceLibraryId: userDeptLibrary._id,
          sourceLibraryName: userDeptLibrary.name,
          pickupLibraryId: pickupLibrary._id,
          pickupLibraryName: pickupLibrary.name,
          status: BorrowRequestStatus.AUTO_APPROVED,
          availabilityNote: `Available — ${userDeptLibrary.name}`,
          aiRecommendation: {
            action: "AUTO_APPROVED",
            reason: "Available in student's department library. Auto-approved without librarian intervention.",
          },
          approvedAt: new Date(),
        });

        // Notify Student
        await Notification.create({
          userId: user._id,
          type: NotificationType.REQUEST_APPROVED,
          uiType: "success",
          title: "Book Request Auto-Approved",
          message: `Your request for "${book.title}" was instantly auto-approved. Available for pickup at ${pickupLibrary.name}.`,
          metadata: { requestId: req._id, bookId: book._id },
        });

        return {
          status: BorrowRequestStatus.AUTO_APPROVED,
          message: "Request auto-approved! Book is available in your department library for pickup.",
          request: req,
        };
      }
    }

    // ── STEP 2: Check Central / Main Library ────────────────────────────────────
    if (centralLibrary && (!userDeptLibrary || !centralLibrary._id.equals(userDeptLibrary._id))) {
      const centralCopy = await BookCopy.findOne({
        bookId: book._id,
        libraryId: centralLibrary._id,
        status: BookCopyStatus.AVAILABLE,
      });

      if (centralCopy) {
        // AUTO APPROVE
        centralCopy.status = BookCopyStatus.RESERVED;
        await centralCopy.save();

        book.availableCopies = Math.max(0, book.availableCopies - 1);
        await book.save();

        const req = await BorrowRequest.create({
          requestId,
          studentId: user._id,
          studentName: user.name,
          studentCollegeId: user.collegeId,
          studentDepartmentId: user.departmentId,
          studentDepartmentName: user.departmentName || "General",
          bookId: book._id,
          bookTitle: book.title,
          sourceLibraryId: centralLibrary._id,
          sourceLibraryName: centralLibrary.name,
          pickupLibraryId: pickupLibrary._id,
          pickupLibraryName: pickupLibrary.name,
          status: BorrowRequestStatus.AUTO_APPROVED,
          availabilityNote: `Available — ${centralLibrary.name}`,
          aiRecommendation: {
            action: "AUTO_APPROVED",
            reason: "Available in Central Library. Auto-approved per institutional policy.",
          },
          approvedAt: new Date(),
        });

        await Notification.create({
          userId: user._id,
          type: NotificationType.REQUEST_APPROVED,
          uiType: "success",
          title: "Book Request Auto-Approved",
          message: `Your request for "${book.title}" was auto-approved via Central Library. Pickup at ${pickupLibrary.name}.`,
          metadata: { requestId: req._id, bookId: book._id },
        });

        return {
          status: BorrowRequestStatus.AUTO_APPROVED,
          message: "Request auto-approved! Book is available in Central Library for pickup.",
          request: req,
        };
      }
    }

    // ── STEP 3: Check Other Department Libraries (Inter-department Transfer) ────
    const otherAvailableCopy = await BookCopy.findOne({
      bookId: book._id,
      status: BookCopyStatus.AVAILABLE,
    });

    if (otherAvailableCopy) {
      // Mark copy reserved for transfer
      otherAvailableCopy.status = BookCopyStatus.RESERVED;
      await otherAvailableCopy.save();

      book.availableCopies = Math.max(0, book.availableCopies - 1);
      await book.save();

      const transferId = `TRF-${Math.floor(1000 + Math.random() * 9000)}`;

      const req = await BorrowRequest.create({
        requestId,
        studentId: user._id,
        studentName: user.name,
        studentCollegeId: user.collegeId,
        studentDepartmentId: user.departmentId,
        studentDepartmentName: user.departmentName || "General",
        bookId: book._id,
        bookTitle: book.title,
        sourceLibraryId: otherAvailableCopy.libraryId,
        sourceLibraryName: otherAvailableCopy.libraryName,
        pickupLibraryId: pickupLibrary._id,
        pickupLibraryName: pickupLibrary.name,
        status: BorrowRequestStatus.TRANSFER_REQUIRED,
        availabilityNote: `Available — ${otherAvailableCopy.libraryName}`,
        aiRecommendation: {
          action: "APPROVE TRANSFER",
          reason: `Book unavailable locally but available in ${otherAvailableCopy.libraryName}. Transfer required.`,
        },
      });

      // Create Transfer Request record with step pipeline
      const transfer = await TransferRequest.create({
        transferId,
        borrowRequestId: req._id,
        bookId: book._id,
        bookTitle: book.title,
        bookCopyId: otherAvailableCopy._id,
        copyCode: otherAvailableCopy.copyCode,
        studentId: user._id,
        studentName: user.name,
        studentDept: user.departmentName || "General",
        sourceDepartmentId: otherAvailableCopy.departmentId,
        sourceDepartmentName: otherAvailableCopy.departmentName,
        sourceLibraryId: otherAvailableCopy.libraryId,
        sourceLibraryName: otherAvailableCopy.libraryName,
        targetDepartmentId: user.departmentId || otherAvailableCopy.departmentId,
        targetDepartmentName: user.departmentName || "General",
        targetLibraryId: pickupLibrary._id,
        targetLibraryName: pickupLibrary.name,
        status: TransferStatus.SOURCE_LIBRARIAN_NOTIFIED,
        statusLabel: "Transfer Pending",
        steps: [
          { label: "Request received", done: true },
          { label: "Request approved", done: true },
          { label: `${otherAvailableCopy.libraryName} notified`, done: true },
          { label: "Book transfer pending", done: false, active: true },
          { label: `Received by ${pickupLibrary.name}`, done: false },
          { label: "Ready for student pickup", done: false },
          { label: "Issued to student", done: false },
        ],
      });

      // Notify source librarian & student
      await Notification.create({
        userId: user._id,
        type: NotificationType.TRANSFER_REQUESTED,
        uiType: "warning",
        title: "Inter-Department Transfer Initiated",
        message: `Your request for "${book.title}" requires a transfer from ${otherAvailableCopy.libraryName}. We have notified the librarian.`,
        metadata: { transferId: transfer._id },
      });

      return {
        status: BorrowRequestStatus.TRANSFER_REQUIRED,
        message: `Transfer required from ${otherAvailableCopy.libraryName}. Transfer request #${transferId} created.`,
        request: req,
        transfer,
      };
    }

    // ── STEP 4: No Copies Available Anywhere -> DYNAMIC WAITLIST ────────────────
    // Compute estimated availability from earliest active dueDate among current borrowers
    const earliestBorrow = await BorrowTransaction.findOne({
      bookId: book._id,
      returnedAt: { $exists: false },
    }).sort({ dueDate: 1 });

    const estimatedDate = earliestBorrow
      ? earliestBorrow.dueDate
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const waitlistCount = await WaitlistEntry.countDocuments({
      bookId: book._id,
      status: WaitlistStatus.WAITING,
    });

    const waitlistEntry = await WaitlistEntry.create({
      bookId: book._id,
      bookTitle: book.title,
      userId: user._id,
      userName: user.name,
      userCollegeId: user.collegeId,
      userDept: user.departmentName || "General",
      priority: "Normal",
      position: waitlistCount + 1,
      status: WaitlistStatus.WAITING,
      estimatedAvailableDate: estimatedDate,
      requestDate: new Date(),
    });

    const dateFormatted = estimatedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const req = await BorrowRequest.create({
      requestId,
      studentId: user._id,
      studentName: user.name,
      studentCollegeId: user.collegeId,
      studentDepartmentId: user.departmentId,
      studentDepartmentName: user.departmentName || "General",
      bookId: book._id,
      bookTitle: book.title,
      pickupLibraryId: pickupLibrary._id,
      pickupLibraryName: pickupLibrary.name,
      status: BorrowRequestStatus.WAITLISTED,
      availabilityNote: `Currently Issued — Due ${dateFormatted}`,
      estimatedAvailableDate: estimatedDate,
      aiRecommendation: {
        action: "WAITLIST",
        reason: `All copies currently issued across the institution. Earliest expected return is on ${dateFormatted}.`,
      },
    });

    await Notification.create({
      userId: user._id,
      type: NotificationType.BOOK_REQUEST,
      uiType: "info",
      title: "Added to Book Waitlist",
      message: `All copies of "${book.title}" are currently issued. You are #${waitlistEntry.position} on the waitlist. Estimated availability: ${dateFormatted}.`,
      metadata: { requestId: req._id, waitlistId: waitlistEntry._id },
    });

    return {
      status: BorrowRequestStatus.WAITLISTED,
      message: `All copies are issued. You have been added to the waitlist (Position #${waitlistEntry.position}). Earliest estimated availability: ${dateFormatted}.`,
      request: req,
      waitlistEntry,
    };
  }

  async getLibrarianRequests(departmentId?: string) {
    const filter: any = {
      status: {
        $in: [
          BorrowRequestStatus.PENDING,
          BorrowRequestStatus.TRANSFER_REQUIRED,
          BorrowRequestStatus.APPROVED,
          BorrowRequestStatus.WAITLISTED,
        ],
      },
    };

    if (departmentId) {
      filter.$or = [
        { studentDepartmentId: departmentId },
        { sourceLibraryId: departmentId },
      ];
    }

    const requests = await BorrowRequest.find(filter).sort({ createdAt: -1 }).lean();

    return requests.map((r) => ({
      id: r._id.toString(),
      requestId: r.requestId,
      student: r.studentName,
      studentId: r.studentCollegeId,
      book: r.bookTitle,
      requestDate: r.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      availability: r.availabilityNote,
      location: r.pickupLibraryName,
      status:
        r.status === BorrowRequestStatus.TRANSFER_REQUIRED
          ? "Transfer Required"
          : r.status === BorrowRequestStatus.AUTO_APPROVED
          ? "Approved"
          : r.status === BorrowRequestStatus.APPROVED
          ? "Approved"
          : r.status === BorrowRequestStatus.WAITLISTED
          ? "Waitlisted"
          : "Pending",
      statusColor:
        r.status === BorrowRequestStatus.AUTO_APPROVED || r.status === BorrowRequestStatus.APPROVED
          ? "success"
          : r.status === BorrowRequestStatus.TRANSFER_REQUIRED
          ? "warning"
          : r.status === BorrowRequestStatus.WAITLISTED
          ? "secondary"
          : "info",
      aiRecommendation: r.aiRecommendation,
    }));
  }

  async approveRequest(requestId: string, librarianName: string = "Librarian") {
    const req = await BorrowRequest.findById(requestId);
    if (!req) throw new AppError("Request not found", 404);

    req.status = BorrowRequestStatus.APPROVED;
    req.approvedAt = new Date();
    await req.save();

    await Notification.create({
      userId: req.studentId,
      type: NotificationType.REQUEST_APPROVED,
      uiType: "success",
      title: "Borrow Request Approved",
      message: `Your request for "${req.bookTitle}" has been approved by ${librarianName}. Ready for pickup at ${req.pickupLibraryName}.`,
    });

    return req;
  }

  async rejectRequest(requestId: string, reason: string = "Unavailable") {
    const req = await BorrowRequest.findById(requestId);
    if (!req) throw new AppError("Request not found", 404);

    req.status = BorrowRequestStatus.REJECTED;
    req.rejectedAt = new Date();
    req.rejectionReason = reason;
    await req.save();

    await Notification.create({
      userId: req.studentId,
      type: NotificationType.REQUEST_REJECTED,
      uiType: "danger",
      title: "Borrow Request Rejected",
      message: `Your request for "${req.bookTitle}" was rejected. Reason: ${reason}.`,
    });

    return req;
  }

  async getDepartmentRequests(departmentName?: string, status?: string) {
    const filter: any = {};
    if (departmentName && departmentName !== "All" && departmentName !== "All Departments") {
      filter.studentDepartmentName = { $regex: new RegExp(departmentName, "i") };
    }
    if (status && status !== "all") {
      if (status === "pending") filter.status = BorrowRequestStatus.PENDING;
      else if (status === "transfer") filter.status = BorrowRequestStatus.TRANSFER_REQUIRED;
      else if (status === "approved") filter.status = { $in: [BorrowRequestStatus.APPROVED, BorrowRequestStatus.AUTO_APPROVED] };
    }

    const requests = await BorrowRequest.find(filter).sort({ createdAt: -1 }).lean();
    return requests.map((r) => ({
      id: r._id.toString(),
      requestId: r.requestId,
      student: r.studentName,
      studentId: r.studentCollegeId,
      book: r.bookTitle,
      requestDate: r.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      availability: r.availabilityNote,
      location: r.pickupLibraryName,
      status:
        r.status === BorrowRequestStatus.TRANSFER_REQUIRED
          ? "Transfer Required"
          : r.status === BorrowRequestStatus.AUTO_APPROVED || r.status === BorrowRequestStatus.APPROVED
          ? "Approved"
          : r.status === BorrowRequestStatus.WAITLISTED
          ? "Waitlisted"
          : r.status === BorrowRequestStatus.REJECTED
          ? "Rejected"
          : "Pending",
      statusColor:
        r.status === BorrowRequestStatus.AUTO_APPROVED || r.status === BorrowRequestStatus.APPROVED
          ? "success"
          : r.status === BorrowRequestStatus.TRANSFER_REQUIRED
          ? "warning"
          : r.status === BorrowRequestStatus.WAITLISTED
          ? "secondary"
          : r.status === BorrowRequestStatus.REJECTED
          ? "danger"
          : "info",
      aiRecommendation: r.aiRecommendation,
    }));
  }

  async getMyRequests(userId: string) {
    const requests = await BorrowRequest.find({
      studentId: new Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return requests.map((r) => ({
      id: r._id.toString(),
      requestId: r.requestId,
      bookTitle: r.bookTitle,
      pickupLibraryName: r.pickupLibraryName,
      status: r.status,
      availabilityNote: r.availabilityNote,
      estimatedAvailableDate: r.estimatedAvailableDate,
      createdAt: r.createdAt,
    }));
  }

  async cancelRequest(requestId: string, userId: string) {
    const req = await BorrowRequest.findOne({
      _id: requestId,
      studentId: new Types.ObjectId(userId),
    });
    if (!req) throw new AppError("Borrow request not found", 404);

    req.status = BorrowRequestStatus.CANCELLED;
    await req.save();

    return { message: "Borrow request cancelled successfully" };
  }

  async issueBook(requestId: string, librarianUserId: string, copyId?: string) {
    const req = await BorrowRequest.findById(requestId);
    if (!req) throw new AppError("Borrow request not found", 404);

    const user = await User.findById(req.studentId);
    if (!user) throw new AppError("Student user not found", 404);

    const book = await Book.findById(req.bookId);
    if (!book) throw new AppError("Book not found", 404);

    let bookCopy;
    if (copyId) {
      bookCopy = await BookCopy.findById(copyId);
    } else {
      bookCopy = await BookCopy.findOne({
        bookId: book._id,
        status: { $in: [BookCopyStatus.AVAILABLE, BookCopyStatus.RESERVED] },
      });
    }

    if (!bookCopy) {
      throw new AppError("No available physical copy to issue", 400);
    }

    const issuedAt = new Date();
    const dueDate = new Date(Date.now() + (book.loanPeriodDays || 14) * 24 * 60 * 60 * 1000);

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
      departmentId: user.departmentId || bookCopy.departmentId,
      libraryId: bookCopy.libraryId,
      libraryName: bookCopy.libraryName,
      shelfLocation: bookCopy.shelfLocation,
      issuedAt,
      dueDate,
      status: BorrowTransactionStatus.ACTIVE,
      issuedBy: new Types.ObjectId(librarianUserId),
    });

    bookCopy.status = BookCopyStatus.BORROWED;
    bookCopy.currentBorrowerId = user._id;
    bookCopy.currentBorrowerName = user.name;
    bookCopy.currentBorrowTransactionId = transaction._id;
    bookCopy.dueDate = dueDate;
    await bookCopy.save();

    req.status = BorrowRequestStatus.FULFILLED;
    await req.save();

    await Notification.create({
      userId: user._id,
      type: NotificationType.BOOK_ISSUED,
      uiType: "success",
      title: "Book Issued",
      message: `"${book.title}" has been issued to you. Due date: ${dueDate.toLocaleDateString("en-GB")}.`,
      metadata: { transactionId: transaction._id },
    });

    return {
      message: `Book copy ${bookCopy.copyCode} issued to ${user.name}`,
      transaction,
    };
  }
}

export const requestService = new RequestService();
