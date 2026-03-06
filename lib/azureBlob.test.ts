import { describe, expect, test } from "bun:test";
import { extractBlobNameFromUrl, parseAzureBlobUrl } from "./azureBlob";

describe("Azure Blob Utils - Caja Blanca", () => {
  const mockUrl =
    "https://apexstorage.blob.core.windows.net/certificaciones/user-123-cv.pdf";

  test("Debería extraer el nombre del blob correctamente dado un contenedor", () => {
    const name = extractBlobNameFromUrl(mockUrl, "certificaciones");
    expect(name).toBe("user-123-cv.pdf");
  });

  test("Debería parsear correctamente container y blob de una URL completa", () => {
    const { containerName, blobName } = parseAzureBlobUrl(mockUrl);
    expect(containerName).toBe("certificaciones");
    expect(blobName).toBe("user-123-cv.pdf");
  });

  test("Debería lanzar error si la URL es inválida", () => {
    expect(() => parseAzureBlobUrl("https://google.com")).toThrow();
  });
});
