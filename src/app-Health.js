const ApiResponse = require("./utils/ApiResponce");

const appHealth = (_, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, __dirname, "StreamForge backend is healthy"));
};

module.exports = appHealth;
