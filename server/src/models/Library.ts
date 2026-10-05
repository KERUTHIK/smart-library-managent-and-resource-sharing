import mongoose, { Document, Schema, Types } from "mongoose";
import { LibraryType } from "../constants/index.js";

export interface ILibrary extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  type: LibraryType;
  departmentId?: Types.ObjectId;
  location: string;
  shelfPrefixes: string[];
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const LibrarySchema = new Schema<ILibrary>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: Object.values(LibraryType), default: LibraryType.DEPARTMENTAL },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    location: { type: String, required: true },
    shelfPrefixes: [{ type: String, trim: true }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export const Library = mongoose.model<ILibrary>("Library", LibrarySchema);
