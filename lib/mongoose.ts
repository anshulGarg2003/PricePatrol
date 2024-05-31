import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGO_URI) console.log("MONGO_URI is not defined");

  if (isConnected) return console.log("=> ALready Connected");

  try {
    await mongoose.connect(process.env.MONGO_URI!);

    isConnected = true;

    console.log("Database is Connected");
  } catch (error) {
    console.log("Error while Connecting", error);
  }
};
