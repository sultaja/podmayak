import { Client, Storage, ID } from "appwrite";

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6937f2750038f858caad');

const storage = new Storage(client);

// Make sure to create a bucket with this ID in your Appwrite Console
// and set permissions to Role: "Any" -> Read
export const BUCKET_ID = '6937f3cb003b83bc1b7c';

export { client, storage, ID };