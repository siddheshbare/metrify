import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Prisma CLI doesn't read .env.local — load it explicitly
dotenv.config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma v7: URLs live here, not in schema.prisma
    // DIRECT_URL (non-pooled) is required for migrations against Neon
    // Runtime app uses DATABASE_URL (pooled) via PrismaClient constructor
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
