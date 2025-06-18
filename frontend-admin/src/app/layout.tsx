import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import {AuthProvider} from "@/contexts/AuthContext";
import {Metadata} from "next";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Admin panel",
    description: "Dashboard admin panel for drive school",
    // other metadata
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} dark:bg-gray-900`}>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
      </body>
    </html>
  );
}
