import { Pinecone } from "@pinecone-database/pinecone";

// Initialize the Pinecone client with the API key from environment variables
const pc = new Pinecone({
  apiKey: process.env.PINECONE || "",
});

async function upsertVectors() {
  try {
    const index = pc.Index("quickstart");
    await index.namespace("ns1").upsert([
      {
        id: "vec1",
        values: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
        metadata: { genre: "drama" },
      },
      {
        id: "vec2",
        values: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
        metadata: { genre: "action" },
      },
      {
        id: "vec3",
        values: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
        metadata: { genre: "drama" },
      },
      {
        id: "vec4",
        values: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
        metadata: { genre: "action" },
      },
    ]);
    console.log("Vectors upserted successfully");
  } catch (error) {
    console.error("Error upserting vectors:", error);
  }
}

export {pc, upsertVectors}
