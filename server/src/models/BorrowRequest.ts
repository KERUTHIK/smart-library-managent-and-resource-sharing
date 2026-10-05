import mongoose, { Document, Schema, Types } from "mongoose";
import { BorrowRequestStatus } from "../constants/index.js";

export interface IBorrowRequest extends Document {
  _id: Types.ObjectId;
  requestId: string; // e.g. REQ-1001
  studentId: Types.ObjectId;
  studentName: string;
  studentCollegeId: string;
  studentDepartmentId: Types.ObjectId;
  studentDepartmentName: string;
  bookId: Types.ObjectId;
  bookTitle: string;
  sourceLibraryId?: Types.ObjectId;
  sourceLibraryName?: string;
  pickupLibraryId: Types.ObjectId;
  pickupLibraryName: string;
  status: BorrowRequestStatus;
  availabilityNote: string;
  aiRecommendation?: {
    action: string;
    reason: string;
  };
  estimatedAvailableDate?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BorrowRequestSchema = new Schema<IBorrowRequest>(
  {
    requestId: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName: { type: String, required: true },
    studentCollegeId: { type: String, required: true },
    studentDepartmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    studentDepartmentName: { type: String, required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    bookTitle: { type: String, required: true },
    sourceLibraryId: { type: Schema.Types.ObjectId, ref: "Library" },
    sourceLibraryName: { type: String },
    pickupLibraryId: { type: Schema.Types.ObjectId, ref: "Library", required: true },
    pickupLibraryName: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(BorrowRequestStatus),
      default: BorrowRequestStatus.PENDING,
      index: true,
    },
    availabilityNote: { type: String, required: true },
    aiRecommendation: {
      action: { type: String },
      reason: { type: String },
    },
    estimatedAvailableDate: { type: Date },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const BorrowRequest = mongoose.model<IBorrowRequest>("BorrowRequest", BorrowRequestSchema);
