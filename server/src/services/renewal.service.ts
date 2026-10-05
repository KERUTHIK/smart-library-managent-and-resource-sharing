import { Types } from "mongoose";
import { RenewalRequest, IRenewalRequest } from "../models/RenewalRequest.js";
import { BorrowTransaction } from "../models/BorrowTransaction.js";
import { WaitlistEntry } from "../models/WaitlistEntry.js";
import { Fine } from "../models/Fine.js";
import { Notification } from "../models/Notification.js";
import { AuditLog } from "../models/AuditLog.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  RenewalStatus,
  BorrowTransactionStatus,
  FineStatus,
  WaitlistStatus,
  NotificationType,
  AuditAction,
} from "../constants/index.js";

export class RenewalService {
  /**
   * Student requests a book renewal
   */
  async requestRenewal(userId: string, borrowTransactionId: string, reason?: string) {
    const transaction = await BorrowTransaction.findOne({
      _id: borrowTransactionId,
      userId: new Types.ObjectId(userId),
      status: BorrowTransactionStatus.ACTIVE,
    });

    if (!transaction) {
      throw new AppError("Active borrow record not found", 404);
    }

    // Check maximum renewal limit (2 renewals allowed)
    if (transaction.renewalCount >= transaction.maxRenewals) {
      throw new AppError(
        `Renewal limit reached. This book has already been renewed ${transaction.renewalCount} time(s) (maximum allowed: ${transaction.maxRenewals}).`,
        400
      );
    }

    // Check unpaid fines for user
    const pendingFines = await Fine.countDocuments({
      userId: new Types.ObjectId(userId),
      status: FineStatus.UNPAID,
    });
    if (pendingFines > 0) {
      throw new AppError(
        "Cannot renew book while you have outstanding unpaid fines. Please clear fines first.",
        400
      );
    }

    // Check if there is an active waitlist for this book
    const waitlistCount = await WaitlistEntry.countDocuments({
      bookId: transaction.bookId,
      status: WaitlistStatus.WAITING,
    });
    if (waitlistCount > 0) {
      throw new AppError(
        "Renewal unavailable: Other students are currently waiting in the queue for this book.",
        400
      );
    }

    // Check if a renewal request is already pending
    const existingPending = await RenewalRequest.findOne({
      borrowTransactionId: transaction._id,
      status: RenewalStatus.RENEWAL_REQUESTED,
    });
    if (existingPending) {
      throw new AppError("A renewal request for this book is already pending approval.", 400);
    }

    // Calculate proposed new due date (+14 days from current due date)
    const newDueDate = new Date(transaction.dueDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    const renewal = await RenewalRequest.create({
      borrowTransactionId: transaction._id,
      userId: transaction.userId,
      bookId: transaction.bookId,
      bookTitle: transaction.bookTitle,
      requestedAt: new Date(),
      currentDueDate: transaction.dueDate,
      newProposedDueDate: newDueDate,
      status: RenewalStatus.RENEWAL_REQUESTED,
      reason: reason || "Standard renewal extension requested",
    });

    return {
      message: "Renewal request submitted successfully. Awaiting librarian approval.",
      renewal: {
        id: renewal._id.toString(),
        bookTitle: renewal.bookTitle,
        currentDueDate: renewal.currentDueDate,
        newProposedDueDate: renewal.newProposedDueDate,
        status: renewal.status,
      },
    };
  }

  /**
   * Librarian lists renewal requests
   */
  async listRenewals(filter: { departmentId?: string; status?: string } = {}) {
    const query: any = {};
    if (filter.status && filter.status !== "ALL") {
      query.status = filter.status;
    }

    const renewals = await RenewalRequest.find(query)
      .populate("userId", "name collegeId email departmentName")
      .populate("borrowTransactionId", "copyCode shelfLocation dueDate renewalCount")
      .sort({ createdAt: -1 })
      .lean();

    return renewals.map((r: any) => ({
      id: r._id.toString(),
      borrowTransactionId: r.borrowTransactionId?._id?.toString(),
      bookTitle: r.bookTitle,
      studentName: r.userId?.name || "Unknown Student",
      studentCollegeId: r.userId?.collegeId || "N/A",
      studentDepartment: r.userId?.departmentName || "N/A",
      currentDueDate: r.currentDueDate,
      newProposedDueDate: r.newProposedDueDate,
      renewalCount: r.borrowTransactionId?.renewalCount ?? 0,
      copyCode: r.borrowTransactionId?.copyCode || "N/A",
      status: r.status,
      reason: r.reason,
      createdAt: r.createdAt,
    }));
  }

  /**
   * Process a renewal request (Approve or Reject)
   */
  async processRenewal(
    renewalId: string,
    approved: boolean,
    librarianUserId: string,
    reason?: string
  ) {
    const renewal = await RenewalRequest.findById(renewalId);
    if (!renewal) {
      throw new AppError("Renewal request not found", 404);
    }

    if (renewal.status !== RenewalStatus.RENEWAL_REQUESTED) {
      throw new AppError(`Renewal request is already ${renewal.status.toLowerCase()}`, 400);
    }

    const transaction = await BorrowTransaction.findById(renewal.borrowTransactionId);
    if (!transaction) {
      throw new AppError("Associated borrow transaction not found", 404);
    }

    if (approved) {
      renewal.status = RenewalStatus.APPROVED;
      renewal.processedBy = new Types.ObjectId(librarianUserId);
      renewal.processedAt = new Date();
      await renewal.save();

      // Update borrow transaction due date and renewal count
      transaction.dueDate = renewal.newProposedDueDate;
      transaction.renewalCount += 1;
      await transaction.save();

      // Notify student
      await Notification.create({
        userId: transaction.userId,
        title: "Book Renewal Approved",
        message: `Your renewal request for "${transaction.bookTitle}" has been approved. New due date is ${transaction.dueDate.toLocaleDateString("en-GB")}.`,
        type: NotificationType.SUCCESS,
        isRead: false,
      });

      // Audit Log
      await AuditLog.create({
        action: AuditAction.RENEW_BOOK,
        actorId: librarianUserId,
        actorType: "Librarian",
        entityType: "BorrowTransaction",
        entityId: transaction._id.toString(),
        details: {
          renewalId: renewal._id.toString(),
          newDueDate: transaction.dueDate,
          renewalCount: transaction.renewalCount,
        },
      });

      return {
        message: `Renewal approved. Due date extended to ${transaction.dueDate.toLocaleDateString("en-GB")}.`,
        renewal,
      };
    } else {
      renewal.status = RenewalStatus.REJECTED;
      renewal.processedBy = new Types.ObjectId(librarianUserId);
      renewal.processedAt = new Date();
      renewal.reason = reason || "Renewal request declined by librarian.";
      await renewal.save();

      // Notify student
      await Notification.create({
        userId: transaction.userId,
        title: "Book Renewal Declined",
        message: `Your renewal request for "${transaction.bookTitle}" was declined: ${renewal.reason}`,
        type: NotificationType.WARNING,
        isRead: false,
      });

      return {
        message: "Renewal request declined.",
        renewal,
      };
    }
  }
}

export const renewalService = new RenewalService();
