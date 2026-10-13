import type { Metadata, Viewport } from "next";
import { Open_Sans, Roboto_Mono } from "next/font/google";
import { DeviceGate } from "./components/device-gate";
import { RegisterServiceWorker } from "./components/register-sw";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VirungaPay",
  description: "Wallets for tour operators, guides, and drivers across East Africa.",
  applicationName: "VirungaPay",
  appleWebApp: { capable: true, title: "VirungaPay", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2A2AFF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${openSans.variable} ${robotoMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F8F8FF] font-sans text-[#28313D]">
        <RegisterServiceWorker />
        <DeviceGate>{children}</DeviceGate>
      </body>
    </html>
  );
}
