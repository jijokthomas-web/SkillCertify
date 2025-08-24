import express from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes";
import { initializeStorage } from "../../server/storage";

let cachedHandler: any;

async function createHandler() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  await initializeStorage();
  await registerRoutes(app);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  return serverless(app);
}

export const handler = async (event: any, context: any) => {
  if (!cachedHandler) {
    cachedHandler = await createHandler();
  }
  return cachedHandler(event, context);
};