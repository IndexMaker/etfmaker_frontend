import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/language-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ReduxProvider } from "@/provider/reduxProvider";
// import { initPostHog } from "../lib/posthog";
import {
  PHProvider,
  PostHogErrorTracker,
  PostHogPageview,
} from "../lib/posthog";
import SessionTracker from "../components/posthog/sessionTracker";
import { WalletProvider } from "@/contexts/wallet-context";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IndexMaker",
  description: "IndexMaker MVP",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // initPostHog();

  return (
    <html lang="en">
      <head>
        <script
          src="https://assets.calendly.com/assets/external/widget.js"
          async
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#15181a]`}
      >
        <WalletProvider>
          <PHProvider>
            <PostHogPageview />
            <PostHogErrorTracker />
            <ReduxProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                <LanguageProvider>
                  {children}
                  <Toaster />
                </LanguageProvider>
              </ThemeProvider>
            </ReduxProvider>
          </PHProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
