import userModel from "../../models/user/User.js";
import pendingRegistrationModel from "../../models/user/PendingRegistration.js";
import catchError from "../../utils/catchError.js";
import AppError from "../../utils/appError.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcrypt";
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

const buildVerificationEmail = ({ name, verifyUrl }) => ({
  text: `Hi ${name || "there"},\n\nPlease verify your Rabbit account by opening the link below:\n${verifyUrl}\n\nThis link expires in 24 hours. If you did not create this account, you can ignore this email.`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 16px;">Verify your Rabbit account</h2>
      <p>Hi ${name || "there"},</p>
      <p>Please verify your email address by clicking the button below.</p>
      <p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;">Verify email</a>
      </p>
      <p style="margin-top: 20px;">If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 24 hours. If you did not create this account, you can ignore this email.</p>
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

const sendVerificationEmail = async ({ to, name, verifyUrl }) => {
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

  const emailContent = buildVerificationEmail({ name, verifyUrl });

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || smtpUser,
      to,
      subject: "Verify your Rabbit email address",
      text: emailContent.text,
      html: emailContent.html,
    });

    return { sent: true };
  } catch (error) {
    console.error("Verification email failed", {
      to,
      smtpHost,
      smtpUser,
      code: error.code,
      message: error.message,
      response: error.response,
      command: error.command,
    });

    throw new AppError(
      error.response || error.message || "Verification email failed to send",
      502,
    );
  }
};

const createVerificationToken = () => {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenHash = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  return { verificationToken, verificationTokenHash };
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

  const pendingRegistration = await pendingRegistrationModel.findOne({ email });
  const hashedPassword = await bcrypt.hash(password, 10);
  const { verificationToken, verificationTokenHash } = createVerificationToken();
  const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
  let pendingRegistrationRecord = pendingRegistration;

  if (pendingRegistration) {
    pendingRegistration.name = name;
    pendingRegistration.password = hashedPassword;
    pendingRegistration.verificationToken = verificationTokenHash;
    pendingRegistration.verificationTokenExpire = verificationTokenExpire;
    await pendingRegistration.save();
  } else {
    pendingRegistrationRecord = await pendingRegistrationModel.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: verificationTokenHash,
      verificationTokenExpire,
    });
  }

  const verifyUrl = `${getFrontendBaseUrl(req)}/verify-email/${verificationToken}`;

  try {
    await sendVerificationEmail({
      to: email,
      name,
      verifyUrl,
    });

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new AppError("Email service is not configured", 500);
    }
  } catch (error) {
    await pendingRegistrationModel.deleteOne({ _id: pendingRegistrationRecord._id });
    throw error;
  }

  res.status(201).json({
    message: "Verification email sent. Please verify your email to activate your account.",
  });
});

const verifyEmail = catchError(async (req, res) => {
  const verificationTokenHash = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const pendingRegistration = await pendingRegistrationModel.findOne({
    verificationToken: verificationTokenHash,
    verificationTokenExpire: { $gt: Date.now() },
  });

  if (!pendingRegistration) {
    throw new AppError("Verification token is invalid or has expired", 400);
  }

  const existingUser = await userModel.findOne({ email: pendingRegistration.email });
  if (existingUser) {
    await pendingRegistration.deleteOne();
    throw new AppError("User already exists", 400);
  }

  const user = await userModel.create({
    name: pendingRegistration.name,
    email: pendingRegistration.email,
    password: pendingRegistration.password,
    role: pendingRegistration.role,
  });

  await pendingRegistration.deleteOne();

  const payload = { user: { id: user._id, role: user.role } };
  try {
    user.generateToken(res, payload);
  } catch (error) {
    throw new AppError("Internal Server Error", 500);
  }

  return res.status(200).json({
    message: "Email verified successfully",
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
  console.log(user, "line 190");

  if (!user) {
    return res.status(200).json({
      message:
        "If an account exists for that email, a password reset link has been sent.",
    });
  }

  const resetToken = user.createPasswordResetToken();
    console.log(resetToken, "line 190");

 const userSaved = await user.save();

 console.log(userSaved, "202");
 

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

export { register, verifyEmail, login, profile, logout, forgotPassword, resetPassword };
