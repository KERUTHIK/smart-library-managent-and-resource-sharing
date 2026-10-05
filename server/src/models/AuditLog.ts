import mongoose, { Document, Schema, Types } from "mongoose";
import { AuditAction, UserRole } from "../constants/index.js";

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  actorId?: Types.ObjectId;
  actorName: string;
  actorRole: UserRole | string;
  actorEmail?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  departmentName?: string;
  details: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    actorEmail: { type: String },
    action: { type: String, enum: Object.values(AuditAction), required: true, index: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String },
    departmentName: { type: String },
    details: { type: String, required: true },
    ipAddress: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
