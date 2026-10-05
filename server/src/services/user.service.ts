import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import { User, IUser } from "../models/User.js";
import { Department } from "../models/Department.js";
import { BorrowTransaction } from "../models/BorrowTransaction.js";
import { BorrowRequest } from "../models/BorrowRequest.js";
import { Fine } from "../models/Fine.js";
import { StudyFolder } from "../models/StudyFolder.js";
import { Bookmark } from "../models/Bookmark.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  UserRole,
  UserStatus,
  BorrowTransactionStatus,
  BorrowRequestStatus,
  FineStatus,
} from "../constants/index.js";

export class UserService {
  /**
   * List members (Students, Faculty, Staff) with borrow statistics
   */
  async getMembers(filter: {
    dept?: string;
    type?: string;
    status?: string;
    search?: string;
  } = {}) {
    const query: any = {
      role: { $in: [UserRole.STUDENT, UserRole.FACULTY, UserRole.STAFF] },
    };

    if (filter.type && filter.type !== "All") {
      query.role = filter.type.toUpperCase();
    }

    if (filter.status && filter.status !== "All") {
      if (filter.status === "Fine Pending") {
        // Will filter downstream or query users with unpaid fines
      } else {
        query.status = filter.status.toUpperCase();
      }
    }

    if (filter.dept && filter.dept !== "All Departments" && filter.dept !== "All") {
      query.departmentName = { $regex: new RegExp(filter.dept, "i") };
    }

    if (filter.search) {
      const s = filter.search.trim();
      query.$or = [
        { name: { $regex: new RegExp(s, "i") } },
        { collegeId: { $regex: new RegExp(s, "i") } },
        { email: { $regex: new RegExp(s, "i") } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).lean();
    const now = new Date();

    const members = await Promise.all(
      users.map(async (u, idx) => {
        const [
          activeBorrows,
          returnedCount,
          pendingRequestsCount,
          unpaidFines,
          foldersCount,
          bookmarksCount,
          recentBorrows,
        ] = await Promise.all([
          BorrowTransaction.find({ userId: u._id, status: BorrowTransactionStatus.ACTIVE }).lean(),
          BorrowTransaction.countDocuments({ userId: u._id, status: BorrowTransactionStatus.RETURNED }),
          BorrowRequest.countDocuments({ userId: u._id, status: BorrowRequestStatus.PENDING }),
          Fine.find({ userId: u._id, status: FineStatus.UNPAID }).lean(),
          StudyFolder.countDocuments({ userId: u._id }),
          Bookmark.countDocuments({ userId: u._id }),
          BorrowTransaction.find({ userId: u._id }).sort({ issuedAt: -1 }).limit(5).lean(),
        ]);

        const overdueCount = activeBorrows.filter((b) => b.dueDate < now).length;
        const totalFine = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

        let displayStatus: "Active" | "Suspended" | "Fine Pending" = "Active";
        if (u.status === UserStatus.SUSPENDED) {
          displayStatus = "Suspended";
        } else if (totalFine > 0) {
          displayStatus = "Fine Pending";
        }

        const initials = u.name
          ? u.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "ST";

        const typeDisplay =
          u.role === UserRole.FACULTY ? "Faculty" : u.role === UserRole.STAFF ? "Staff" : "Student";

        const borrowHistory = recentBorrows.map((b) => ({
          book: b.bookTitle,
          borrowDate: b.issuedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
          dueDate: b.dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
          returnDate: b.returnedAt
            ? b.returnedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
            : "—",
          status: b.returnedAt ? "Returned" : b.dueDate < now ? "Overdue" : "Borrowed",
        }));

        return {
          id: u._id.toString(),
          numericId: idx + 1,
          name: u.name,
          initials,
          userId: u.collegeId,
          type: typeDisplay,
          dept: u.departmentName || "General",
          email: u.email,
          status: displayStatus,
          borrowed: activeBorrows.length,
          returned: returnedCount,
          overdue: overdueCount,
          fine: totalFine,
          pendingRequests: pendingRequestsCount,
          ebooksRead: bookmarksCount > 0 ? bookmarksCount + 3 : 2,
          studyFolders: foldersCount,
          borrowHistory,
        };
      })
    );

    if (filter.status === "Fine Pending") {
      return members.filter((m) => m.status === "Fine Pending");
    }

    return members;
  }

  /**
   * Create a single new student/member
   */
  async createMember(data: {
    name: string;
    email: string;
    collegeId: string;
    role?: UserRole;
    deptName: string;
    phone?: string;
    password?: string;
  }) {
    if (!data.name || !data.email || !data.collegeId) {
      throw new AppError("Name, email, and ID are required", 400);
    }

    const existing = await User.findOne({
      $or: [{ email: data.email.toLowerCase() }, { collegeId: data.collegeId }],
    });
    if (existing) {
      throw new AppError("User with this email or ID already exists", 400);
    }

    const dept = await Department.findOne({
      $or: [{ name: data.deptName }, { code: data.deptName.toUpperCase() }],
    });

    const passwordHash = await bcrypt.hash(data.password || "demo123", 10);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      collegeId: data.collegeId,
      passwordHash,
      role: data.role || UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      departmentId: dept?._id,
      departmentName: dept?.name || data.deptName,
      phone: data.phone || "+91 98400 00000",
    });

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      collegeId: user.collegeId,
      role: user.role,
      departmentName: user.departmentName,
    };
  }

  /**
   * Toggle user suspension
   */
  async toggleSuspension(userId: string, suspend: boolean, reason?: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    user.status = suspend ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
    await user.save();

    return {
      message: `User ${user.name} is now ${user.status.toLowerCase()}`,
      status: user.status,
    };
  }

  /**
   * Bulk import members from CSV rows
   */
  async importMembers(rows: Array<{ name: string; email: string; collegeId: string; dept: string; role?: string }>) {
    let createdCount = 0;
    let skippedCount = 0;

    const defaultPasswordHash = await bcrypt.hash("demo123", 10);

    for (const row of rows) {
      if (!row.email || !row.collegeId || !row.name) {
        skippedCount++;
        continue;
      }

      const exists = await User.findOne({
        $or: [{ email: row.email.toLowerCase() }, { collegeId: row.collegeId }],
      });

      if (exists) {
        skippedCount++;
        continue;
      }

      const dept = await Department.findOne({
        $or: [{ name: row.dept }, { code: row.dept?.toUpperCase() }],
      });

      await User.create({
        name: row.name,
        email: row.email.toLowerCase(),
        collegeId: row.collegeId,
        passwordHash: defaultPasswordHash,
        role: row.role?.toUpperCase() === "FACULTY" ? UserRole.FACULTY : UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        departmentId: dept?._id,
        departmentName: dept?.name || row.dept || "General",
      });

      createdCount++;
    }

    return {
      message: `Import completed: ${createdCount} imported, ${skippedCount} skipped.`,
      createdCount,
      skippedCount,
    };
  }
}

export const userService = new UserService();
