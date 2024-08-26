import { Client, Databases, Storage } from 'appwrite';

const client = new Client();
client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL!).setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);
const storage = new Storage(client);

export { client, database, storage };
