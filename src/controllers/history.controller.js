const asyncHandler = require("../utils/asyncHandeler");
const WatchHistory = require("../models/history.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponce");

exports.addHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  const history = await WatchHistory.findByIdAndUpdate(
    {
      videoId,
      userId,
    },
    {
      $set: {
        watchAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  if (!history) {
    throw new ApiError(400, "History not founde");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "History added successfully"));
});
