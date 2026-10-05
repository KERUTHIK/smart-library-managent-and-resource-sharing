import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStudyNote extends Document {
  _id: Types.ObjectId;
  folderId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudyNoteSchema = new Schema<IStudyNote>(
  {
    folderId: { type: Schema.Types.ObjectId, ref: "StudyFolder", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const StudyNote = mongoose.model<IStudyNote>("StudyNote", StudyNoteSchema);
