const videoModel = require("../models/video.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponce");
const asyncHandler = require("../utils/asyncHandeler");
const {
  uploadOnCloudinary,
  deleteFileOnCloudinary,
} = require("../utils/fileHandler");

exports.uplodVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;

  const owner = req.user?._id;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fildes are requred");
  }

  const videoFile = req.files?.video[0]?.path;
  const thumbnailFile = req.files?.thumbnail[0]?.path;
  if (!videoFile || !thumbnailFile) {
    throw new ApiError(400, "vide and thumbnail is requred");
  }

  const [videoUpload, thumbnailUpload] = await Promise.all([
    uploadOnCloudinary(videoFile),
    uploadOnCloudinary(thumbnailFile),
  ]);
  if (!videoUpload) {
    await deleteFileOnCloudinary(thumbnailUpload?.public_id, "image");
    throw new ApiError(500, "video upload failed");
  }
  if (!thumbnailUpload) {
    await deleteFileOnCloudinary(videoUpload.public_id, "video");
    throw new ApiError(500, "thumbnail upload failed");
  }
  try {
    const video = await videoModel.create({
      videoFile: {
        url: videoUpload.secure_url,
        public_id: videoUpload.public_id,
        playbackUrl: videoUpload.playback_url,
      },
      thumbnail: {
        url: thumbnailUpload.secure_url,
        public_id: thumbnailUpload.public_id,
      },
      duration: videoUpload.duration,
      title,
      description,
      isPublished,
      owner,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video uploaded successfully"));
  } catch (error) {
    await deleteFileOnCloudinary(videoUpload.public_id, "video");
    await deleteFileOnCloudinary(thumbnailUpload.public_id, "image");
    throw new ApiError(
      500,
      "Video upload is temporarily unavailable. Please try again later."
    );
  }
});

exports.getOwnVideo = asyncHandler(async (req, res) => {
  const user_id = req.user._id;
  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const limit = 10;
   
  const Aggregate = videoModel.aggregate([
    {
      $match: {
        owner: user_id,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
  // console.log("vieo", Aggregate);

  const Videos = await videoModel.aggregatePaginate(Aggregate, {
    page,
    limit,
  });
  // console.log(Videos);

  return res
    .status(200)
    .json(new ApiResponse(200, Videos, "Your videos fetched successfully"));
});

/*exports.videoDraft = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const videoId = await videoModel.create({
    owner: userId,
    isPublished: false,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, videoId._id, "Draft created successfully"));
});

exports.videoUploader = asyncHandler(async (req, res) => {
  const localFilepath = req.file?.path;
  if (!localFilepath) {
    throw new ApiError(400, "video file not found");
  }

  const videoUrl = await uploadOnCloudinary(localFilepath);

  if (!videoUrl) {
    throw new ApiError(500, "Video upload service is temporarily unavailable");
  }
  videoModel.findByIdAndUpdate({

  })
});*/
