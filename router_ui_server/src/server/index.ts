import express, { Express } from "express";
import cors from "cors";
import routersRouter from "./routes/routers";
import stateRouter from "./routes/state";
import { errorHandler } from "./middleware/error-handler";
import { ensureDirs } from "./services/state-manager";

async function main(): Promise<void> {
  await ensureDirs();

  const app: Express = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/routers", routersRouter);
  app.use("/api/routers", stateRouter);
  app.use(errorHandler);

  const PORT: number = process.env.PORT ? Number(process.env.PORT) : 4000;
  app.listen(PORT, (): void =>
    console.log(`Router simulator running on :${PORT}`)
  );
}

main().catch((e: unknown): void => {
  console.error("Failed to start server:", e);
  process.exit(1);
});