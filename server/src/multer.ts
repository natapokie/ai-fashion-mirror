import multer from 'multer';

// diskStorage gives you full control on storing files to disk
const storage = multer.diskStorage({
  // destination that files are saved to
  destination: function (req, file, cb) {
    cb(null, '__uploads/');
  },
  filename: function (req, file, cb) {
    // set filename
    const filename = `capture.jpeg`;
    cb(null, filename);
  },
});

// Export multer instance
export const upload = multer({
  storage: storage,
});
