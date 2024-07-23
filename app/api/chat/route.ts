import { getEmbedding } from "@/lib/embeddingGenerator";
import { pc } from "@/lib/pinecone";
import prisma from "@/prisma/db";
import { auth } from "@clerk/nextjs/server";
import { convertToCoreMessages, streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
interface messageProps {
  content: string;
  role: string;
}
export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const messages = body.messages;
    const messagesTrim = messages;
    // const messagesTrim = messages.slice(-6);
    // Trim here such that the first is always a user
    const embedding = await getEmbedding(
      messagesTrim.map((x: messageProps) => x.content).join("\n"),
    );
    const index = pc.index("notegpt");
    const { userId } = auth();
    const queryResponse = await index.namespace("Notes").query({
      // @ts-ignore
      vector: embedding,
      filter: {
        userId,
      },
      topK: 5,
    });
    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: queryResponse.matches.map((x) => x.id),
        },
      },
    });
    const relevantMails = await prisma.mail.findMany({
      where: {
        id: {
          in: queryResponse.matches.map((x) => x.id),
        },
      },
    });
    // const systemMessage =
    //   "You are an intelligent note-taking app. You answer the user's question based on their existing notes. " +
    //   "The relevant notes for this query are:\n" +
    // relevantNotes
    //   .map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`)
    //   .join("\n\n");
    const systemMessage =
      "You are an intelligent app that can take notes from the user and also has access to user's work email inbox. You answer the user's question based on their existing emails and notes the user has written. " +
      "The relevant emails and notes for this query are:\n" +
      relevantMails
        .map(
          (mail) =>
            `Subject: ${mail.subject}\n\Content:\n${mail.body}\n\From:${mail.from}`,
        )
        .join("\n\n") +
      relevantNotes
        .map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`)
        .join("\n\n");

    const response = await streamText({
      model: anthropic("claude-3-5-sonnet-20240620"),
      system: systemMessage,
      messages: convertToCoreMessages(messagesTrim),
    });
    return response.toAIStreamResponse();
  } catch (error) {
    console.log(error);
  }
};