import mongoose, { Document, Schema, Types } from "mongoose";
import { WaitlistStatus } from "../constants/index.js";

export interface IWaitlistEntry extends Document {
  _id: Types.ObjectId;
  bookId: Types.ObjectId;
  bookTitle: string;
  userId: Types.ObjectId;
  userName: string;
  userCollegeId: string;
  userDept: string;
  priority: string; // "Normal" | "Urgent"
  position: number;
  status: WaitlistStatus;
  estimatedAvailableDate?: Date;
  offeredAt?: Date;
  offerExpiresAt?: Date;
  reservedCopyId?: Types.ObjectId;
  requestDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WaitlistEntrySchema = new Schema<IWaitlistEntry>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    bookTitle: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userName: { type: String, required: true },
    userCollegeId: { type: String, required: true },
    userDept: { type: String, required: true },
    priority: { type: String, default: "Normal" },
    position: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(WaitlistStatus),
      default: WaitlistStatus.WAITING,
      index: true,
    },
    estimatedAvailableDate: { type: Date },
    offeredAt: { type: Date },
    offerExpiresAt: { type: Date },
    reservedCopyId: { type: Schema.Types.ObjectId, ref: "BookCopy" },
    requestDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const WaitlistEntry = mongoose.model<IWaitlistEntry>("WaitlistEntry", WaitlistEntrySchema);
