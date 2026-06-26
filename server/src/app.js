const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");

const apiRoutes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { UPLOAD_DIR } = require("./utils/storage");
const logger = require("./utils/logger");

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow <img>/<a> to load uploaded files from client origin
  }),
);

// CORS - restrict to the configured client origin(s), with credentials for the refresh-token cookie.
// CLIENT_URL can be a single origin or a comma-separated list (e.g. for running the admin panel
// and public site dev servers side by side on different Vite ports).
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, server-to-server) and any configured origin.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);

app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }),
);

// General API rate limit (auth routes have their own stricter limiter)
app.use(
  "/api",
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Static file serving for locally-stored uploads (downloads, photos, doctor headshots, etc.)
app.use("/uploads", express.static(UPLOAD_DIR));

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
