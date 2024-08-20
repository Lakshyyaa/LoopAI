// import { Pinecone } from "@pinecone-database/pinecone";

// const pc = new Pinecone({
//   apiKey: process.env.PINECONE || "",
// });

// export {pc}

import { Pinecone } from "@pinecone-database/pinecone";
const makePCClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE || "",
  });
};
declare global {
  var globalClientPC: ReturnType<typeof makePCClient> | undefined;
}
const pc: ReturnType<typeof makePCClient> =
  globalThis.globalClientPC ?? makePCClient();
export { pc };

if (process.env.NODE_ENV !== "production") globalThis.globalClientPC = pc;
