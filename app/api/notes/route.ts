import { NextRequest, NextResponse } from "next/server";
import { Note, updateNote, deleteNote } from "@/lib/validation/note";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma/db";
import { pc, upsertVectors } from "@/lib/pinecone";
import { getEmbedding } from "@/lib/embeddingGenerator";
// import { getIndex } from "@/lib/pinecone";
async function getNoteEmbeddings(title: string, content: string | undefined) {
  return getEmbedding(title + "\n\n" + content ?? "");
}
const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = Note.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error,
        },
        { status: 400 },
      );
    }
    const { title, content } = await body;
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        {
          message: `error : unauthorized`,
        },
        { status: 401 },
      );
    }
    const embedding = await getNoteEmbeddings(title, content);
    console.log(embedding);

    if (embedding === undefined) {
      throw Error("error in creating embedding");
    }
    const note = await prisma.$transaction(async (x) => {
      // We have put these two in a transaction even though only the first one is a db operation
      // because this is a sequential transaction where we first do db operation and then
      // put its emebedding in the pinecone db.
      // If we fail for the pinecone part, it throws error and the whole transaction is undone
      const note = await x.note.create({
        data: {
          userId: userId,
          title: title,
          content: content,
        },
      });
      const indexes = await pc.listIndexes();
      if (!indexes.indexes?.find((x) => x.name == "notegpt")) {
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
          // @ts-ignore
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
      // request success and resource created
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        message: `error : ${err}`,
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
          message: parsed.error,
        },
        { status: 400 },
      );
    }
    const { title, content, id } = body;
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== note.userId) {
      // check if the user is authorzied to edit that note
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const embedding = await getNoteEmbeddings(title, content);

    const updated = await prisma.$transaction(async (x) => {
      const updated = await x.note.update({
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
          // @ts-ignore
          values: embedding,
          metadata: { userId },
        },
      ]);
      return updated;
    });
    return NextResponse.json(
      {
        updated,
      },
      { status: 200 },
      // 200 for updating
      // 201 for creating
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: `error : ${error}`,
      },
      { status: 500 },
    );
  }
};

const DELETE = async (req: NextRequest) => {
  try {
    console.log("asked to delete yes");
    const body = await req.json();
    console.log("body", body);
    const parsed = deleteNote.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error,
        },
        { status: 400 },
      );
    }
    const { id } = body;
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        {
          message: `error : unauthorized`,
        },
        { status: 401 },
      );
    }
    const deleted = await prisma.$transaction(async (x) => {
      const deleted = await prisma.note.delete({
        where: {
          id,
        },
      });
      const index = pc.index("notegpt");
      await index.namespace("Notes").deleteOne(id);
      return deleted;
    });

    return NextResponse.json(
      {
        deleted,
      },
      { status: 200 },
      // 200 for updating
      // 201 for creating
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: `error : ${error}`,
      },
      { status: 500 },
    );
  }
};
export { POST, PUT, DELETE };

// import { NextRequest, NextResponse } from "next/server";
// import { Note, updateNote, deleteNote } from "@/lib/validation/note";
// import { auth } from "@clerk/nextjs/server";
// import prisma from "@/prisma/db";
// import pc from "@/lib/pinecone";
// import { getEmbedding } from "@/lib/openai";
// import { getIndex } from "@/lib/pinecone";
// async function getNoteEmbeddings(title: string, content: string | undefined) {
//   return getEmbedding(title + "\n\n" + content ?? "");
// }
// const POST = async (req: NextRequest) => {
//   try {
//     const body = await req.json();
//     const parsed = Note.safeParse(body);
//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           message: parsed.error,
//         },
//         { status: 400 },
//       );
//     }
//     const { title, content } = await body;
//     const { userId } = auth();
//     if (!userId) {
//       return NextResponse.json(
//         {
//           message: `error : unauthorized`,
//         },
//         { status: 401 },
//       );
//     }
//     const embedding = await getNoteEmbeddings(title, content);
//     console.log(embedding)
//     const note = await prisma.$transaction(async (x) => {
//       // We have put these two in a transaction even though only the first one is a db operation
//       // because this is a sequential transaction where we first do db operation and then
//       // put its emebedding in the pinecone db.
//       // If we fail for the pinecone part, it throws error and the whole transaction is undone
//       const note = await x.note.create({
//         data: {
//           userId: userId,
//           title: title,
//           content: content,
//         },
//       });
//       await getIndex();
//       const index = pc.Index("notegpt");
//       await index.namespace("namespace").upsert([
//         {
//           id: note.id,
//           values: embedding,
//           metadata: { userId },
//         },
//       ]);
//       return note;
//     });
//     return NextResponse.json(
//       {
//         note,
//       },
//       { status: 201 },
//       // request success and resource created
//     );
//   } catch (err) {
//     return NextResponse.json(
//       {
//         message: `error : ${err}`,
//       },
//       { status: 500 },
//     );
//   }
// };

// const PUT = async (req: NextRequest) => {
//   try {
//     const body = await req.json();
//     const parsed = updateNote.safeParse(body);
//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           message: parsed.error,
//         },
//         { status: 400 },
//       );
//     }
//     const { title, content, id } = body;
//     const note = await prisma.note.findUnique({ where: { id } });

//     if (!note) {
//       return Response.json({ error: "Note not found" }, { status: 404 });
//     }

//     const { userId } = auth();

//     if (!userId || userId !== note.userId) {
//       // check if the user is authorzied to edit that note
//       return Response.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     if (!userId) {
//       return NextResponse.json(
//         {
//           message: `error : unauthorized`,
//         },
//         { status: 401 },
//       );
//     }
//     const updated = await prisma.note.update({
//       where: {
//         id,
//       },
//       data: {
//         title: title,
//         content: content,
//       },
//     });
//     return NextResponse.json(
//       {
//         updated,
//       },
//       { status: 200 },
//       // 200 for updating
//       // 201 for creating
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       {
//         message: `error : ${error}`,
//       },
//       { status: 500 },
//     );
//   }
// };

// const DELETE = async (req: NextRequest) => {
//   try {
//     console.log("asked to delete yes");
//     const body = await req.json();
//     console.log("body", body);
//     const parsed = deleteNote.safeParse(body);
//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           message: parsed.error,
//         },
//         { status: 400 },
//       );
//     }
//     const { id } = body;
//     const note = await prisma.note.findUnique({ where: { id } });

//     if (!note) {
//       return Response.json({ error: "Note not found" }, { status: 404 });
//     }

//     const { userId } = auth();

//     if (!userId || userId !== note.userId) {
//       // check if the user is authorized to edit that note
//       return Response.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     if (!userId) {
//       return NextResponse.json(
//         {
//           message: `error : unauthorized`,
//         },
//         { status: 401 },
//       );
//     }
//     const deleted = await prisma.note.delete({
//       where: {
//         id,
//       },
//     });
//     return NextResponse.json(
//       {
//         deleted,
//       },
//       { status: 200 },
//       // 200 for updating
//       // 201 for creating
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       {
//         message: `error : ${error}`,
//       },
//       { status: 500 },
//     );
//   }
// };
// export { POST, PUT, DELETE };

// import { NextRequest, NextResponse } from "next/server";
// import { Note, updateNote, deleteNote } from "@/lib/validation/note";
// import { auth } from "@clerk/nextjs/server";
// import prisma from "@/prisma/db";
// import { getEmbedding } from "@/lib/openai";
// import { getIndex } from "@/lib/pinecone";
// async function getNoteEmbeddings(title: string, content: string | undefined) {
//   return getEmbedding(title + "\n\n" + content ?? "");
// }
// const POST = async (req: NextRequest) => {
//   try {
//     const body = await req.json();
//     const parsed = Note.safeParse(body);
//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           message: parsed.error,
//         },
//         { status: 400 },
//       );
//     }
//     const { title, content } = body;
//     const { userId } = auth();
//     if (!userId) {
//       return NextResponse.json(
//         {
//           message: `error : unauthorized`,
//         },
//         { status: 401 },
//       );
//     }
//     const note = await prisma.note.create({
//       data: {
//         userId: userId,
//         title: title,
//         content: content,
//       },
//     });
//     return NextResponse.json(
//       {
//         note,
//       },
//       { status: 201 },
//       // request success and resource created
//     );
//   } catch (err) {
//     return NextResponse.json(
//       {
//         message: `error : ${err}`,
//       },
//       { status: 500 },
//     );
//   }
// };

// const PUT = async (req: NextRequest) => {
//   try {
//     const body = await req.json();
//     const parsed = updateNote.safeParse(body);
//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           message: parsed.error,
//         },
//         { status: 400 },
//       );
//     }
//     const { title, content, id } = body;
//     const note = await prisma.note.findUnique({ where: { id } });

//     if (!note) {
//       return Response.json({ error: "Note not found" }, { status: 404 });
//     }

//     const { userId } = auth();

//     if (!userId || userId !== note.userId) {
//       // check if the user is authorzied to edit that note
//       return Response.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     if (!userId) {
//       return NextResponse.json(
//         {
//           message: `error : unauthorized`,
//         },
//         { status: 401 },
//       );
//     }
//     const updated = await prisma.note.update({
//       where: {
//         id,
//       },
//       data: {
//         title: title,
//         content: content,
//       },
//     });
//     return NextResponse.json(
//       {
//         updated,
//       },
//       { status: 200 },
//       // 200 for updating
//       // 201 for creating
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       {
//         message: `error : ${error}`,
//       },
//       { status: 500 },
//     );
//   }
// };

// const DELETE = async (req: NextRequest) => {
//   try {
//     console.log("asked to delete yes");
//     const body = await req.json();
//     console.log("body", body);
//     const parsed = deleteNote.safeParse(body);
//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           message: parsed.error,
//         },
//         { status: 400 },
//       );
//     }
//     const { id } = body;
//     const note = await prisma.note.findUnique({ where: { id } });

//     if (!note) {
//       return Response.json({ error: "Note not found" }, { status: 404 });
//     }

//     const { userId } = auth();

//     if (!userId || userId !== note.userId) {
//       // check if the user is authorized to edit that note
//       return Response.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     if (!userId) {
//       return NextResponse.json(
//         {
//           message: `error : unauthorized`,
//         },
//         { status: 401 },
//       );
//     }
//     const deleted = await prisma.note.delete({
//       where: {
//         id,
//       },
//     });
//     return NextResponse.json(
//       {
//         deleted,
//       },
//       { status: 200 },
//       // 200 for updating
//       // 201 for creating
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       {
//         message: `error : ${error}`,
//       },
//       { status: 500 },
//     );
//   }
// };
// export { POST, PUT, DELETE };
