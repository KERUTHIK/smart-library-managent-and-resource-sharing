import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDepartment extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  icon: string;
  libraryName: string;
  head: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    icon: { type: String, default: "🏛️" },
    libraryName: { type: String, required: true, trim: true },
    head: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>("Department", DepartmentSchema);
