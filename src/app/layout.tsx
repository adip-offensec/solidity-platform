import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solidity Learning & Practice Platform",
  description: "Interactive Solidity documentation, EVM code execution, exercises, and AI tutor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
