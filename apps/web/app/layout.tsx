import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice and Text AI Agent",
  description:
    "A voice and text agent workspace designed around inspectable evidence, controlled tools, and clear operational boundaries.",
};

export const viewport: Viewport = {
  themeColor: "#090d13",
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
