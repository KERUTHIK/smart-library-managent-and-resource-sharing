import { Router } from "express";
import { studyFolderController } from "../controllers/studyFolder.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// Folders CRUD
router.get("/", (req, res, next) => studyFolderController.getFolders(req, res, next));
router.post("/", (req, res, next) => studyFolderController.createFolder(req, res, next));
router.delete("/:id", (req, res, next) => studyFolderController.deleteFolder(req, res, next));

// Folder Items (Books/E-Books)
router.post("/:id/books", (req, res, next) => studyFolderController.addBookToFolder(req, res, next));
router.delete("/:id/books/:itemId", (req, res, next) => studyFolderController.removeBookFromFolder(req, res, next));

// Folder Notes
router.post("/:id/notes", (req, res, next) => studyFolderController.addNote(req, res, next));
router.delete("/notes/:noteId", (req, res, next) => studyFolderController.deleteNote(req, res, next));

// E-Book Bookmarks
router.get("/bookmarks/all", (req, res, next) => studyFolderController.getBookmarks(req, res, next));
router.post("/bookmarks", (req, res, next) => studyFolderController.addBookmark(req, res, next));
router.delete("/bookmarks/:id", (req, res, next) => studyFolderController.deleteBookmark(req, res, next));

export default router;
