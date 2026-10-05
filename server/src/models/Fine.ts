import mongoose, { Document, Schema, Types } from "mongoose";
import { FineStatus } from "../constants/index.js";

export interface IFine extends Document {
  _id: Types.ObjectId;
  fineId: string; // e.g. FIN-1024
  userId: Types.ObjectId;
  studentName: string;
  studentCollegeId: string;
  studentEmail: string;
  departmentId: Types.ObjectId;
  departmentName: string;
  bookId: Types.ObjectId;
  bookTitle: string;
  bookCover?: string;
  borrowTransactionId?: Types.ObjectId;
  dueDate: Date;
  daysOverdue: number;
  dailyRate: number;
  amount: number;
  status: FineStatus;
  paidDate?: Date;
  paymentMethod?: string;
  paymentTransactionId?: string;
  waivedBy?: Types.ObjectId;
  waivedByName?: string;
  waiverReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FineSchema = new Schema<IFine>(
  {
    fineId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName: { type: String, required: true },
    studentCollegeId: { type: String, required: true },
    studentEmail: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    departmentName: { type: String, required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    bookTitle: { type: String, required: true },
    bookCover: { type: String },
    borrowTransactionId: { type: Schema.Types.ObjectId, ref: "BorrowTransaction" },
    dueDate: { type: Date, required: true },
    daysOverdue: { type: Number, default: 0 },
    dailyRate: { type: Number, default: 5 },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(FineStatus),
      default: FineStatus.PENDING,
      index: true,
    },
    paidDate: { type: Date },
    paymentMethod: { type: String },
    paymentTransactionId: { type: String },
    waivedBy: { type: Schema.Types.ObjectId, ref: "User" },
    waivedByName: { type: String },
    waiverReason: { type: String },
  },
  { timestamps: true }
);

export const Fine = mongoose.model<IFine>("Fine", FineSchema);
