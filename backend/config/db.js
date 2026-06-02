import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`connected to MongoDB ${mongoose.connection.db.databaseName}`);
    
  } catch (error) {
    console.error("MongoDB connection failed.", error);
    process.exit(1)
  }
};

export default connectDB