import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma/db";
import { Note } from "@/components/Note";
import { Mail } from "@/components/Mail";
import { SortBy } from "@/components/SortBy";
import { Bull } from "./Bull";

const Page = async () => {
  const { userId } = auth();
  const filter = "MEETINGS";
  if (!userId) {
    throw Error("undefined user");
  }
  const notes = await prisma.note.findMany({
    where: {
      userId: userId,
    },
  });
  const mails = await prisma.mail.findMany({
    where: {
      userId: userId,
    },
  });

  const filteredmails = mails
    .filter((x) => x.Category.includes(filter))
    .concat(mails.filter((x) => !x.Category.includes(filter)));
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {/* {filteredmails.map((x) => (
        <Mail key={x.id} mail={x} />
      ))}
      {notes.map((x) => (
        <Note note={x} key={x.id} />
      ))}
      {notes.length === 0 && mails.length === 0 && (
        <div className="col-span-full text-center">
          {"You don't have any notes yet or synced with gmail yet, create one"}
        </div>
      )} */}
      <Bull notes={notes} mails={mails}/>
    </div>
  );
};
export default Page;
