const mongoose = require("mongoose");
const { DB_NAME } = require("../constants");


const connectDB = async () => {
  try {

    const connectioIntance = await mongoose.connect(
      `${process.env.MONGOOS_DB}/${DB_NAME}`
    );
    console.log(
      `\n mongoDB connected !! DB HOST : ${connectioIntance.connection.host}`
    );
  } catch (error) {
    console.log("Mongoose connection error ", error);
    process.exit(1);
  }
};

module.exports = connectDB;
