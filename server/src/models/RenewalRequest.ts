import mongoose, { Document, Schema, Types } from "mongoose";
import { RenewalStatus } from "../constants/index.js";

export interface IRenewalRequest extends Document {
  _id: Types.ObjectId;
  borrowTransactionId: Types.ObjectId;
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  bookTitle: string;
  requestedAt: Date;
  currentDueDate: Date;
  newProposedDueDate: Date;
  status: RenewalStatus;
  processedBy?: Types.ObjectId;
  processedAt?: Date;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RenewalRequestSchema = new Schema<IRenewalRequest>(
  {
    borrowTransactionId: { type: Schema.Types.ObjectId, ref: "BorrowTransaction", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    bookTitle: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now },
    currentDueDate: { type: Date, required: true },
    newProposedDueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(RenewalStatus),
      default: RenewalStatus.RENEWAL_REQUESTED,
      index: true,
    },
    processedBy: { type: Schema.Types.ObjectId, ref: "User" },
    processedAt: { type: Date },
    reason: { type: String },
  },
  { timestamps: true }
);

export const RenewalRequest = mongoose.model<IRenewalRequest>("RenewalRequest", RenewalRequestSchema);
