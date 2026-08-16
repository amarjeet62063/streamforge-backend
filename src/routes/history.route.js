const { addHistory } = require("../controllers/history.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

const HistoryRoute = require("express").Router();

HistoryRoute.route("/h/:videoId").post(verifyJWT, addHistory);

module.exports = HistoryRoute;
