import { Router } from "express";
import authRoutes from "./auth.routes.js";
import bookRoutes from "./book.routes.js";
import ebookRoutes from "./ebook.routes.js";
import requestRoutes from "./request.routes.js";
import transferRoutes from "./transfer.routes.js";
import returnRoutes from "./return.routes.js";
import renewalRoutes from "./renewal.routes.js";
import fineRoutes from "./fine.routes.js";
import studyFolderRoutes from "./studyFolder.routes.js";
import aiRoutes from "./ai.routes.js";
import notificationRoutes from "./notification.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import departmentRoutes from "./department.routes.js";
import librarianRoutes from "./librarian.routes.js";
import userRoutes from "./user.routes.js";
import auditRoutes from "./audit.routes.js";

const router = Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "LibSync Backend",
    version: "1.0.0",
  });
});

// Mounted sub-routers
router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/ebooks", ebookRoutes);
router.use("/requests", requestRoutes);
router.use("/transfers", transferRoutes);
router.use("/returns", returnRoutes);
router.use("/renewals", renewalRoutes);
router.use("/fines", fineRoutes);
router.use("/study-folders", studyFolderRoutes);
router.use("/ai", aiRoutes);
router.use("/notifications", notificationRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/departments", departmentRoutes);
router.use("/librarians", librarianRoutes);
router.use("/users", userRoutes);
router.use("/audit-logs", auditRoutes);

export default router;
