import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";

const app = express();

const allowedOrigins = [
  env.frontendUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin(origin, callback) {
      // Postman, PowerShell en server-to-server verzoeken hebben geen origin.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(
        new Error(
          `De oorsprong ${origin} is niet toegestaan door CORS.`
        )
      );
    },
    methods: [
      "GET",
      "POST",
      "PATCH",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "De server werkt correct.",
  });
});

// Registreert alle API-routes onder /api.
app.use("/api", apiRoutes);

// Moet na alle geldige routes staan.
app.use(notFoundMiddleware);

// Moet als laatste middleware worden geregistreerd.
app.use(errorMiddleware);

export default app;