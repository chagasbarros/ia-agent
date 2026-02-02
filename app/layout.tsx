import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agente TypeScript Fullstack",
  description: "Seu especialista em desenvolvimento TypeScript",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
