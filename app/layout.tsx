import { ThemeProvider } from "./ThemeProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Loop AI",
  description: "AI Companion that talks to your mail inbox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {/* <FilterProvider> */}
          <ThemeProvider attribute="class">{children}</ThemeProvider>
          {/* </FilterProvider> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
