import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 25,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [
        /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      maxLength: 20,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  { timestamps: true },
);

//Password Hash Middleware
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Match User entered password to Hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

//Generating jwt token
userSchema.methods.generateToken = function (res, payload) {
  const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "40h",
  });

  //   secure: true,         // enforce HTTPS in production
  //   sameSite: "Strict"    // or "None" if you need cross-site
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });

  return token;
};
//Exporting the model
export default mongoose.model("User", userSchema);
