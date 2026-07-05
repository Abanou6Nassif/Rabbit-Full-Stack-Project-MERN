import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../../utils/cookieOptions.js";
import {
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
  getAccessTokenSecret,
  getRefreshTokenSecret,
} from "../../utils/tokenConfig.js";

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
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
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
  if (typeof this.password === "string" && this.password.startsWith("$2")) return;

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

//Generating jwt tokens
userSchema.methods.generateAuthTokens = function (res, payload) {
  const accessToken = jwt.sign(payload, getAccessTokenSecret(), {
    expiresIn: ACCESS_TOKEN_TTL_MS / 1000,
  });

  const refreshToken = jwt.sign(
    { user: { id: payload.user.id } },
    getRefreshTokenSecret(),
    {
      expiresIn: REFRESH_TOKEN_TTL_MS / 1000,
    },
  );

  res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
  res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

  return { accessToken, refreshToken };
};
//Exporting the model
export default mongoose.model("User", userSchema);
