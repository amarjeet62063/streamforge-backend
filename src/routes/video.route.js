const {
  uplodVideo,
  getOwnVideo,
  watchVideo,
  getAllVideo,
} = require("../controllers/video.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { videoUplodeValidetion } = require("../middlewares/multer.middlewares");

const videoRoute = require("express").Router();

videoRoute.route("/uplode-video").post(
  verifyJWT,
  videoUplodeValidetion.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uplodVideo
);

videoRoute.route("/my-video").get(verifyJWT, getOwnVideo);

videoRoute.route("/watch-video/:videoId").get(watchVideo);

videoRoute.route("/fetch-all-videos").get(getAllVideo);

module.exports = videoRoute;
