import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { LibrarianProfile, ILibrarianProfile } from "../models/LibrarianProfile.js";
import { Department } from "../models/Department.js";
import { Library } from "../models/Library.js";
import { BorrowRequest } from "../models/BorrowRequest.js";
import { AppError } from "../middleware/errorHandler.js";
import { UserRole, UserStatus, BorrowRequestStatus } from "../constants/index.js";

export class LibrarianService {
  /**
   * Get all librarians with profiles and live pending request counts
   */
  async getLibrarians(deptFilter?: string) {
    const query: any = {};
    if (deptFilter && deptFilter !== "All Departments" && deptFilter !== "All") {
      const dept = await Department.findOne({
        name: { $regex: new RegExp(deptFilter, "i") },
      });
      if (dept) query.departmentId = dept._id;
    }

    const profiles = await LibrarianProfile.find(query)
      .populate("userId", "name email phone collegeId status avatar")
      .populate("departmentId", "name code")
      .populate("libraryId", "name code")
      .sort({ createdAt: -1 })
      .lean();

    const results = await Promise.all(
      profiles.map(async (p: any, idx) => {
        const user = p.userId;
        const dept = p.departmentId;
        const lib = p.libraryId;

        const pendingRequests = dept?._id
          ? await BorrowRequest.countDocuments({
              departmentId: dept._id,
              status: BorrowRequestStatus.PENDING,
            })
          : 0;

        const initials = user?.name
          ? user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "LB";

        return {
          id: p._id.toString(),
          numericId: idx + 1,
          userId: user?._id?.toString(),
          name: user?.name || "Library Staff",
          initials,
          empId: p.empId,
          dept: dept?.name || "General",
          deptId: dept?._id?.toString(),
          library: lib?.name || `${dept?.code || "Central"} Library`,
          email: user?.email || "librarian@libsync.edu",
          phone: user?.phone || "+91 98400 00000",
          joined: p.joined || "Jan 2022",
          experience: p.experience || "3 yrs",
          status: p.status || "Active",
          booksManaged: p.booksManaged || 1200,
          requestsProcessed: p.requestsProcessed || 450,
          transfersCompleted: p.transfersCompleted || 32,
          pendingRequests,
          fineActions: p.fineActions || 15,
          recentActivity:
            p.recentActivity && p.recentActivity.length > 0
              ? p.recentActivity
              : ["Processed recent borrow queue", "Updated department inventory"],
        };
      })
    );

    return results;
  }

  /**
   * Create a new librarian user and profile
   */
  async createLibrarian(data: {
    name: string;
    email: string;
    empId: string;
    phone?: string;
    deptNameOrId: string;
    status?: "Active" | "On Leave";
    password?: string;
  }) {
    if (!data.name || !data.email || !data.empId) {
      throw new AppError("Name, email, and employee ID are required", 400);
    }

    const existingUser = await User.findOne({
      $or: [{ email: data.email.toLowerCase() }, { collegeId: data.empId }],
    });
    if (existingUser) {
      throw new AppError("User with this email or employee ID already exists", 400);
    }

    // Resolve department
    let department = await Department.findOne({
      $or: [{ _id: Types.ObjectId.isValid(data.deptNameOrId) ? data.deptNameOrId : null }, { name: data.deptNameOrId }],
    });

    if (!department) {
      department = await Department.findOne(); // fallback to first department
      if (!department) throw new AppError("No departments found in system", 400);
    }

    let library = await Library.findOne({ departmentId: department._id });
    if (!library) {
      library = await Library.findOne();
      if (!library) throw new AppError("No libraries found in system", 400);
    }

    const passwordHash = await bcrypt.hash(data.password || "demo123", 10);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      collegeId: data.empId,
      passwordHash,
      role: UserRole.LIBRARIAN,
      status: UserStatus.ACTIVE,
      departmentId: department._id,
      departmentName: department.name,
      phone: data.phone || "+91 98400 00000",
    });

    const profile = await LibrarianProfile.create({
      userId: user._id,
      empId: data.empId,
      departmentId: department._id,
      libraryId: library._id,
      joined: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
      experience: "1 yr",
      status: data.status || "Active",
      booksManaged: 0,
      requestsProcessed: 0,
      transfersCompleted: 0,
      fineActions: 0,
      recentActivity: ["Account created"],
    });

    return {
      id: profile._id.toString(),
      name: user.name,
      email: user.email,
      empId: profile.empId,
      dept: department.name,
      status: profile.status,
    };
  }

  /**
   * Update librarian profile
   */
  async updateLibrarian(
    profileId: string,
    data: {
      name?: string;
      phone?: string;
      status?: "Active" | "On Leave";
      deptNameOrId?: string;
    }
  ) {
    const profile = await LibrarianProfile.findById(profileId);
    if (!profile) throw new AppError("Librarian profile not found", 404);

    const user = await User.findById(profile.userId);
    if (!user) throw new AppError("Associated user not found", 404);

    if (data.name) user.name = data.name;
    if (data.phone) user.phone = data.phone;
    if (data.status) profile.status = data.status;

    if (data.deptNameOrId) {
      const dept = await Department.findOne({
        $or: [{ _id: Types.ObjectId.isValid(data.deptNameOrId) ? data.deptNameOrId : null }, { name: data.deptNameOrId }],
      });
      if (dept) {
        user.departmentId = dept._id;
        user.departmentName = dept.name;
        profile.departmentId = dept._id;
      }
    }

    await Promise.all([user.save(), profile.save()]);

    return { message: "Librarian profile updated successfully" };
  }

  /**
   * Deactivate librarian / toggle leave
   */
  async toggleStatus(profileId: string, status: "Active" | "On Leave", reason?: string) {
    const profile = await LibrarianProfile.findById(profileId);
    if (!profile) throw new AppError("Librarian not found", 404);

    profile.status = status;
    if (reason) {
      profile.recentActivity.unshift(`Status set to ${status}: ${reason}`);
    }
    await profile.save();

    return { message: `Librarian status updated to ${status}` };
  }
}

export const librarianService = new LibrarianService();
