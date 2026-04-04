import express from "express";
import { connectToDatabase } from "./db/mongo";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { feedRouter } from "./routes/feed.routes";
import { ensureFeedIndexes, getUploadStaticPath } from "./controllers/feed.controller";
import { errorHandler } from "./middlewares/error";
import { notFound } from "./utils/http";

const app = express();

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Access-Control-Allow-Origin", env.FRONTEND_ORIGIN);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(`/${env.UPLOAD_DIR}`, express.static(getUploadStaticPath(), { immutable: true, maxAge: "7d" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api", feedRouter);

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  await connectToDatabase();
  await ensureFeedIndexes();

  app.listen(env.PORT, () => {
    console.log(`Backend running at http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
