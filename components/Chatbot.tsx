import { Message, useChat } from "ai/react";
import { cn } from "@/lib/utils";
import { Trash, XCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { Bot } from "lucide-react";
import { useEffect, useRef } from "react";
import Image from "next/image";
interface AIChatProps {
  open: boolean;
  onClose: () => void;
}
export const AiChatBox = ({ open, onClose }: AIChatProps) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    error,
    isLoading,
  } = useChat();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const lastMsgIsUser = messages[messages.length - 1]?.role === "user";
  return (
    <div
      className={cn(
        "bottom-0 right-0 z-10 w-full max-w-[500px] p-1 xl:right-36",
        open ? "fixed" : "hidden",
      )}
    >
      <button onClick={onClose} className="mb-1 ms-auto block">
        <XCircle size={30} />
      </button>
      <div className="flex h-[600px] flex-col rounded border bg-background shadow-xl">
        <div className="mt-3 h-full overflow-y-auto px-3" ref={scrollRef}>
          {messages.map((x) => (
            <ChatMessage message={x} key={x.id} />
          ))}
          {isLoading && lastMsgIsUser && (
            <ChatMessage
              message={{ role: "assistant", content: "Thinking..." }}
            />
          )}
          {/* {error && (
            <ChatMessage
              message={{
                role: "assistant",
                content: "Something is wrong. Try again",
              }}
            />
          )} */}
          {!error && messages.length === 0 && (
            <div className="flex h-full items-center justify-center gap-3">
              <Bot />
              ASK ME?
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="m-3 flex gap-1">
          <Button
            title="Clear chat"
            variant={"outline"}
            size={"icon"}
            className="shrink-0"
            type="button"
            onClick={() => setMessages([])}
          >
            <Trash type="submit" />
          </Button>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="ask anything..."
            ref={inputRef}
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
};

const ChatMessage = ({
  message,
}: {
  message: Pick<Message, "role" | "content">;
}) => {
  const { role, content } = message;
  const { user } = useUser();
  const isAiMessage = role === "assistant";
  console.log("is it tho?", isAiMessage);
  return (
    <div
      className={cn(
        "mb-3 flex items-center",
        isAiMessage ? "me-5 justify-start" : "me-5 justify-end",
      )}
    >
      {isAiMessage && <Bot className="mr-2 shrink-0" />}
      <p
        className={cn(
          "whitespace-pre-line rounded-md border bg-primary px-3 py-2 text-primary-foreground",
          // isAiMessage ? "bg-background" : "bg-primary text-primary-foreground",
        )}
      >
        {content}
      </p>
      {!isAiMessage && user?.imageUrl && (
        <Image
          src={user.imageUrl}
          alt="user dp"
          width={100}
          height={100}
          className="ml-2 h-10 w-10 rounded-full object-cover"
        />
      )}
    </div>
  );
};
