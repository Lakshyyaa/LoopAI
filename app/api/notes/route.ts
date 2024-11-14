import { NextRequest, NextResponse } from "next/server";
import { Note, updateNote, deleteNote } from "@/lib/validation/note";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma/db";
import { pc } from "@/lib/pinecone";
import { getEmbedding } from "@/lib/embeddingGenerator";

async function getNoteEmbeddings(title: string, content: string | undefined) {
  return getEmbedding(title + "\n\n" + (content ?? ""));
}

async function initializePinecone() {
  try {
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
    return pc.index("notegpt");
  } catch (error) {
    console.error("Failed to initialize Pinecone:", error);
    throw new Error("Failed to initialize Pinecone");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Note.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = parsed.data;
    const embedding = await getNoteEmbeddings(title, content);

    if (!embedding) {
      return NextResponse.json(
        { error: "Failed to create embedding" },
        { status: 500 },
      );
    }

    const note = await prisma.$transaction(async (tx) => {
      const note = await tx.note.create({
        data: {
          userId,
          title,
          content,
        },
      });

      const index = await initializePinecone();
      await index.namespace("Notes").upsert([
        {
          id: note.id,
          values: embedding as number[],
          metadata: { userId },
        },
      ]);

      return note;
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = updateNote.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const { title, content, id } = parsed.data;
    const { userId } = auth();

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (!userId || userId !== note.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const embedding = await getNoteEmbeddings(title, content);
    if (!embedding) {
      return NextResponse.json(
        { error: "Failed to create embedding" },
        { status: 500 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updated = await tx.note.update({
        where: { id },
        data: { title, content },
      });

      const index = await initializePinecone();
      await index.namespace("Notes").upsert([
        {
          id,
          values: embedding as number[],
          metadata: { userId },
        },
      ]);

      return updated;
    });

    return NextResponse.json({ note: updated }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = deleteNote.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const { id } = parsed.data;
    const { userId } = auth();

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (!userId || userId !== note.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleted = await prisma.$transaction(async (tx) => {
      const deleted = await tx.note.delete({ where: { id } });
      const index = await initializePinecone();
      await index.namespace("Notes").deleteOne(id);
      return deleted;
    });

    return NextResponse.json({ note: deleted }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}