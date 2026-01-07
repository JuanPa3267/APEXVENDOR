// lib/utils.ts
import crypto from "crypto";

/**
 * Genera un token de nombre de usuario pseudo-único.
 * Basado en la lógica de registerstuff.py.
 * El formato es: "{base}-{name}-{hashprefix}".
 */
export function generateUsername(
  name: string = "user",
  base: string = "p",
  length: number = 8
): string {
  // Generamos un string aleatorio (equivalente a random.choices en Python)
  const randomStr = crypto.randomBytes(16).toString("hex");

  // Creamos el hash SHA256 (equivalente a hashlib.sha256)
  const hash = crypto.createHash("sha256").update(randomStr).digest("hex");

  // Tomamos la primera parte del nombre y el prefijo del hash
  const firstName = name.toLowerCase().split(" ")[0];

  return `${base}-${firstName}-${hash.substring(0, length)}`;
}
