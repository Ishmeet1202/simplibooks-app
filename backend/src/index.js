import connectDB from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config({ path: "./env" });

try {
  await connectDB();

  app.on("error", (error) => {
    console.log(`Server starting error !! ERROR: ${error.message}`);
    process.exit(1);
  });

  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on PORT: ${process.env.PORT || 3000}`);
  });
} catch (error) {
  console.log(`MONGO DB connection failed !! ERROR: ${error.message}`);
  process.exit(1);
}
