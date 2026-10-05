import mongoose, { Document, Schema, Types } from "mongoose";
import { TransferStatus } from "../constants/index.js";

export interface ITransferStep {
  label: string;
  done: boolean;
  active?: boolean;
  timestamp?: Date;
}

export interface ITransferRequest extends Document {
  _id: Types.ObjectId;
  transferId: string; // e.g. TRF-1024
  borrowRequestId?: Types.ObjectId;
  bookId: Types.ObjectId;
  bookTitle: string;
  bookCopyId?: Types.ObjectId;
  copyCode?: string;
  studentId: Types.ObjectId;
  studentName: string;
  studentDept: string;
  sourceDepartmentId: Types.ObjectId;
  sourceDepartmentName: string;
  sourceLibraryId: Types.ObjectId;
  sourceLibraryName: string;
  targetDepartmentId: Types.ObjectId;
  targetDepartmentName: string;
  targetLibraryId: Types.ObjectId;
  targetLibraryName: string;
  status: TransferStatus;
  statusLabel: string; // For frontend display
  steps: ITransferStep[];
  sourceLibrarianId?: Types.ObjectId;
  destinationLibrarianId?: Types.ObjectId;
  requestDate: Date;
  receivedDate?: Date;
  issuedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransferRequestSchema = new Schema<ITransferRequest>(
  {
    transferId: { type: String, required: true, unique: true },
    borrowRequestId: { type: Schema.Types.ObjectId, ref: "BorrowRequest" },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    bookTitle: { type: String, required: true },
    bookCopyId: { type: Schema.Types.ObjectId, ref: "BookCopy" },
    copyCode: { type: String },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName: { type: String, required: true },
    studentDept: { type: String, required: true },
    sourceDepartmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    sourceDepartmentName: { type: String, required: true },
    sourceLibraryId: { type: Schema.Types.ObjectId, ref: "Library", required: true },
    sourceLibraryName: { type: String, required: true },
    targetDepartmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    targetDepartmentName: { type: String, required: true },
    targetLibraryId: { type: Schema.Types.ObjectId, ref: "Library", required: true },
    targetLibraryName: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(TransferStatus),
      default: TransferStatus.REQUESTED,
      index: true,
    },
    statusLabel: { type: String, default: "Transfer Pending" },
    steps: [
      {
        label: { type: String, required: true },
        done: { type: Boolean, default: false },
        active: { type: Boolean, default: false },
        timestamp: { type: Date },
      },
    ],
    sourceLibrarianId: { type: Schema.Types.ObjectId, ref: "User" },
    destinationLibrarianId: { type: Schema.Types.ObjectId, ref: "User" },
    requestDate: { type: Date, default: Date.now },
    receivedDate: { type: Date },
    issuedDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const TransferRequest = mongoose.model<ITransferRequest>("TransferRequest", TransferRequestSchema);
