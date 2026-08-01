const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandeler");
const User = require("../models/user.models");

exports.verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }

  req.user = user;
  next(); 
});
