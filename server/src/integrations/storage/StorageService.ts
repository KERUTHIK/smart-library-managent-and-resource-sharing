import fs from "node:fs";
import path from "node:path";
import { config } from "../../config/env.js";

export class StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), config.storage.dir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(file: { buffer?: Buffer; path?: string; originalname: string; mimetype: string }): Promise<{
    url: string;
    path: string;
    size: number;
  }> {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${basename}-${Date.now()}${ext}`;
    const destinationPath = path.join(this.baseDir, filename);

    if (file.buffer) {
      fs.writeFileSync(destinationPath, file.buffer);
    } else if (file.path && file.path !== destinationPath) {
      fs.copyFileSync(file.path, destinationPath);
    }

    const stats = fs.statSync(destinationPath);
    return {
      url: `/uploads/${filename}`,
      path: destinationPath,
      size: stats.size,
    };
  }

  async download(relativePath: string): Promise<Buffer> {
    const fullPath = path.isAbsolute(relativePath) ? relativePath : path.join(process.cwd(), relativePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error("File not found in storage");
    }
    return fs.readFileSync(fullPath);
  }

  async delete(relativePath: string): Promise<void> {
    const fullPath = path.isAbsolute(relativePath) ? relativePath : path.join(process.cwd(), relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  getFilePath(relativePath: string): string {
    return path.isAbsolute(relativePath) ? relativePath : path.join(process.cwd(), relativePath);
  }
}

export const storageService = new StorageService();
