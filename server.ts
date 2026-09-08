import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { CONFIG } from "./server/config/env";
import { connectDatabase, closeDatabase } from "./server/config/db";
import apiRouter from "./server/routes";
import { errorHandler } from "./server/middleware/errorHandler";

const app = express();
const PORT = CONFIG.PORT;

// Security & Parsing Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Mount Modular API Routes
app.use("/api", apiRouter);

// Centralized Error Handler (Phase 6)
app.use(errorHandler);

// Vite middleware & Static serving
async function startServer() {
  // Connect to database in the background
  connectDatabase().catch((err) => {
    console.warn("Database initialization warning:", err.message);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false, // Prevents port conflicts; HMR is disabled in this environment
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const listenPort = PORT;

  function listenWithRetry(retries = 8, delayMs = 600) {
    const server = app.listen(listenPort, "0.0.0.0", () => {
      console.log(`Exploro India server running on http://0.0.0.0:${listenPort} (Mode: ${CONFIG.NODE_ENV})`);
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE" && retries > 0) {
        console.warn(`Port ${listenPort} is busy, retrying in ${delayMs}ms... (${retries} retries left)`);
        setTimeout(() => {
          listenWithRetry(retries - 1, delayMs);
        }, delayMs);
      } else {
        console.error("Server listen error:", err);
        process.exit(1);
      }
    });

    const gracefulExit = async () => {
      console.log("Shutting down Exploro India server cleanly...");
      await closeDatabase();
      server.close(() => {
        process.exit(0);
      });
    };

    process.once("SIGTERM", gracefulExit);
    process.once("SIGINT", gracefulExit);
  }

  listenWithRetry();
}

startServer();
