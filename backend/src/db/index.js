import mongoose from "mongoose";
import { DEV_DB_NAME } from "../constants.js";

async function connectDB() {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${DEV_DB_NAME}`
    );
    console.log(
      `MONGO DB connected !!! Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`MONGO DB connection error !! ERROR: ${error.message}`);
    process.exit(1);
  }
}

export default connectDB;
