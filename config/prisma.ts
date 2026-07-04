import { PrismaClient } from "@prisma/client";

const MYSQL_URL = process.env.MYSQL_DATABASE_URL;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

function createClient(): PrismaClient | null {
  if (!MYSQL_URL || !MYSQL_URL.startsWith("mysql://")) return null;
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      datasources: { db: { url: MYSQL_URL } },
    });
  } catch {
    return null;
  }
}

export const prisma: PrismaClient = (globalForPrisma.prisma ?? createClient()) as PrismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function isMySQLReady(): boolean {
  return !!(MYSQL_URL && MYSQL_URL.startsWith("mysql://") && prisma);
}
