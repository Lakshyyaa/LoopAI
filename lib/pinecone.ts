import { Pinecone } from "@pinecone-database/pinecone";

// Initialize the Pinecone client with the API key from environment variables
const pc = new Pinecone({
  apiKey: process.env.PINECONE || "",
});

export {pc}
