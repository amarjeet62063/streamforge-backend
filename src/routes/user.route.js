const {
  registerUser,
  loginUser,
  LogoutUser,
  genNewAccesToken,
  getUserChannelProfile,
  UpdateOldePassword,
  UpdateUserDetails,
  UpdateUserAvatar,
  UpdateUserCoverimage,
  getCurrentUser,
  getUserVideoHistory,
} = require("../controllers/user.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middlewares");

const userRoute = require("express").Router();

userRoute.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

userRoute.route("/login").post(loginUser);

//Secured Routes
userRoute.route("/logout").post(verifyJWT, LogoutUser);
userRoute.route("/refresh-token").post(genNewAccesToken);
userRoute.route("/change-password").patch(verifyJWT, UpdateOldePassword);
userRoute.route("/update-details").patch(verifyJWT, UpdateUserDetails);
userRoute
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), UpdateUserAvatar);
userRoute
  .route("/update-coverimage")
  .patch(verifyJWT, upload.single("coverimage"), UpdateUserCoverimage);
userRoute.route("/update-getcurrentuser").get(verifyJWT, getCurrentUser);
userRoute.route("/c/:userName").get(verifyJWT, getUserChannelProfile);

userRoute.route("/get-history").get(verifyJWT, getUserVideoHistory);

module.exports = userRoute;
