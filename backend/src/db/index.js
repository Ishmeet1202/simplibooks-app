import mongoose from "mongoose";

async function connectDB() {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}`
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
