import mongoose, { Document, Schema, Types } from "mongoose";
import { PaymentMethod, PaymentStatus } from "../constants/index.js";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  transactionId: string; // e.g. TXN-84721
  fineId?: Types.ObjectId;
  fineIds?: Types.ObjectId[];
  userId: Types.ObjectId;
  userName: string;
  userEmail: string;
  bookTitle?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string;
  providerTxnId: string;
  receiptUrl?: string;
  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    fineId: { type: Schema.Types.ObjectId, ref: "Fine" },
    fineIds: [{ type: Schema.Types.ObjectId, ref: "Fine" }],
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    bookTitle: { type: String },
    amount: { type: Number, required: true },
    method: { type: String, enum: Object.values(PaymentMethod), default: PaymentMethod.UPI },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.COMPLETED },
    provider: { type: String, default: "mock" },
    providerTxnId: { type: String, required: true },
    receiptUrl: { type: String },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
