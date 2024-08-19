import { Mail as MailType } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
export const ShowMail = ({
  open,
  setOpen,
  mail
}: {
  open: boolean,
  setOpen: (open: boolean) => void,
  mail: MailType
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-96 overflow-auto">
        <DialogHeader>
          <DialogTitle>{mail.body}</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};





