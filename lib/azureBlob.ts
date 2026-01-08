import {
    BlobServiceClient,
    StorageSharedKeyCredential,
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
        url: blockBlobClient.url, // OJO: como el contenedor es privado, para ver/descargar luego usarás SAS
        blobName,
        size: file.size,
        contentType: file.type,
    };
}

export async function deleteFromAzureBlob(containerName: string, blobName: string) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
}

export function extractBlobNameFromUrl(fullUrl: string, containerName: string): string | null {
    try {
        const url = new URL(fullUrl);
        // Pathname format: /containerName/blobName...
        // We want specifically the part AFTER /containerName/
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
