import mongoose, { Document, Schema, Types } from "mongoose";
import { BookCopyStatus, BookCondition } from "../constants/index.js";

export interface IBookCopy extends Document {
  _id: Types.ObjectId;
  bookId: Types.ObjectId;
  copyCode: string; // e.g., CSE-001
  barcode: string; // e.g., BC100142
  departmentId: Types.ObjectId;
  departmentName: string;
  libraryId: Types.ObjectId;
  libraryName: string;
  shelfLocation: string;
  status: BookCopyStatus;
  condition: BookCondition;
  currentBorrowerId?: Types.ObjectId;
  currentBorrowerName?: string;
  currentBorrowTransactionId?: Types.ObjectId;
  dueDate?: Date;
  activeTransferId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookCopySchema = new Schema<IBookCopy>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    copyCode: { type: String, required: true, trim: true },
    barcode: { type: String, required: true, unique: true, trim: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    departmentName: { type: String, required: true },
    libraryId: { type: Schema.Types.ObjectId, ref: "Library", required: true, index: true },
    libraryName: { type: String, required: true },
    shelfLocation: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(BookCopyStatus),
      default: BookCopyStatus.AVAILABLE,
      index: true,
    },
    condition: {
      type: String,
      enum: Object.values(BookCondition),
      default: BookCondition.GOOD,
    },
    currentBorrowerId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    currentBorrowerName: { type: String, default: null },
    currentBorrowTransactionId: { type: Schema.Types.ObjectId, ref: "BorrowTransaction", default: null },
    dueDate: { type: Date, default: null },
    activeTransferId: { type: Schema.Types.ObjectId, ref: "TransferRequest", default: null },
  },
  { timestamps: true }
);

export const BookCopy = mongoose.model<IBookCopy>("BookCopy", BookCopySchema);
