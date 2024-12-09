import multer from 'multer';

// diskStorage gives you full control on storing files to disk
const storage = multer.diskStorage({
  // destination that files are saved to
  destination: function (req, file, cb) {
    cb(null, '__uploads');
  },
  filename: function (req, file, cb) {
    // set filename
    const filename = `${Date.now()}.jpg`;
    cb(null, filename);
  },
});

// Export multer instance
export const upload = multer({
  storage: storage,
  limits: {
    // fileSize: 5000000, //5 MB
  },
  fileFilter(req, file, cb) {
    if (file.mimetype !== 'image/jpeg') {
      // upload only png and jpg format
      return cb(new Error('Please upload a Image'));
    }
    cb(null, true);
  },
});
