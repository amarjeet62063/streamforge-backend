const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const allowedImageTypes = [
  "image/jpeg", // .jpg, .jpeg
  "image/png", // .png
  "image/webp", // .webp
  "image/gif", // .gif
];
const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const allowedVideoTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // MOV
  "video/x-matroska", // MKV
];
const allowedVideoExtensions = [".mp4", ".webm", ".mov", ".mkv"];

exports.upload = multer({
  storage: storage,
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

exports.videoUplodeValidetion = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    //Video

    if (file.fieldname === "video") {
      const validMime = allowedVideoTypes.includes(file.mimetype);
      const validExtension = allowedVideoExtensions.includes(extension);

      if (!(validMime || validExtension)) {
        return cb(new Error("Only MP4, WebM, MOV and MKV videos are allowed"));
      }
      return cb(null, true);
    }

    //Thumbnail

    if (file.fieldname === "thumbnail") {
      const validMime = allowedImageTypes.includes(file.mimetype);
      const validExtension = allowedImageExtensions.includes(extension);

      if (!(validMime || validExtension)) {
        return cb(new Error("Invalid thumbnail format"));
      }
      return cb(null, true);
    }
    return cb(new Error("Unexpected file field"));
  },
});
