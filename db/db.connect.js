const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGO_DB;

const initializeDatabase = async () => {
  try {
    const connection = await mongoose.connect(mongoURI);

    if (connection) {
      console.log("Database connected successfully.");
    }
  } catch (error) {
    console.log("Database connection failed.", error);
  }
};

module.exports = { initializeDatabase };
