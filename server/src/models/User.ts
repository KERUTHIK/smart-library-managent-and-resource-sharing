import mongoose, { Document, Schema, Types } from "mongoose";
import { UserRole, UserStatus } from "../constants/index.js";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  collegeId: string; // student ID or employee ID
  departmentId?: Types.ObjectId;
  departmentName?: string;
  avatar: string;
  phone?: string;
  status: UserStatus;
  yearOfStudy?: string;
  bio?: string;
  notificationPreferences: {
    dueReminders: boolean;
    requestUpdates: boolean;
    transferAlerts: boolean;
    fineAlerts: boolean;
    newArrivals: boolean;
    weeklyDigest: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
      index: true,
    },
    collegeId: { type: String, required: true, unique: true, trim: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", index: true },
    departmentName: { type: String, trim: true },
    avatar: { type: String, default: "U" },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
      index: true,
    },
    yearOfStudy: { type: String, trim: true },
    bio: { type: String, trim: true },
    notificationPreferences: {
      dueReminders: { type: Boolean, default: true },
      requestUpdates: { type: Boolean, default: true },
      transferAlerts: { type: Boolean, default: true },
      fineAlerts: { type: Boolean, default: true },
      newArrivals: { type: Boolean, default: false },
      weeklyDigest: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

UserSchema.index({ name: "text", email: "text", collegeId: "text" });

export const User = mongoose.model<IUser>("User", UserSchema);
