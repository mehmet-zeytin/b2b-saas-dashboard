import "dotenv/config";

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`De omgevingsvariabele ${name} ontbreekt.`);
  }

  return value;
}

function getPort(): number {
  const value = process.env.PORT ?? "5000";
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("De ingestelde serverpoort is ongeldig.");
  }

  return port;
}

export const env = {
  port: getPort(),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  databaseUrl: getRequiredEnvironmentVariable("DATABASE_URL"),
};