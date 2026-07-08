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

// Rate limiting — protect against brute force and credential stuffing in production.
// In development both client apps run on localhost and make automated background
// calls (silent /refresh on every page load, parallel dashboard fetches, etc.)
// that would trivially exhaust any shared per-IP limit. We skip the limiter
// entirely for loopback IPs in development.
const isDev = process.env.NODE_ENV !== "production";

function isLoopback(req) {
  const ip = req.ip || req.socket?.remoteAddress || "";
  // IPv4 loopback, IPv6 loopback, IPv4-mapped-in-IPv6 loopback
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("::ffff:127."))
    return true;
  // Also check X-Forwarded-For in case a local reverse proxy is in front
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (
      first === "127.0.0.1" ||
      first === "::1" ||
      first.startsWith("::ffff:127.")
    )
      return true;
  }
  return false;
}

// Global limiter: in dev, skip entirely for loopback; in prod use env or 300.
// IMPORTANT: don't set RATE_LIMIT_MAX in your dev .env — it overrides the
// generous dev default. Only set it in production.
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: isDev ? 10000 : parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isDev ? isLoopback : undefined,
});

// /refresh is called automatically on every page load to silently renew the
// session — it doesn't benefit from strict rate limiting even in production
// since it requires a valid signed httpOnly cookie.
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isDev ? isLoopback : undefined,
});

app.use("/api/auth/refresh", refreshLimiter);
app.use("/api", globalLimiter);

// Static file serving for locally-stored uploads (downloads, photos, doctor headshots, etc.)
app.use("/uploads", express.static(UPLOAD_DIR));

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
