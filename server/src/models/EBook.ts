import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEBook extends Document {
  _id: Types.ObjectId;
  title: string;
  normalizedTitle: string;
  author: string;
  normalizedAuthor: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  publicationYear?: number;
  category: string;
  subject: string;
  description: string;
  language: string;
  keywords: string[];
  coverImage?: string;
  pdfPath: string;
  fileSize: string;
  pageCount: number;
  departmentId: Types.ObjectId;
  departmentName: string;
  rating: number;
  readCount: number;
  isAiExtracted: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EBookSchema = new Schema<IEBook>(
  {
    title: { type: String, required: true, trim: true },
    normalizedTitle: { type: String, required: true, lowercase: true, trim: true },
    author: { type: String, required: true, trim: true },
    normalizedAuthor: { type: String, required: true, lowercase: true, trim: true },
    isbn: { type: String, trim: true, index: true },
    publisher: { type: String, trim: true },
    edition: { type: String, trim: true },
    publicationYear: { type: Number },
    category: { type: String, required: true, trim: true, index: true },
    subject: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: "" },
    language: { type: String, default: "English" },
    keywords: [{ type: String, trim: true }],
    coverImage: { type: String },
    pdfPath: { type: String, required: true },
    fileSize: { type: String, default: "15.0 MB" },
    pageCount: { type: Number, default: 100 },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    departmentName: { type: String, required: true },
    rating: { type: Number, default: 4.8 },
    readCount: { type: Number, default: 0 },
    isAiExtracted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

EBookSchema.index({ title: "text", author: "text", subject: "text" });

export const EBook = mongoose.model<IEBook>("EBook", EBookSchema);
