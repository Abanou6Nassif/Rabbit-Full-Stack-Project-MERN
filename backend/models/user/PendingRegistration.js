import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    verificationToken: {
      type: String,
      required: true,
      index: true,
    },
    verificationTokenExpire: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("PendingRegistration", pendingRegistrationSchema);