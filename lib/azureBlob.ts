import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  type BlockBlobClient,
} from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

function getBlockBlobClient(containerName: string, blobName: string): BlockBlobClient {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  return containerClient.getBlockBlobClient(blobName);
}

export async function uploadToAzureBlob(params: {
  containerName: string;
  blobName: string;
  file: File;
}) {
  const { containerName, blobName, file } = params;

  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();

  const blockBlobClient = getBlockBlobClient(containerName, blobName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: file.type || "application/octet-stream" },
  });

  return {
    url: blockBlobClient.url, // URL permanente (sin SAS)
    blobName,
    size: file.size,
    contentType: file.type,
  };
}

/** Borrar blob sabiendo contenedor y blobName (tu función original) */
export async function deleteFromAzureBlob(containerName: string, blobName: string) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
}

/** Extrae blobName desde una URL si ya conoces el container */
export function extractBlobNameFromUrl(fullUrl: string, containerName: string): string | null {
  try {
    const url = new URL(fullUrl);
    const prefix = `/${containerName}/`;
    if (url.pathname.startsWith(prefix)) {
      return decodeURIComponent(url.pathname.substring(prefix.length));
    }
    return null;
  } catch (error) {
    console.error("Error parsing blob URL:", fullUrl, error);
    return null;
  }
}

/** Extrae container + blobName desde una URL completa de Azure Blob */
export function parseAzureBlobUrl(blobUrl: string) {
  const u = new URL(blobUrl);
  const parts = u.pathname.split("/").filter(Boolean); // [container, ...blobPath]
  const containerName = parts[0];
  const blobName = parts.slice(1).join("/");
  if (!containerName || !blobName) throw new Error("URL de blob inválida");
  return { containerName, blobName };
}

/** Genera un SAS temporal de SOLO LECTURA para un blob guardado por URL */
export function getReadSasUrlFromBlobUrl(blobUrl: string, expiresInMinutes = 10) {
  const { containerName, blobName } = parseAzureBlobUrl(blobUrl);

  const now = new Date();
  const startsOn = new Date(now.getTime() - 5 * 60 * 1000); // ✅ anti clock-skew
  const expiresOn = new Date(now.getTime() + expiresInMinutes * 60 * 1000);

  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn,
      expiresOn,
    },
    sharedKeyCredential
  ).toString();

  const base = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
  return `${base}?${sas}`;
}


/** Borrar blob usando la URL guardada en la BD */
export async function deleteBlobByUrl(blobUrl: string) {
  const { containerName, blobName } = parseAzureBlobUrl(blobUrl);
  await deleteFromAzureBlob(containerName, blobName);
}
