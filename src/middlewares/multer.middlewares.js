const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const allowedTypes = [
  "image/jpeg", // .jpg, .jpeg
  "image/png", // .png
  "image/webp", // .webp
  "image/gif", // .gif
];
exports.upload = multer({
  storage: storage,
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const allowedVideoTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
  "video/x-matroska", // .mkv
];
exports.videoUplodeValidetion = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "video") {
      if (!allowedVideoTypes.includes(file.mimetype)) {
        return cb(new Error("Only MP4, WebM, MOV and MKV videos are allowed"));
      }
      return cb(null, true);
    }
    if (file.fieldname === "thumbnail") {
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Invalid thumbnail format"));
      }
      return cb(null, true);
    }
  },
});
