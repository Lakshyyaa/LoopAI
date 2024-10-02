// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { Note, updateNote, deleteNote } from "@/lib/validation/note";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma/db";
import { pc } from "@/lib/pinecone";
import { getEmbedding } from "@/lib/embeddingGenerator";

async function getNoteEmbeddings(title: string, content: string | undefined) {
  return getEmbedding(title + "\n\n" + (content ?? ""));
}

const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = Note.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.format(), // Provide detailed error messages
        },
        { status: 400 },
      );
    }

    const { title, content } = parsed.data; // Extract data from parsed object
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        {
          message: "error: unauthorized",
        },
        { status: 401 },
      );
    }

    const embedding = await getNoteEmbeddings(title, content);
    if (embedding === undefined) {
      throw new Error("Error in creating embedding");
    }

    const note = await prisma.$transaction(async (x) => {
      const note = await x.note.create({
        data: {
          userId: userId,
          title: title,
          content: content,
        },
      });

      const indexes = await pc.listIndexes();
      if (!indexes.indexes?.find((x) => x.name === "notegpt")) {
        await pc.createIndex({
          name: "notegpt",
          dimension: 1024,
          metric: "cosine",
          spec: {
            serverless: {
              cloud: "aws",
              region: "us-east-1",
            },
          },
        });
      }

      const index = pc.index("notegpt");
      await index.namespace("Notes").upsert([
        {
          id: note.id,
          values: embedding,
          metadata: { userId },
        },
      ]);
      return note;
    });

    return NextResponse.json(
      {
        note,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        message: `error: ${err.message || err}`,
      },
      { status: 500 },
    );
  }
};

const PUT = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = updateNote.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.format(), // Provide detailed error messages
        },
        { status: 400 },
      );
    }

    const { title, content, id } = parsed.data; // Extract data from parsed object
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const { userId } = auth();
    if (!userId || userId !== note.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const embedding = await getNoteEmbeddings(title, content);
    const updated = await prisma.$transaction(async (x) => {
      const updatedNote = await x.note.update({
        where: {
          id,
        },
        data: {
          title: title,
          content: content,
        },
      });

      const index = pc.index("notegpt");
      await index.namespace("Notes").upsert([
        {
          id: id,
          values: embedding,
          metadata: { userId },
        },
      ]);
      return updatedNote;
    });

    return NextResponse.json(
      {
        updated,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: `error: ${error.message || error}`,
      },
      { status: 500 },
    );
  }
};

const DELETE = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = deleteNote.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.format(), // Provide detailed error messages
        },
        { status: 400 },
      );
    }

    const { id } = parsed.data; // Extract data from parsed object
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        {
          message: "error: unauthorized",
        },
        { status: 401 },
      );
    }

    const deleted = await prisma.$transaction(async (x) => {
      const deletedNote = await x.note.delete({
        where: {
          id,
        },
      });

      const index = pc.index("notegpt");
      await index.namespace("Notes").deleteOne(id);
      return deletedNote;
    });

    return NextResponse.json(
      {
        deleted,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: `error: ${error.message || error}`,
      },
      { status: 500 },
    );
  }
};

export { POST, PUT, DELETE };
