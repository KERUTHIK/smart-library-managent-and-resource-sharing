import mongoose, { Document, Schema, Types } from "mongoose";

export interface ILibrarianProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  empId: string;
  departmentId: Types.ObjectId;
  libraryId: Types.ObjectId;
  joined: string;
  experience: string;
  status: "Active" | "On Leave";
  booksManaged: number;
  requestsProcessed: number;
  transfersCompleted: number;
  fineActions: number;
  recentActivity: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LibrarianProfileSchema = new Schema<ILibrarianProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    empId: { type: String, required: true, unique: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    libraryId: { type: Schema.Types.ObjectId, ref: "Library", required: true },
    joined: { type: String, required: true },
    experience: { type: String, required: true },
    status: { type: String, enum: ["Active", "On Leave"], default: "Active" },
    booksManaged: { type: Number, default: 0 },
    requestsProcessed: { type: Number, default: 0 },
    transfersCompleted: { type: Number, default: 0 },
    fineActions: { type: Number, default: 0 },
    recentActivity: [{ type: String }],
  },
  { timestamps: true }
);

export const LibrarianProfile = mongoose.model<ILibrarianProfile>("LibrarianProfile", LibrarianProfileSchema);
