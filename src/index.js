const dotenv = require("dotenv");
const connectDB = require("./db/dbIndex");
const app = require("./app");

dotenv.config({ quiet: true });

connectDB()
  .then(() => {
    const server = app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running at port:${process.env.PORT}`);
    });
    server.on("error", (err) => {
      console.log("Error while listen app", err);
    });
  })

  .catch((err) => {
    console.log("MONGODB connection failde !!!", err);
  });
