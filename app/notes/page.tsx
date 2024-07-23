import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma/db";
import { Note } from "@/components/Note";

const Page = async () => {
  const { userId } = auth();
  if (!userId) {
    throw Error("undefined user");
  }
  const notes = await prisma.note.findMany({
    where: {
      userId: userId,
    },
  });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((x) => (
        <Note note={x} key={x.id} />
      ))}
      {notes.length === 0 && (
        <div className="col-span-full text-center">
          {"You don't have any notes yet, create one"}
        </div>
      )}
    </div>
  );
};
export default Page;
