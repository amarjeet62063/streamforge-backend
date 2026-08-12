const Subscription = require("../models/subscription.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponce");


exports.subscriptionToggel = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  if (!channelId || !subscriberId) {
    throw new ApiError(400, "channelId and subscriberId both are required");
  }

  if (subscriberId.toString() === channelId) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const exsistSubscriber = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });

  if (exsistSubscriber) {
    await Subscription.findByIdAndDelete(exsistSubscriber._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isSubscribed: false },
          "Unsubscribed successfully"
        )
      );
  } else {
    await Subscription.create({
      subscriber: subscriberId,
      channel: channelId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { isSubscribed: true }, "Subscrib Successfully")
      );
  }
});
