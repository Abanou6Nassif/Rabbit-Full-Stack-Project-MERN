import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const isVercel = process.env.VERCEL === "1";

let logStream = null;

if (!isVercel) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  logStream = fs.createWriteStream(path.join(__dirname, "..", "requests.log"), {
    flags: "a",
  });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;

  if (isVercel) {
    console.log(line.trim());
    return;
  }

  logStream?.write(line);
}

export const logMiddleware = (req, res, next) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  log(`=> START [${requestId}] ${req.method} ${req.url}`);

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    log(
      `<= END [${requestId}] ${req.method} ${req.url} | Status: ${res.statusCode} | ${duration}ms`,
    );
  });

  res.on("close", () => {
    const duration = Date.now() - startTime;
    if (!res.writableEnded) {
      log(
        `X ABORT [${requestId}] ${req.method} ${req.url} | Client disconnected ${duration}ms`,
      );
    }
  });

  req.requestId = requestId;

  next();
};
