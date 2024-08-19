"use client";
import { SortBy } from "@/components/SortBy";
import { Mail as MailTS, Note as NoteTS } from "@prisma/client";
import { useState } from "react";
import { Note } from "@/components/Note";
import { Mail } from "@/components/Mail";
export const Bull = ({
  notes,
  mails,
}: {
  notes: NoteTS[];
  mails: MailTS[];
}) => {
  const [filter, setFilter] = useState("");
  const filteredmails = mails
    .filter((x) => x.Category.includes(filter))
    .concat(mails.filter((x) => !x.Category.includes(filter)));
  return (
    <>
      {filteredmails.map((x) => (
        <Mail key={x.id} mail={x} />
      ))}
      {notes.map((x) => (
        <Note note={x} key={x.id} />
      ))}
      {notes.length === 0 && mails.length === 0 && (
        <div className="col-span-full text-center">
          {"You don't have any notes yet or synced with gmail yet, create one"}
        </div>
      )}
      <div className="z-10 fixed right-5">
        <SortBy setFilter={setFilter} />
      </div>
    </>
  );
};
