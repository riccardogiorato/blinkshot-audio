import type React from "react";
import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import { Dosis } from "next/font/google";
import "./globals.css";

const dosis = Dosis({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Audio Blinkshot - Voice to Image Generation",
  description:
    "Generate images in real-time using your voice, powered by Together AI",
  openGraph: {
    images: [{ url: "https://blinkshot-audio.vercel.app/og-image.png" }],
  },
  icons: [
    {
      rel: "icon",
      url: "/favicon-light.png",
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      url: "/favicon-dark.png",
      media: "(prefers-color-scheme: dark)",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dosis.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
