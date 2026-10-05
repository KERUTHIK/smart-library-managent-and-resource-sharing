import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBookmark extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  ebookId: Types.ObjectId;
  title: string;
  pageNumber: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ebookId: { type: Schema.Types.ObjectId, ref: "EBook", required: true, index: true },
    title: { type: String, required: true },
    pageNumber: { type: Number, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

BookmarkSchema.index({ userId: 1, ebookId: 1, pageNumber: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>("Bookmark", BookmarkSchema);
