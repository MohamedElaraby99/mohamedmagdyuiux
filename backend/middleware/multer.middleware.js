import path from "path";

import multer from "multer";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 mb in size max limit
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {

      // Sanitize and timestamp the filename to avoid collisions and track upload time
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const safeBase = baseName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      // Use ISO-like timestamp without characters invalid for filenames
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const finalName = `${safeBase || 'file'}-${timestamp}${ext}`;
      cb(null, finalName);
    },
  }),
  fileFilter: (req, file, cb) => {

    let ext = path.extname(file.originalname);

    if (
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".webp" &&
      ext !== ".png" &&
      ext !== ".mp4" &&
      ext !== ".pdf"
    ) {

      cb(new Error(`Unsupported file type! ${ext}`), false);
      return;
    }

    cb(null, true);
  },
});

export default upload;
