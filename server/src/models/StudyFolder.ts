import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStudyFolder extends Document {
  _id: Types.ObjectId;
  name: string;
  emoji: string;
  color: string;
  description: string;
  userId: Types.ObjectId;
  bookCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudyFolderSchema = new Schema<IStudyFolder>(
  {
    name: { type: String, required: true, trim: true },
    emoji: { type: String, default: "📁" },
    color: { type: String, default: "indigo" },
    description: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const StudyFolder = mongoose.model<IStudyFolder>("StudyFolder", StudyFolderSchema);
