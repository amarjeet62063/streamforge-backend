const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandeler");
const User = require("../models/user.models");
const WatchHistory = require("../models/history.model");
const {
  uploadOnCloudinary,
  deleteFileOnCloudinary,
} = require("../utils/fileHandler");
const ApiResponse = require("../utils/ApiResponce");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const genrateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.genrateAccessToken();
    const refreshToken = user.genrateRefresssToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

exports.registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, userName, password } = req.body;
  // console.log("first",req.body);

  if (
    [fullName, email, userName, password].some((filde) => filde?.trim() === "")
  ) {
    throw new ApiError(400, "All fildes are required ");
  }
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email or username already exists");
  }
  // console.log("3", req.body);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log("4", avatarLocalPath,coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "error while uplode avatar on cloudinary");
  }
  // console.log("5", avatar);

  const user = await User.create({
    fullname: fullName,
    avatar: {
      url: avatar.secure_url,
      public_id: avatar.public_id,
    },
    coverimage: {
      url: coverImage.secure_url || "",
      public_id: coverImage.public_id || "",
    },
    email,
    password,
    username: userName,
  });
  // console.log("hii");

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createduser) {
    throw new ApiError(500, "Somthing went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createduser, "User registered Succesfully"));
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!(email || username)) {
    throw new ApiError(400, "userName or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValide = await user.isPasswordCorrect(password);
  if (!isPasswordValide) {
    throw new ApiError(401, "Invalide user crendential");
  }
  const { refreshToken, accessToken } =
    await genrateAccessTokenAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    " -password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
      }),
      "User loggedIn successfully"
    );
});

exports.LogoutUser = asyncHandler(async (req, res) => {
  const _id = req.user._id;
  await User.findByIdAndUpdate(
    _id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

exports.genNewAccesToken = asyncHandler(async (req, res) => {
  const clientRefreshToken =
    req.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer", "");

  try {
    if (!clientRefreshToken) {
      throw new ApiError(401, "Unauthorised Request");
    }
    const decodeClientRefreshToken = jwt.verify(
      clientRefreshToken,
      process.env.REFERESH_TOKEN_SECRET
    );
    const user = await User.findById(decodeClientRefreshToken._id);

    if (!user) {
      throw new ApiError(401, "invalide Refresh Token");
    }

    if (clientRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "RefreshToken used or expired");
    }
    const { newRefreshToken, accessToken } =
      await genrateAccessTokenAndRefreshTokens(user._id);

    const option = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", newRefreshToken, option)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: accessToken,
            refreshToken: newRefreshToken,
          },
          "RefreshToken refreshed Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalide refreshToken");
  }
});

//User profile updetion controllers
exports.UpdateOldePassword = asyncHandler(async (req, res) => {
  const { oldePassword, newPassword } = req.body;
  if (!oldePassword || !newPassword) {
    throw new ApiError(400, "Please enter NewPassword and OldePassword");
  }
  const user = await User.findById(req.user?._id);
  const isPasswordcorrect = await user.isPasswordCorrect(oldePassword);
  if (!isPasswordcorrect) {
    throw new ApiError(401, "incorrect oldePassword");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change Successfully"));
});

exports.UpdateUserDetails = asyncHandler(async (req, res) => {
  const { newfullname, newemail } = req.body;

  if (!newfullname || !newemail) {
    throw new ApiError(400, "Please enter fullname and email");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: newfullname,
        email: newemail,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(500, "error while update user details");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "fullname and Email has been updated Successfully"
      )
    );
});

exports.UpdateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Not found avatar file");
  }

  const uplodedOnDbfilePath = await uploadOnCloudinary(avatarLocalPath);
  if (!uplodedOnDbfilePath) {
    throw new ApiError(500, "Error while uplode avatar File on cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: {
          url: uplodedOnDbfilePath.secure_url,
          public_id: uplodedOnDbfilePath.public_id,
        },
      },
    },
    { new: true }
  ).select(" -password -refreshToken");

  if (!user) {
    throw new ApiError(500, "User avatar updetion error");
  }
  const deletOldeAvatar = await deleteFileOnCloudinary(
    req.user.avatar.public_id,
    "image"
  );
  if (!deletOldeAvatar) {
    throw new ApiError(500, "error while delete old avatar from cloudinary");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar changed Successfully"));
});

exports.UpdateUserCoverimage = asyncHandler(async (req, res) => {
  const coverimageLocalPath = req.file?.path;

  if (!coverimageLocalPath) {
    throw new ApiError(400, "Not found coverimage file");
  }

  const uplodedOnDbfilePath = await uploadOnCloudinary(coverimageLocalPath);
  if (!uplodedOnDbfilePath) {
    throw new ApiError(500, "Error while uplode coverimage File on cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverimage: uplodedOnDbfilePath?.secure_url,
      },
    },
    { new: true }
  ).select(" -password -refreshToken");

  if (!user) {
    throw new ApiError(500, "User coverimage updetion error");
  }
  const deletOldeCoverimage = await deleteFileOnCloudinary(
    req.user.avatar.public_id,
    "image"
  );
  if (!deletOldeCoverimage) {
    throw new ApiError(
      500,
      "error while delete old Coverimage from cloudinary"
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverimage changed Successfully"));
});

exports.getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  return res
    .status(200)
    .json(
      new ApiResponse(200, currentUser, "Feched current user Successfully")
    );
});

exports.getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userId, userName } = req.query;

  if (!(userName?.trim() || userId?.trim())) {
    throw new ApiError(400, "userName or userId is required");
  }
  const match = userName?.trim()
    ? { username: userName.trim().toLowerCase() }
    : { _id: new mongoose.Types.ObjectId(userId) };

  const channel = await User.aggregate([
    {
      $match: match,
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscriberInfo",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscriberInfo",
        },
        subscribToCount: {
          $size: "$subscribTo",
        },

        isSubscribed: {
          $in: [req.user?._id, "$subscriberInfo.subscriber"],
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        avatar: 1,
        coverimage: 1,
        subscriberCount: 1,
        subscribToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);
  console.log(channel);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

exports.getUserVideoHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const history = await WatchHistory.find({ userId })
    .populate("videoId", " title thumbnail owner duration")
    .sort({ watchAt: -1 });
  if (!history) {
    throw new ApiError(400, "History not founde");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, history, "History fetched successfully"));
});
