import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

import { SettingsProvider } from "@/lib/SettingsContext";
import SettingsModal from "@/components/SettingsModal";

export const metadata: Metadata = {
  title: "NanoPrompt — Editorial AI Compression",
  description: "Architectural intelligence for your LLM prompts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans bg-obsidianBg text-textPrimary selection:bg-acid selection:text-obsidianBg`}>
        <SettingsProvider>
          {children}
          <SettingsModal />
        </SettingsProvider>
      </body>
    </html>
  );
}
