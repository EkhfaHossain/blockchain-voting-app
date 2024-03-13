import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VotingProvider } from "./context/voter";
import Navbar from "../app/components/Navbar/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <VotingProvider>
          <Navbar />
          {children}
        </VotingProvider>
      </body>
    </html>
  );
}
