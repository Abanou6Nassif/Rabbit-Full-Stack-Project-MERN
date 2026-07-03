import userModel from "../../models/user/User.js";
import catchError from "../../utils/catchError.js";
import AppError from "../../utils/appError.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { getAuthCookieOptions } from "../../utils/cookieOptions.js";
import {
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
  userValidationSchema,
} from "../../models/user/userValidationSchema.js";

const getFrontendBaseUrl = (req) =>
  (
    process.env.FRONTEND_URL ||
    process.env.FRONTEND_ORIGIN?.split(",")[0]?.trim() ||
    req.headers.origin ||
    "http://localhost:5173"
  ).replace(/\/$/, "");

const buildResetEmail = ({ name, resetUrl }) => ({
  text: `Hi ${name || "there"},\n\nWe received a request to reset your Rabbit password. Use the link below to choose a new password:\n${resetUrl}\n\nThis link expires in 10 minutes. If you did not request this, you can safely ignore this email.`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 16px;">Reset your Rabbit password</h2>
      <p>Hi ${name || "there"},</p>
      <p>We received a request to reset your Rabbit password. Use the button below to choose a new password.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;">Reset password</a>
      </p>
      <p style="margin-top: 20px;">If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 10 minutes. If you did not request this, you can ignore this email.</p>
    </div>
  `,
});

const sendResetEmail = async ({ to, name, resetUrl }) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return { sent: false };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const emailContent = buildResetEmail({ name, resetUrl });

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || smtpUser,
      to,
      subject: "Reset your Rabbit password",
      text: emailContent.text,
      html: emailContent.html,
    });

    return { sent: true };
  } catch (error) {
    console.error("Password reset email failed", {
      to,
      smtpHost,
      smtpUser,
      code: error.code,
      message: error.message,
      response: error.response,
      command: error.command,
    });

    throw new AppError(
      error.response || error.message || "Password reset email failed to send",
      502,
    );
  }
};

/**
 * register controller
 */
const register = catchError(async (req, res) => {
  let { error, value } = userValidationSchema.validate(req.body, {
    allowUnknown: false,
  });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const { name, email, password } = value;

  let user = await userModel.findOne({ email });

  if (user) throw new AppError("User already exists", 400);

  user = await userModel.create({ name, email, password });

  const payload = { user: { id: user._id, role: user.role } };
  try {
    user.generateToken(res, payload);
  } catch (error) {
    throw new AppError("Internal Server Error", 500);
  }

  res.status(201).json({
    message: "Account created successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * login controller
 */
const login = catchError(async (req, res) => {
  const { email, password } = req.body;

  // find the user in the DB
  let user = await userModel.findOne({ email });

  if (!user) throw new AppError("Invalid Credentials", 400);

  const isMatch = await user.matchPassword(password);

  if (!isMatch) throw new AppError("Invalid Credentials", 400);

  const payload = { user: { id: user._id, role: user.role } };
  try {
    user.generateToken(res, payload);
  } catch (error) {
    throw new AppError("Internal Server Error", 500);
  }

  res.status(201).json({
    message: "Logged in Successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * profile controller
 */
const profile = catchError(async (req, res) => {
  res.status(200).json(req.user);
});

/**
 * logout controller
 */
const logout = catchError(async (req, res) => {
  res.clearCookie("jwt", getAuthCookieOptions());
  res.status(200).json({ message: "Logged out successfully" });
});

const forgotPassword = catchError(async (req, res) => {
  const { error, value } = forgotPasswordValidationSchema.validate(req.body, {
    allowUnknown: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const { email } = value;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(200).json({
      message:
        "If an account exists for that email, a password reset link has been sent.",
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save();

  const resetUrl = `${getFrontendBaseUrl(req)}/reset-password/${resetToken}`;

  const { sent } = await sendResetEmail({
    to: user.email,
    name: user.name,
    resetUrl,
  });

  return res.status(200).json({
    message: sent
      ? "Password reset link sent to your email address."
      : "Password reset link generated.",
    resetUrl: sent ? undefined : resetUrl,
  });
});

const resetPassword = catchError(async (req, res) => {
  const { error, value } = resetPasswordValidationSchema.validate(req.body, {
    allowUnknown: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await userModel.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Reset token is invalid or has expired", 400);
  }

  user.password = value.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return res.status(200).json({
    message: "Password reset successfully",
  });
});

export { register, login, profile, logout, forgotPassword, resetPassword };
