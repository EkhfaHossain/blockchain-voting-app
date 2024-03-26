import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VotingProvider } from "./context/voter";
import Navbar from "../app/components/Navbar/Navbar";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" />
        <VotingProvider>
          <Navbar />
          {children}
        </VotingProvider>
      </body>
    </html>
  );
}
