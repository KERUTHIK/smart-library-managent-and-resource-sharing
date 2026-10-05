import { Types } from "mongoose";
import { Notification, INotification } from "../models/Notification.js";
import { NotificationType } from "../constants/index.js";
import { AppError } from "../middleware/errorHandler.js";

export class NotificationService {
  /**
   * Helper to format relative or short time string
   */
  private formatNotificationTime(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return notifications.map((n) => ({
      id: n._id.toString(),
      type: n.uiType || "info",
      title: n.title,
      message: n.message,
      time: this.formatNotificationTime(n.createdAt),
      read: n.read,
      createdAt: n.createdAt,
    }));
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId: new Types.ObjectId(userId),
      },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) throw new AppError("Notification not found", 404);
    return { id: notification._id.toString(), read: true };
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    await Notification.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { $set: { read: true } }
    );
    return { message: "All notifications marked as read" };
  }

  /**
   * Dismiss/delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    const res = await Notification.deleteOne({
      _id: notificationId,
      userId: new Types.ObjectId(userId),
    });
    if (res.deletedCount === 0) throw new AppError("Notification not found", 404);
    return { message: "Notification dismissed" };
  }

  /**
   * System or service creates a notification
   */
  async createNotification(data: {
    userId: string | Types.ObjectId;
    title: string;
    message: string;
    type: NotificationType;
    uiType?: "success" | "warning" | "info" | "danger";
    metadata?: Record<string, any>;
  }) {
    let uiType = data.uiType;
    if (!uiType) {
      switch (data.type) {
        case NotificationType.SUCCESS:
        case NotificationType.READY_FOR_PICKUP:
        case NotificationType.TRANSFER_COMPLETED:
          uiType = "success";
          break;
        case NotificationType.WARNING:
        case NotificationType.DUE_SOON:
          uiType = "warning";
          break;
        case NotificationType.FINE_ASSESSED:
          uiType = "danger";
          break;
        default:
          uiType = "info";
      }
    }

    const n = await Notification.create({
      userId: new Types.ObjectId(data.userId),
      type: data.type,
      uiType,
      title: data.title,
      message: data.message,
      read: false,
      metadata: data.metadata,
    });

    return n;
  }
}

export const notificationService = new NotificationService();
