import { Types } from "mongoose";
import { Department, IDepartment } from "../models/Department.js";
import { Library } from "../models/Library.js";
import { BookCopy } from "../models/BookCopy.js";
import { Book } from "../models/Book.js";
import { EBook } from "../models/EBook.js";
import { User } from "../models/User.js";
import { BorrowTransaction } from "../models/BorrowTransaction.js";
import { BorrowRequest } from "../models/BorrowRequest.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  UserRole,
  BookCopyStatus,
  BorrowTransactionStatus,
  BorrowRequestStatus,
  LibraryType,
} from "../constants/index.js";

export class DepartmentService {
  /**
   * Get all departments with aggregated library statistics
   */
  async getDepartments() {
    const departments = await Department.find().sort({ name: 1 }).lean();
    const now = new Date();

    const results = await Promise.all(
      departments.map(async (dept, idx) => {
        const [
          totalBooks,
          availableBooks,
          issuedBooks,
          overdueBooks,
          totalEbooks,
          studentCount,
          staffCount,
          librarianCount,
          pendingRequestsCount,
          popularBooksList,
        ] = await Promise.all([
          BookCopy.countDocuments({ departmentId: dept._id }),
          BookCopy.countDocuments({ departmentId: dept._id, status: BookCopyStatus.AVAILABLE }),
          BorrowTransaction.countDocuments({ departmentId: dept._id, status: BorrowTransactionStatus.ACTIVE }),
          BorrowTransaction.countDocuments({
            departmentId: dept._id,
            status: BorrowTransactionStatus.ACTIVE,
            dueDate: { $lt: now },
          }),
          EBook.countDocuments({ departmentId: dept._id }),
          User.countDocuments({ departmentId: dept._id, role: UserRole.STUDENT }),
          User.countDocuments({ departmentId: dept._id, role: { $in: [UserRole.FACULTY, UserRole.STAFF] } }),
          User.countDocuments({ departmentId: dept._id, role: UserRole.LIBRARIAN }),
          BorrowRequest.countDocuments({ departmentId: dept._id, status: BorrowRequestStatus.PENDING }),
          Book.find({ departmentId: dept._id }).limit(4).select("title").lean(),
        ]);

        return {
          id: dept._id.toString(),
          numericId: idx + 1,
          name: dept.name,
          code: dept.code,
          icon: dept.icon || "📚",
          library: dept.libraryName || `${dept.code} Library`,
          head: dept.head || "Faculty Head",
          description: dept.description || "",
          books: totalBooks,
          ebooks: totalEbooks,
          students: studentCount,
          staff: staffCount,
          librarians: librarianCount,
          available: availableBooks,
          issued: issuedBooks,
          overdue: overdueBooks,
          pendingRequests: pendingRequestsCount,
          popularBooks: popularBooksList.length > 0 ? popularBooksList.map((b) => b.title) : ["Reference Handbook", "Foundations of Engineering"],
        };
      })
    );

    return results;
  }

  /**
   * Create a new department
   */
  async createDepartment(data: {
    name: string;
    code: string;
    headOfDepartment?: string;
    head?: string;
    icon?: string;
    description?: string;
  }) {
    if (!data.name || !data.code) {
      throw new AppError("Department name and code are required", 400);
    }

    const existing = await Department.findOne({
      $or: [{ name: data.name }, { code: data.code.toUpperCase() }],
    });
    if (existing) {
      throw new AppError("A department with this name or code already exists", 400);
    }

    const dept = await Department.create({
      name: data.name,
      code: data.code.toUpperCase(),
      head: data.head || data.headOfDepartment || "Faculty Head",
      libraryName: `${data.code.toUpperCase()} Library`,
      icon: data.icon || "🏛️",
      description: data.description,
      status: "active",
    });

    // Automatically create a department library entry
    await Library.create({
      name: `${dept.code} Library`,
      code: `LIB-${dept.code}`,
      type: LibraryType.DEPARTMENT,
      departmentId: dept._id,
      buildingLocation: `${dept.name} Block`,
      operatingHours: "8:30 AM - 6:00 PM",
    });

    return dept;
  }

  /**
   * Update department
   */
  async updateDepartment(
    id: string,
    data: { name?: string; code?: string; headOfDepartment?: string; head?: string; icon?: string; description?: string }
  ) {
    const dept = await Department.findById(id);
    if (!dept) throw new AppError("Department not found", 404);

    if (data.name) dept.name = data.name;
    if (data.code) {
      dept.code = data.code.toUpperCase();
      dept.libraryName = `${dept.code} Library`;
    }
    const newHead = data.head || data.headOfDepartment;
    if (newHead !== undefined) dept.head = newHead;
    if (data.icon) dept.icon = data.icon;
    if (data.description !== undefined) dept.description = data.description;

    await dept.save();
    return dept;
  }

  /**
   * Delete department
   */
  async deleteDepartment(id: string) {
    const dept = await Department.findById(id);
    if (!dept) throw new AppError("Department not found", 404);

    const bookCount = await BookCopy.countDocuments({ departmentId: dept._id });
    if (bookCount > 0) {
      throw new AppError(`Cannot delete department with ${bookCount} registered book copies.`, 400);
    }

    await Department.deleteOne({ _id: dept._id });
    await Library.deleteOne({ departmentId: dept._id });

    return { message: "Department deleted successfully" };
  }
}

export const departmentService = new DepartmentService();
