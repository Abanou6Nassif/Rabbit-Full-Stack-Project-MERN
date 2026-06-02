import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logStream = fs.createWriteStream(path.join(__dirname, "..","requests.log"), {
  flags: "a",
});

function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  logStream.write(line);
//   console.log(line.trim());
}

/***
 * the middle ware itself
 */
export const logMiddleware = (req, res, next) => {
  const requestId = crypto.randomUUID(); //unique id per Request
  const startTime = Date.now();

  log(`=> START [${requestId}] ${req.method} ${req.url}`);

  //Intercept when response finishes

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    log(
      `<= END [${requestId}] ${req.method} ${req.url} | Status: ${res.statusCode} | ${duration}ms`,
    );
  });

  //Intercepts if connection closed before response completes

  res.on("close", () => {
    const duration = Date.now() - startTime;
    if (!res.writableEnded) {
      log(
        `X ABORT [${requestId}] ${req.method} ${req.url} | Client disconnected ${duration}ms`,
      );
    }
  });

  req.requestId = requestId; //attach the requestId to the request

  next();
};
