const express = require("express");
const cookieParser = require("cookie-parser");
const cros = require("cors");
require("dotenv").config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN?.split(",");

app.use(
  cros({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
