const appHealth = require("../app-Health");

const HealthRoute = require("express").Router();

HealthRoute.route("/health").get(appHealth);

module.exports = HealthRoute;
