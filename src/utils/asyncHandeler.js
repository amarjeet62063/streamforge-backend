const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    const statusCode = typeof error.code === "number" ? error.code : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = asyncHandler;

// const hand = (fn) => {
//   (req, res, next) => {
//     Promise.resolve(fn(req, res, next)).catch((err) => {
//       next(err);
//     });
//   };
// };
