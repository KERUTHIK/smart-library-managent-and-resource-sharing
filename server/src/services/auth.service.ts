import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User.js";
import { config } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { UserStatus, UserRole, AuditAction } from "../constants/index.js";
import { AuditLog } from "../models/AuditLog.js";

export class AuthService {
  async login(email: string, passwordPlain: string) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new AppError("Invalid credentials. Please check your email and password.", 401, "INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid credentials. Please check your email and password.", 401, "INVALID_CREDENTIALS");
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError("Your account has been suspended. Please contact library administration.", 403, "ACCOUNT_SUSPENDED");
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new AppError("Your account is inactive.", 403, "ACCOUNT_INACTIVE");
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        departmentId: user.departmentId?.toString(),
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    // Audit log
    await AuditLog.create({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      actorEmail: user.email,
      action: AuditAction.USER_LOGIN,
      resourceType: "User",
      resourceId: user._id.toString(),
      details: `${user.name} (${user.role}) signed in successfully`,
    });

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.departmentName || "General",
        collegeId: user.collegeId,
        avatar: user.avatar,
        status: user.status,
        phone: user.phone,
        yearOfStudy: user.yearOfStudy,
        bio: user.bio,
        notificationPreferences: user.notificationPreferences,
      },
    };
  }

  async getCurrentUser(userId: string) {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.departmentName || "General",
      collegeId: user.collegeId,
      avatar: user.avatar,
      status: user.status,
      phone: user.phone,
      yearOfStudy: user.yearOfStudy,
      bio: user.bio,
      notificationPreferences: user.notificationPreferences,
    };
  }

  async getMe(userId: string) {
    return this.getCurrentUser(userId);
  }

  async register(data: {
    name: string;
    email: string;
    password?: string;
    collegeId: string;
    departmentName?: string;
    role?: UserRole;
  }) {
    const existing = await User.findOne({
      $or: [{ email: data.email.toLowerCase().trim() }, { collegeId: data.collegeId.trim() }],
    });
    if (existing) {
      throw new AppError("An account with this email or college ID already exists.", 400);
    }

    const passwordHash = await bcrypt.hash(data.password || "demo123", 10);
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      collegeId: data.collegeId.trim(),
      passwordHash,
      role: data.role || UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      departmentName: data.departmentName || "Computer Science",
    });

    return this.login(user.email, data.password || "demo123");
  }

  async changePassword(userId: string, currentPasswordPlain: string, newPasswordPlain: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const isMatch = await bcrypt.compare(currentPasswordPlain, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Current password incorrect", 400);
    }

    user.passwordHash = await bcrypt.hash(newPasswordPlain, 10);
    await user.save();

    return { message: "Password updated successfully" };
  }
}

export const authService = new AuthService();
