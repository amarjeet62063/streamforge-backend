const { registerUser, loginUser, LogoutUser } = require("../controllers/user.controller");
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

userRoute.route("/logout").post(verifyJWT, LogoutUser);

module.exports = userRoute;
