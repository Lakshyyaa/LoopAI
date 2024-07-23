"use client";
import { NoteType } from "@/lib/validation/note";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Note } from "@/lib/validation/note";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Loadingbutton } from "./ui/loadingbutton";
import { Note as NoteModel } from "@prisma/client";
import { useState } from "react";
export const AddNote = ({
  open,
  setOpen,
  noteToEdit,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  noteToEdit?: NoteModel;
}) => {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const form = useForm<NoteType>({
    resolver: zodResolver(Note),
    defaultValues: {
      title: noteToEdit?.title || "",
      content: noteToEdit?.content || "",
    },
  });
  async function onSubmit(input: NoteType) {
    try {
      if (noteToEdit) {
        await axios.put("/api/notes", {
          id: noteToEdit.id,
          ...input,
        });
      } else {
        await axios.post("/api/notes", {
          title: input.title,
          content: input.content,
        });
      }
      form.reset();
      router.refresh();
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("cant submit");
    }
  }
  const deleteNote = async () => {
    if (!noteToEdit) {
      return;
    }
    try {
      setDeleting(true);
      await axios.delete("/api/notes", {
        data: {
          id: noteToEdit.id,
        },
      });
    } catch (err) {
      console.error(err);
      alert("cant submit");
    } finally {
      setDeleting(false);
      router.refresh();
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{noteToEdit ? "Edit Note" : "Add Note"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="title" />
                    </FormControl>
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="content" />
                    </FormControl>
                  </FormLabel>
                </FormItem>
              )}
            />
            <DialogFooter className="gap-1 sm:gap-0">
              {noteToEdit && (
                <Loadingbutton
                  loading={deleting}
                  variant="destructive"
                  disabled={form.formState.isSubmitting}
                  onClick={deleteNote}
                  type="button"
                >
                  Delete
                </Loadingbutton>
              )}
              <Loadingbutton
                type="submit"
                loading={form.formState.isSubmitting}
                disabled={deleting}
              >
                Submit
              </Loadingbutton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
