"use client";
import Image from "next/image";
import Link from "next/link";
import LoopLogo from "../public/LoopLogoFinal.png";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Mail, PlusIcon } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { AddNote } from "./AddNote";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { AiChatButton } from "./AIChatButton";
import { Loadingbutton } from "./ui/loadingbutton";
import { SyncMailButton } from "./SyncMailButton";
export const NavBar = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { theme } = useTheme();
  return (
    <>
      <div className="p-2 shadow">
        <div className="m-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Link href="/notes" className="flex items-center gap-1">
            <Image alt="logo" src={LoopLogo} width={60} height={60} />
            <span className="font-bold">Loop AI</span>
          </Link>
          <span className="flex items-center gap-2">
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  baseTheme: theme === "dark" ? dark : undefined,
                  // done to have userbutton resort to default(light theme)
                  elements: {
                    avatarBox: {
                      width: "2.5rem",
                      height: "2.5rem",
                    },
                  },
                }}
              />
            </SignedIn>
            <ThemeToggle />
            <SyncMailButton/>
            <Button onClick={() => setShowDialog(true)}>
              <PlusIcon />
              Add Note
            </Button>
            <AiChatButton />
          </span>
        </div>
      </div>
      <AddNote open={showDialog} setOpen={setShowDialog} />
    </>
  );
};
