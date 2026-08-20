const express = require("express");
const cookieParser = require("cookie-parser");
const cros = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cros({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(express.static("public"));
app.use(cookieParser());

//Routes import
const userRoute = require("./routes/user.route");
const HistoryRoute = require("./routes/history.route");
const videoRoute = require("./routes/video.route");
const subscriptionRoute = require("./routes/subscription.route");

//routes declaration
app.use("/api/v1/users", userRoute);
app.use("/api/v1/subscription", subscriptionRoute);
app.use("/api/v1/video", videoRoute);
app.use("/api/v1/history", HistoryRoute);

module.exports = app;
