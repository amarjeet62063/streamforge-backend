const {
  registerUser,
  loginUser,
  LogoutUser,
  genNewAccesToken,
  getUserChannelProfile,
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
userRoute.route("/c/:userName").get(verifyJWT, getUserChannelProfile);
module.exports = userRoute;
