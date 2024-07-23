import { z } from "zod";

const Note = z.object({
  title: z.string().min(1, { message: "title is required" }),
  content: z.string().optional(),
});

type NoteType = z.infer<typeof Note>;
const updateNote = Note.extend({
  id: z.string().min(1),
});
const deleteNote = z.object({
  id: z.string().min(1),
});

export {updateNote, deleteNote, Note, type NoteType };
