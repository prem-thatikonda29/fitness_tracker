import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { ServiceWorkerRegister } from "@/components/sw-register";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Workout Tracker",
  description: "Log workouts, track body parts, review your week.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Workouts" },
};

export const viewport: Viewport = {
  themeColor: "#f1f4e6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${jakarta.variable} antialiased`}>
          <div className="mx-auto flex min-h-dvh max-w-md flex-col">
            <main className="flex-1 px-4 pb-24 pt-6">{children}</main>
            <BottomNav />
          </div>
          <ServiceWorkerRegister />
        </body>
      </html>
    </ClerkProvider>
  );
}
