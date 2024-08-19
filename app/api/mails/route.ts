import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { pc } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";
import { getEmbedding } from "@/lib/embeddingGenerator";
import { convertToCoreMessages, streamText } from "ai";
import { anthropic } from "@/lib/anthropic";

async function getMailEmbeddings(
  subject: string,
  body: string,
  from: string,
  receivedAt: string,
) {
  return getEmbedding(`${subject}\n${body}\n${from}\n${receivedAt}`);
}
async function getCategories(body: string) {
  // M A K E  T H E  A N T H R O P I C  C L I E N T  G L O B A L
  const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1000,
    temperature: 0,
    system:
      "Respond only with a single line with comma separated values out the following: EDUCATION, HEALTH, FINANCE, MEETINGS, EVENTS, SUBSCRIPTIONS",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Given the mail, tell its categories out of: EDUCATION, HEALTH, FINANCE, MEETINGS, EVENTS, SUBSCRIPTIONS\n" +
              body,
          },
        ],
      },
    ],
  });
  return msg;
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
          let categories = await getCategories(mail.body)
          categories = categories.content[0].text;
          categories=categories.split(", ")
          console.log("categories are:", categories);
          const Category=categories
          const createdMail = await tx.mail.create({
            data: { ...mail, userId, Category },
          });
          console.log(createdMail, " is created mail");

          const index = pc.index("notegpt");
          const embedding = await getMailEmbeddings(
            mail.subject,
            mail.body,
            mail.from,
            mail.ReceivedAt,
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
        timeout: 50000000, // default: 5000
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
