import { Types } from "mongoose";
import { AuditLog, IAuditLog } from "../models/AuditLog.js";
import { AuditAction } from "../constants/index.js";

export class AuditService {
  /**
   * Query institutional audit logs with filtering
   */
  async getLogs(filter: {
    action?: string;
    actorType?: string;
    entityType?: string;
    limit?: number;
    page?: number;
  } = {}) {
    const query: any = {};
    if (filter.action && filter.action !== "ALL") {
      query.action = filter.action;
    }
    if (filter.actorType && filter.actorType !== "ALL") {
      query.actorRole = filter.actorType;
    }
    if (filter.entityType && filter.entityType !== "ALL") {
      query.resourceType = filter.entityType;
    }

    const limit = filter.limit || 50;
    const page = filter.page || 1;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("actorId", "name email role")
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      logs: logs.map((log: any) => ({
        id: log._id.toString(),
        action: log.action,
        actionFormatted: log.action.replace(/_/g, " "),
        actor: log.actorName || log.actorId?.name || "System",
        actorRole: log.actorRole || log.actorId?.role || "System",
        entityType: log.resourceType,
        entityId: log.resourceId,
        details: log.details,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      })),
    };
  }

  /**
   * Helper to write an audit record
   */
  async log(data: {
    action: AuditAction;
    actorId?: string | Types.ObjectId;
    actorName?: string;
    actorRole?: string;
    actorType?: "Admin" | "Librarian" | "Student" | "System";
    entityType: string;
    entityId?: string | Types.ObjectId;
    details?: string | Record<string, any>;
    ipAddress?: string;
  }) {
    return AuditLog.create({
      action: data.action,
      actorId: data.actorId ? new Types.ObjectId(data.actorId) : undefined,
      actorName: data.actorName || data.actorType || "System",
      actorRole: data.actorRole || data.actorType || "System",
      resourceType: data.entityType,
      resourceId: data.entityId ? data.entityId.toString() : undefined,
      details: typeof data.details === "string" ? data.details : JSON.stringify(data.details || {}),
      ipAddress: data.ipAddress,
    });
  }
}

export const auditService = new AuditService();
