import mongoose, { Document, Schema, Types } from "mongoose";
import { BorrowTransactionStatus } from "../constants/index.js";

export interface IBorrowTransaction extends Document {
  _id: Types.ObjectId;
  transactionId: string; // e.g. BRW-1024
  bookId: Types.ObjectId;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn: string;
  bookCover?: string;
  bookCopyId: Types.ObjectId;
  copyCode: string;
  barcode: string;
  userId: Types.ObjectId;
  userName: string;
  userCollegeId: string;
  userDepartmentName: string;
  userEmail: string;
  departmentId: Types.ObjectId;
  libraryId: Types.ObjectId;
  libraryName: string;
  originalLibraryName?: string;
  shelfLocation: string;
  issuedAt: Date;
  dueDate: Date;
  returnedAt?: Date;
  daysOverdue: number;
  fineAmount: number;
  finePerDay: number;
  renewalCount: number;
  maxRenewals: number;
  status: BorrowTransactionStatus;
  issuedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BorrowTransactionSchema = new Schema<IBorrowTransaction>(
  {
    transactionId: { type: String, required: true, unique: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    bookTitle: { type: String, required: true },
    bookAuthor: { type: String, required: true },
    bookIsbn: { type: String, required: true },
    bookCover: { type: String },
    bookCopyId: { type: Schema.Types.ObjectId, ref: "BookCopy", required: true, index: true },
    copyCode: { type: String, required: true },
    barcode: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userName: { type: String, required: true },
    userCollegeId: { type: String, required: true },
    userDepartmentName: { type: String, required: true },
    userEmail: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    libraryId: { type: Schema.Types.ObjectId, ref: "Library", required: true, index: true },
    libraryName: { type: String, required: true },
    originalLibraryName: { type: String },
    shelfLocation: { type: String, required: true },
    issuedAt: { type: Date, required: true },
    dueDate: { type: Date, required: true, index: true },
    returnedAt: { type: Date },
    daysOverdue: { type: Number, default: 0 },
    fineAmount: { type: Number, default: 0 },
    finePerDay: { type: Number, default: 5 },
    renewalCount: { type: Number, default: 0 },
    maxRenewals: { type: Number, default: 2 },
    status: {
      type: String,
      enum: Object.values(BorrowTransactionStatus),
      default: BorrowTransactionStatus.ACTIVE,
      index: true,
    },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const BorrowTransaction = mongoose.model<IBorrowTransaction>("BorrowTransaction", BorrowTransactionSchema);
