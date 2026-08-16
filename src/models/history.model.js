const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    watchAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

watchHistorySchema.index({ userId: 1, videoId: 1 }, { unique: true });
watchHistorySchema.index({ userId: 1, watchAt: -1 });

module.exports = mongoose.model("WatchHistory", watchHistorySchema);
