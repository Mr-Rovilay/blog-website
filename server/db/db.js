import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("mongodb connected to database"))
  .catch((err) => console.log(err));

mongoose.set("strictQuery", true);
