export enum UserRole {
  ADMIN = "admin",
  LIBRARIAN = "librarian",
  STUDENT = "student",
  STAFF = "staff",
  FACULTY = "faculty",
}

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  INACTIVE = "inactive",
}

export enum LibraryType {
  CENTRAL = "central",
  DEPARTMENTAL = "departmental",
  DEPARTMENT = "departmental",
}

export enum BookCopyStatus {
  AVAILABLE = "available",
  BORROWED = "borrowed",
  LOANED = "borrowed",
  RESERVED = "reserved",
  IN_TRANSFER = "in_transfer",
  DAMAGED = "damaged",
  LOST = "lost",
}

export enum BookCondition {
  GOOD = "Good",
  DAMAGED = "Damaged",
  LOST = "Lost",
}

export enum BorrowRequestStatus {
  PENDING = "pending",
  AUTO_APPROVED = "auto_approved",
  TRANSFER_REQUIRED = "transfer_required",
  WAITLISTED = "waitlisted",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  FULFILLED = "fulfilled",
}

export enum TransferStatus {
  REQUESTED = "requested",
  SOURCE_LIBRARIAN_NOTIFIED = "source_librarian_notified",
  SOURCE_LIBRARIAN_APPROVED = "source_librarian_approved",
  DISPATCHED = "in_transit",
  IN_TRANSIT = "in_transit",
  RECEIVED_BY_DESTINATION_LIBRARY = "received_by_destination_library",
  READY_FOR_PICKUP = "ready_for_pickup",
  ISSUED_TO_STUDENT = "issued_to_student",
  COMPLETED = "completed",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export enum BorrowTransactionStatus {
  ACTIVE = "active",
  RETURNED = "returned",
  OVERDUE = "overdue",
  LOST = "lost",
  DAMAGED = "damaged",
}

export enum RenewalStatus {
  AVAILABLE_FOR_RENEWAL = "available_for_renewal",
  RENEWAL_REQUESTED = "renewal_requested",
  RENEWAL_APPROVED = "renewal_approved",
  APPROVED = "renewal_approved",
  RENEWAL_REJECTED = "renewal_rejected",
  REJECTED = "renewal_rejected",
  NOT_ELIGIBLE = "not_eligible",
}

export enum FineStatus {
  PENDING = "pending",
  UNPAID = "pending",
  OVERDUE = "overdue",
  PAID = "paid",
  WAIVED = "waived",
  CANCELLED = "cancelled",
}

export enum PaymentMethod {
  UPI = "UPI",
  CARD = "Card",
  NET_BANKING = "Net Banking",
}

export enum PaymentStatus {
  INITIATED = "initiated",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum WaitlistStatus {
  WAITING = "waiting",
  OFFERED = "offered",
  FULFILLED = "fulfilled",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

export enum NotificationType {
  BOOK_REQUEST = "BOOK_REQUEST",
  REQUEST_APPROVED = "REQUEST_APPROVED",
  REQUEST_REJECTED = "REQUEST_REJECTED",
  TRANSFER_REQUESTED = "TRANSFER_REQUESTED",
  TRANSFER_APPROVED = "TRANSFER_APPROVED",
  TRANSFER_IN_TRANSIT = "TRANSFER_IN_TRANSIT",
  TRANSFER_RECEIVED = "TRANSFER_RECEIVED",
  TRANSFER_COMPLETED = "TRANSFER_RECEIVED",
  BOOK_READY = "BOOK_READY",
  READY_FOR_PICKUP = "BOOK_READY",
  BOOK_ISSUED = "BOOK_ISSUED",
  DUE_SOON = "DUE_SOON",
  OVERDUE = "OVERDUE",
  FINE_CREATED = "FINE_CREATED",
  FINE_ASSESSED = "FINE_CREATED",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  RENEWAL_REQUESTED = "RENEWAL_REQUESTED",
  RENEWAL_APPROVED = "RENEWAL_APPROVED",
  RENEWAL_REJECTED = "RENEWAL_REJECTED",
  WAITLIST_AVAILABLE = "WAITLIST_AVAILABLE",
  SYSTEM_NOTIFICATION = "SYSTEM_NOTIFICATION",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  INFO = "INFO",
}

export enum AuditAction {
  USER_LOGIN = "USER_LOGIN",
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  USER_SUSPENDED = "USER_SUSPENDED",
  USER_RESTORED = "USER_RESTORED",
  BOOK_CREATED = "BOOK_CREATED",
  BOOK_UPDATED = "BOOK_UPDATED",
  BOOK_DELETED = "BOOK_DELETED",
  BOOK_COPIES_ADDED = "BOOK_COPIES_ADDED",
  BOOK_COPY_ISSUED = "BOOK_COPY_ISSUED",
  BOOK_RETURNED = "BOOK_RETURNED",
  RENEW_BOOK = "RENEWAL_APPROVED",
  TRANSFER_REQUESTED = "TRANSFER_REQUESTED",
  TRANSFER_APPROVED = "TRANSFER_APPROVED",
  TRANSFER_RECEIVED = "TRANSFER_RECEIVED",
  FINE_GENERATED = "FINE_GENERATED",
  FINE_PAID = "FINE_PAID",
  FINE_WAIVED = "FINE_WAIVED",
  FINE_CANCELLED = "FINE_CANCELLED",
  RENEWAL_REQUESTED = "RENEWAL_REQUESTED",
  RENEWAL_APPROVED = "RENEWAL_APPROVED",
  RENEWAL_REJECTED = "RENEWAL_REJECTED",
  LIBRARIAN_ASSIGNED = "LIBRARIAN_ASSIGNED",
  LIBRARIAN_DEACTIVATED = "LIBRARIAN_DEACTIVATED",
}
