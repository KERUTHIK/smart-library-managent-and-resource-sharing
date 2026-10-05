import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStudyFolderItem extends Document {
  _id: Types.ObjectId;
  folderId: Types.ObjectId;
  userId: Types.ObjectId;
  itemType: "book" | "ebook";
  bookId?: Types.ObjectId;
  ebookId?: Types.ObjectId;
  title: string;
  author: string;
  coverImage?: string;
  isEbook: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudyFolderItemSchema = new Schema<IStudyFolderItem>(
  {
    folderId: { type: Schema.Types.ObjectId, ref: "StudyFolder", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    itemType: { type: String, enum: ["book", "ebook"], required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book" },
    ebookId: { type: Schema.Types.ObjectId, ref: "EBook" },
    title: { type: String, required: true },
    author: { type: String, required: true },
    coverImage: { type: String },
    isEbook: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

StudyFolderItemSchema.index({ folderId: 1, bookId: 1 }, { unique: true, sparse: true });
StudyFolderItemSchema.index({ folderId: 1, ebookId: 1 }, { unique: true, sparse: true });

export const StudyFolderItem = mongoose.model<IStudyFolderItem>("StudyFolderItem", StudyFolderItemSchema);
