"use client"
import { Note as NoteModel } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useState } from "react";
import { AddNote } from "./AddNote";
export const Note = ({ note }: { note: NoteModel }) => {
  const [showEdit, setShowEdit] = useState(false);
  const wasUpdated = note.updatedAt > note.createdAt;
  const timeStap = (
    wasUpdated ? note.updatedAt : note.createdAt
  ).toDateString();
  return (
    <>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={()=>setShowEdit(true)}>
        <CardHeader>
          <CardTitle>{note.title}</CardTitle>
          <CardDescription>
            {timeStap}
            {wasUpdated && " (updated)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">
            {/* whitespace-pre-line shows line breaks as they were in the note typed by the user */}
            {note.content}
          </p>
        </CardContent>
      </Card>
      <AddNote open={showEdit} setOpen={setShowEdit} noteToEdit={note}/>
    </>
  );
};
