import { describe, expect, test } from "bun:test";
import { db } from "./db";

describe("Database Connection - Prisma (Caja Blanca)", () => {
  test("Debería conectar a la base de datos y leer la versión", async () => {
    // Intentamos una operación ultra simple que no modifique nada
    // Esto valida que el DATABASE_URL del .env sea correcto
    try {
      const result = await db.$queryRaw`SELECT 1 as connected`;
      expect(result).toBeDefined();
      console.log("Conexión a PostgreSQL exitosa.");
    } catch (error) {
      console.error("Error de conexión DB:", error);
      throw error;
    }
  });
});
