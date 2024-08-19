"use client";
import { Mail as MailModel } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ShowMail } from "./ShowMail";
import { useState } from "react";
// sub body from receivedAt
export const Mail = ({ mail }: { mail: MailModel }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card
        className="cursor-pointer border-blue-800 transition-shadow hover:shadow-lg"
        onClick={() => setOpen(true)}
      >
        <CardHeader>
          <CardTitle>{mail.subject}</CardTitle>
          <CardDescription>{"From: " + mail.from}</CardDescription>
          <CardDescription>{"Time: " + mail.ReceivedAt}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">
            {/* whitespace-pre-line shows line breaks as they were in the note typed by the user */}
            {"Click to view full mail"}
          </p>
        </CardContent>
      </Card>
      <ShowMail open={open} setOpen={setOpen} mail={mail}/>
    </>
  );
};
