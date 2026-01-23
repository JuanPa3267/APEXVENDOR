import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool as PgPool } from "pg";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;

  const pool = new PgPool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    options: "-c search_path=ApexVendor,public",
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter, log: ["query", "error", "warn"] });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
