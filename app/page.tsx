import LoopLogo from "../public/LoopLogoFinal.png";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
export default function Home() {
  const { userId }: { userId: string | null } = auth();
  if (userId) {
    redirect("/notes");
  }
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        <Image src={LoopLogo} alt="Not logo"  height={200} width={200}/>
        <span className="text-5xl font-extrabold tracking-tight lg:text-4xl">
          LoopAI
        </span>
      </div>
      <p className="max-w-prose text-center">
        A personal AI companion that talks to your Mails and Notes
      </p>
      <Button asChild size="lg">
        <Link href="/notes">Open</Link>
      </Button>
    </main>
  );
}
