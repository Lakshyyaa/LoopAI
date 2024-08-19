import { NavBar } from "@/components/Navbar";
import { ReactNode } from "react";
  export default function RootLayout({
    children,
  }: {
    children: ReactNode;
  }) {
    return (
      <>
          <NavBar />
          <main className="m-auto max-w-7xl p-4">{children}</main>
      </>
    );
  }
