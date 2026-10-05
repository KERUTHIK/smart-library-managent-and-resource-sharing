import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBook extends Document {
  _id: Types.ObjectId;
  title: string;
  normalizedTitle: string; // for duplicate detection
  author: string;
  normalizedAuthor: string;
  isbn: string;
  edition?: string;
  publisher?: string;
  publicationYear?: number;
  category: string;
  subject: string;
  description: string;
  keywords: string[];
  coverImage?: string;
  departmentId: Types.ObjectId;
  departmentName: string;
  rating: number;
  loanPeriodDays: number;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  hasEbook: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    normalizedTitle: { type: String, required: true, index: true, lowercase: true, trim: true },
    author: { type: String, required: true, trim: true },
    normalizedAuthor: { type: String, required: true, index: true, lowercase: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true, index: true },
    edition: { type: String, trim: true },
    publisher: { type: String, trim: true },
    publicationYear: { type: Number },
    category: { type: String, required: true, trim: true, index: true },
    subject: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: "" },
    keywords: [{ type: String, trim: true }],
    coverImage: { type: String },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    departmentName: { type: String, required: true, trim: true },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    loanPeriodDays: { type: Number, default: 14 },
    shelfLocation: { type: String, default: "A-01" },
    totalCopies: { type: Number, default: 0 },
    availableCopies: { type: Number, default: 0 },
    hasEbook: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

BookSchema.index({ title: "text", author: "text", isbn: "text", subject: "text", category: "text" });

export const Book = mongoose.model<IBook>("Book", BookSchema);
