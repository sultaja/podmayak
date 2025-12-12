import { Client, Storage, ID } from "appwrite";

// Get Appwrite configuration from environment variables
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '6937f2750038f858caad';
const APPWRITE_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || '6937f3cb003b83bc1b7c';

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const storage = new Storage(client);

// Export bucket ID for use in services
export const BUCKET_ID = APPWRITE_BUCKET_ID;

export { client, storage, ID };
