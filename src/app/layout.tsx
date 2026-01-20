import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Studentify | Premium Marketplace for Students",
  description: "The ultimate marketplace platform for student deals and essentials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased selection:bg-indigo-100 selection:text-indigo-900`}>
        <Toaster position="top-center" richColors />
        <Navbar />
        <main>{children}</main>
        <footer className="bg-slate-50 border-t border-slate-200 py-12">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center text-left">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-slate-900">
                  Studentify
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} Studentify. Built for students, by students.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

import { ShoppingBag } from "lucide-react";
