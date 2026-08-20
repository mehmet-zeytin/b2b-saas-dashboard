import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "./env.js";

// Maakt de PostgreSQL-adapter aan met de ingestelde databaseverbinding.
const adapter = new PrismaPg({
  connectionString: env.databaseUrl,
});

// Voorkomt meerdere Prisma Client-instanties tijdens ontwikkeling.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (env.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}