import { PrismaClient } from "@prisma/client";
const makeSingleClient = () => {
  return new PrismaClient();
};

declare global {
  var globalClient: ReturnType<typeof makeSingleClient> | undefined;
}

const prisma: ReturnType<typeof makeSingleClient> =
  globalThis.globalClient ?? makeSingleClient();
export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.globalClient = prisma;
