import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import helmet from "helmet"

dotenv.config();
const app = express();
app.use(cors());
app.use(helmet())
app.use(express.json());
app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to RABBIT API!");
});

//API routes
//user routes
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  const message = err.message || "Enternal server error";
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(message);
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
