import { z } from "zod";
const Mail = z.object({
  subject: z.string().min(1, { message: "title is required" }),
  body: z.string(),
  from: z.string(),
  userId: z.string(),
  ReceivedAt: z.string(),
  Category: z.string().array(),
});

type MailType = z.infer<typeof Mail>;

export { Mail, type MailType };
