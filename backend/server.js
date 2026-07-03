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
import { logMiddleware } from "./middlewares/logMiddleware.js";
import { makeLimiterMiddleware } from "./middlewares/rateLimiter.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";

dotenv.config();
const app = express();
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
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

connectDB();

//logMiddleware
app.use(logMiddleware);
app.use(makeLimiterMiddleware(globalLimiter, (request) => request.ip));

//API routes
//user routes
app.use("/api/users", userRoutes);

//product routes
app.use("/api/products", productRoutes);

//cart routes
app.use("/api/cart", cartRoutes);

//checkout routes
app.use("/api/checkout", checkoutRoutes);

//order routes
app.use("/api/orders", orderRoutes);

//upload image route
app.use("/api/upload", uploadRoutes);

//subscribe routes
app.use("/api/subscribe", subscriberRoutes);

//admin routes
//user routes for admin
app.use("/api/admin/users", adminRoutes);

//products routes for admin
app.use("/api/admin/products", productAdminRoutes);

//orders routes for admin
app.use("/api/admin/orders", adminOrderRoutes);

// handle unknown routes (404) and forward to global error handler
/**
 * the following is a pathless middleware for handling unknown routes
 * should be used as the last middleware*
 */
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const message = err.message || "Enternal server error";
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
