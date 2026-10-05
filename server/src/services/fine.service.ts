import { Fine, IFine } from "../models/Fine.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";
import { FineStatus, AuditAction } from "../constants/index.js";
import { AuditLog } from "../models/AuditLog.js";
import { paymentService } from "../integrations/payments/PaymentService.js";
import { PaymentMethod } from "../constants/index.js";

export class FineService {
  async getMyFines(userId: string) {
    const fines = await Fine.find({ userId }).sort({ createdAt: -1 }).lean();
    return fines.map((f) => ({
      id: f._id.toString(),
      fineId: f.fineId,
      book: f.bookTitle,
      cover: f.bookCover || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=60&h=80&fit=crop",
      dueDate: f.dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      daysOverdue: f.daysOverdue,
      fine: f.amount,
      status: f.status.toLowerCase(),
      paidDate: f.paidDate ? f.paidDate.toLocaleDateString("en-GB") : undefined,
    }));
  }

  async getMyPaymentHistory(userId: string) {
    const payments = await Payment.find({ userId }).sort({ paidAt: -1 }).lean();
    return payments.map((p) => ({
      book: p.bookTitle || "Library Fine",
      amount: p.amount,
      date: p.paidAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      method: p.method,
      txn: p.transactionId,
      status: "Paid",
    }));
  }

  async getDepartmentFines(departmentName?: string, statusFilter?: string) {
    const query: any = {};
    if (departmentName && departmentName !== "All" && departmentName !== "All Departments") {
      query.departmentName = { $regex: new RegExp(departmentName, "i") };
    }
    if (statusFilter && statusFilter !== "All") {
      query.status = statusFilter;
    }

    const fines = await Fine.find(query).sort({ createdAt: -1 }).lean();

    return fines.map((f) => ({
      id: f.fineId,
      mongoId: f._id.toString(),
      student: f.studentName,
      userId: f.studentCollegeId,
      book: f.bookTitle,
      dueDate: f.dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      daysOverdue: f.daysOverdue,
      amount: f.amount,
      status: f.status,
      payDate: f.paidDate ? f.paidDate.toLocaleDateString("en-GB") : null,
    }));
  }

  async getAdminFines(statusFilter?: string, deptFilter?: string, search?: string) {
    const query: any = {};
    if (statusFilter && statusFilter !== "All") {
      query.status = statusFilter;
    }
    if (deptFilter && deptFilter !== "All" && deptFilter !== "All Departments") {
      query.departmentName = { $regex: new RegExp(deptFilter, "i") };
    }
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { fineId: { $regex: search, $options: "i" } },
        { bookTitle: { $regex: search, $options: "i" } },
        { studentCollegeId: { $regex: search, $options: "i" } },
      ];
    }

    const fines = await Fine.find(query).sort({ createdAt: -1 }).lean();

    return fines.map((f) => ({
      id: f.fineId,
      mongoId: f._id.toString(),
      student: f.studentName,
      userId: f.studentCollegeId,
      dept: f.departmentName,
      book: f.bookTitle,
      dueDate: f.dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      daysOverdue: f.daysOverdue,
      amount: f.amount,
      status: f.status,
      payDate: f.paidDate ? f.paidDate.toLocaleDateString("en-GB") : null,
      method: f.paymentMethod || null,
    }));
  }

  async waiveFine(fineId: string, reason: string, actorName: string = "Admin") {
    const fine = await Fine.findOne({ $or: [{ fineId }, { _id: fineId.length === 24 ? fineId : undefined }] });
    if (!fine) throw new AppError("Fine record not found", 404);

    fine.status = FineStatus.WAIVED;
    fine.waivedByName = actorName;
    fine.waiverReason = reason || "Administrative Waiver";
    await fine.save();

    await AuditLog.create({
      actorName,
      actorRole: "ADMIN",
      action: AuditAction.FINE_WAIVED,
      resourceType: "Fine",
      resourceId: fine.fineId,
      departmentName: fine.departmentName,
      details: `Waived fine ${fine.fineId} (₹${fine.amount}) for ${fine.studentName}. Reason: ${fine.waiverReason}`,
    });

    return fine;
  }

  async cancelFine(fineId: string, reason: string, actorName: string = "Admin") {
    const fine = await Fine.findOne({ $or: [{ fineId }, { _id: fineId.length === 24 ? fineId : undefined }] });
    if (!fine) throw new AppError("Fine record not found", 404);

    fine.status = FineStatus.CANCELLED;
    fine.waiverReason = reason || "Cancelled by library administration";
    await fine.save();

    await AuditLog.create({
      actorName,
      actorRole: "ADMIN",
      action: AuditAction.FINE_CANCELLED,
      resourceType: "Fine",
      resourceId: fine.fineId,
      departmentName: fine.departmentName,
      details: `Cancelled fine ${fine.fineId} (₹${fine.amount}) for ${fine.studentName}. Reason: ${fine.waiverReason}`,
    });

    return fine;
  }

  async paySingleFine(fineIdOrMongoId: string, method: PaymentMethod, user: any) {
    const fine = await Fine.findOne({
      $or: [
        { _id: fineIdOrMongoId.length === 24 ? fineIdOrMongoId : undefined },
        { fineId: fineIdOrMongoId },
      ],
    });
    if (!fine) throw new AppError("Fine not found", 404);
    if (fine.status === FineStatus.PAID) throw new AppError("This fine is already paid", 400);

    const paymentResult = await paymentService.processPayment({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      amount: fine.amount,
      method,
      bookTitle: fine.bookTitle,
      fineId: fine._id.toString(),
    });

    fine.status = FineStatus.PAID;
    fine.paidDate = paymentResult.paidAt;
    fine.paymentMethod = method;
    fine.paymentTransactionId = paymentResult.transactionId;
    await fine.save();

    const payment = await Payment.create({
      transactionId: paymentResult.transactionId,
      fineId: fine._id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      bookTitle: fine.bookTitle,
      amount: fine.amount,
      method,
      providerTxnId: paymentResult.providerTxnId,
      paidAt: paymentResult.paidAt,
    });

    await AuditLog.create({
      actorName: user.name,
      actorRole: user.role,
      action: AuditAction.FINE_PAID,
      resourceType: "Fine",
      resourceId: fine.fineId,
      details: `Paid fine ${fine.fineId} of ₹${fine.amount} via ${method} (Txn: ${paymentResult.transactionId})`,
    });

    return {
      success: true,
      transactionId: paymentResult.transactionId,
      amount: fine.amount,
      fineId: fine.fineId,
      book: fine.bookTitle,
      method,
      paidAt: paymentResult.paidAt,
      payment,
    };
  }

  async payAllFines(userId: string, method: PaymentMethod, user: any) {
    const unpaidFines = await Fine.find({ userId, status: { $in: [FineStatus.PENDING, FineStatus.OVERDUE] } });
    if (unpaidFines.length === 0) {
      throw new AppError("No pending fines to pay", 400);
    }

    const totalAmount = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

    const paymentResult = await paymentService.processPayment({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      amount: totalAmount,
      method,
      fineIds: unpaidFines.map((f) => f._id.toString()),
    });

    const now = new Date();
    await Fine.updateMany(
      { _id: { $in: unpaidFines.map((f) => f._id) } },
      {
        $set: {
          status: FineStatus.PAID,
          paidDate: now,
          paymentMethod: method,
          paymentTransactionId: paymentResult.transactionId,
        },
      }
    );

    const payment = await Payment.create({
      transactionId: paymentResult.transactionId,
      fineIds: unpaidFines.map((f) => f._id),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      bookTitle: `Consolidated Payment (${unpaidFines.length} fines)`,
      amount: totalAmount,
      method,
      providerTxnId: paymentResult.providerTxnId,
      paidAt: now,
    });

    return {
      success: true,
      transactionId: paymentResult.transactionId,
      totalAmount,
      paidFinesCount: unpaidFines.length,
      method,
      paidAt: now,
      payment,
    };
  }

  async getAllFines(filter: { status?: string; department?: string; search?: string } = {}) {
    return this.getAdminFines(filter.status, filter.department, filter.search);
  }

  async payFine(data: { fineId?: string; method?: PaymentMethod }, userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    const method = data.method || PaymentMethod.UPI;

    if (data.fineId && data.fineId !== "ALL") {
      return this.paySingleFine(data.fineId, method, user);
    } else {
      return this.payAllFines(userId, method, user);
    }
  }
}

export const fineService = new FineService();
