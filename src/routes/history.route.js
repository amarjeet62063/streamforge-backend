const { addHistory } = require("../controllers/history.controller");

const HistoryRoute = require("express").Router();

HistoryRoute.route("/h/:videoId").post(addHistory);

module.exports = HistoryRoute;
