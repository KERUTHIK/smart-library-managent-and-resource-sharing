import mongoose, { Document, Schema, Types } from "mongoose";
import { BookCondition } from "../constants/index.js";

export interface IReturnTransaction extends Document {
  _id: Types.ObjectId;
  returnId: string; // e.g. RET-1001
  borrowTransactionId: Types.ObjectId;
  studentId: Types.ObjectId;
  studentName: string;
  studentCollegeId: string;
  studentDepartmentName: string;
  bookId: Types.ObjectId;
  bookTitle: string;
  bookAuthor: string;
  bookCopyId: Types.ObjectId;
  copyCode: string;
  borrowedDate: Date;
  dueDate: Date;
  returnedDate: Date;
  daysOverdue: number;
  fineAssessed: number;
  condition: BookCondition;
  returnedToLibraryName: string;
  processedByLibrarianName: string;
  processedByLibrarianId?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnTransactionSchema = new Schema<IReturnTransaction>(
  {
    returnId: { type: String, required: true, unique: true },
    borrowTransactionId: { type: Schema.Types.ObjectId, ref: "BorrowTransaction", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName: { type: String, required: true },
    studentCollegeId: { type: String, required: true },
    studentDepartmentName: { type: String, required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    bookTitle: { type: String, required: true },
    bookAuthor: { type: String, required: true },
    bookCopyId: { type: Schema.Types.ObjectId, ref: "BookCopy", required: true },
    copyCode: { type: String, required: true },
    borrowedDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    returnedDate: { type: Date, required: true, index: true },
    daysOverdue: { type: Number, default: 0 },
    fineAssessed: { type: Number, default: 0 },
    condition: { type: String, enum: Object.values(BookCondition), default: BookCondition.GOOD },
    returnedToLibraryName: { type: String, required: true },
    processedByLibrarianName: { type: String, required: true },
    processedByLibrarianId: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
  },
  { timestamps: true }
);

export const ReturnTransaction = mongoose.model<IReturnTransaction>("ReturnTransaction", ReturnTransactionSchema);
