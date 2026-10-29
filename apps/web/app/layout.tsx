import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice and Text AI Agent",
  description:
    "An engineering-focused voice and text agent project with evidence-aware responses and controlled tool execution.",
};

export const viewport: Viewport = {
  themeColor: "#090c12",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
