import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { pc } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";
import { getEmbedding } from "@/lib/embeddingGenerator";

async function getMailEmbeddings(
  subject: string,
  body: string,
  from: string,
  receivedAt: string,
) {
  return getEmbedding(`${subject}\n${body}\n${from}\n${receivedAt}`);
}

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const mails = body.mails;

    await prisma.$transaction(
      async (tx) => {
        for (const mail of mails) {
          const createdMail = await tx.mail.create({
            data: {...mail, userId}
          });
          console.log(createdMail, " is created mail");

          const index = pc.index("notegpt");
          const embedding = await getMailEmbeddings(
            mail.subject,
            mail.body,
            mail.from,
            mail.ReceivedAt,
            // mail.userId,
          );
          console.log(embedding, " is the embedding of the mail");

          const addedToPC = await index.namespace("Notes").upsert([
            {
              id: createdMail.id,
              // @ts-ignore
              values: embedding,
              metadata: { userId },
            },
          ]);
          console.log(addedToPC, " is added to pc for mail");
        }
      },
      {
        timeout: 20000, // default: 5000
      },
    );

    return NextResponse.json({
      message: "Emails processed and stored successfully",
    });
  } catch (error) {
    console.error("Error processing emails:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
