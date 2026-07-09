import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import subscriberRoutes from "./routes/subscribeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productAdminRoutes from "./routes/productAdminRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import AppError from "./utils/appError.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { getAccessTokenSecret } from "./utils/tokenConfig.js";
import { logMiddleware } from "./middlewares/logMiddleware.js";
import {
  globalLimiter,
  globalLimiterKey,
  makeLimiterMiddleware,
  shouldSkipGlobalRateLimit,
} from "./middlewares/rateLimiter.js";

dotenv.config();
const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(logMiddleware);

// Soft auth: attaches req.user when a valid access token is present, but
// never blocks the request if it's missing/invalid/expired. This lets the
// global rate limiter key on the authenticated user's ID instead of IP,
// so multiple logged-in users behind the same IP (NAT, office network,
// mobile carrier) don't share one rate-limit bucket.
//
// This is intentionally lightweight (no DB lookup) - it only decodes the
// token to get the user ID for rate-limit keying. The real `authenticate`
// middleware still runs on protected routes and overwrites req.user with
// the full user document from the DB.
app.use((req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (token) {
      const decoded = jwt.verify(token, getAccessTokenSecret());
      req.user = { id: decoded?.user?.id };
    }
  } catch {
    // Invalid/expired token - treat as anonymous, don't block the request.
  }
  next();
});

app.use(
  makeLimiterMiddleware(
    globalLimiter,
    globalLimiterKey,
    shouldSkipGlobalRateLimit,
  ),
);

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscribe", subscriberRoutes);
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const message = err.message || "Internal server error";
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: message });
});

if (process.env.VERCEL !== "1") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

export default app;
