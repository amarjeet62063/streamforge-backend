const {
  subscriptionToggel,
} = require("../controllers/subscription.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

const subscriptionRoute = require("express").Router();

subscriptionRoute.route("/s/:channelId").post(verifyJWT, subscriptionToggel);

module.exports = subscriptionRoute;
