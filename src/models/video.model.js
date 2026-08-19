const mongoose = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const VideoSchema = new mongoose.Schema(
  {
    videoFile: {
      url: { type: String, required: true },
      public_id: {
        type: String,
        required: true,
      },
      playbackUrl: {
        type: String,
        required: true,
      },
    },
    thumbnail: {
      url: { type: String, required: true },
      public_id: {
        type: String,
        required: true,
      },
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
VideoSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model("Video", VideoSchema);
