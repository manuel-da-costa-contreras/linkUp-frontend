import type { Metadata } from "next";
import { AuthGate } from "@components/auth/AuthGate";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@components/ui";
import { I18nProvider } from "@i18n/I18nProvider";
import { AuthProvider } from "@lib/auth";
import { AppQueryProvider } from "@lib/query/AppQueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkUP Dashboard",
  description: "SaaS dashboard frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppQueryProvider>
          <I18nProvider locale="es">
            <AuthProvider>
              <ToastProvider>
                <AuthGate>{children}</AuthGate>
              </ToastProvider>
            </AuthProvider>
          </I18nProvider>
        </AppQueryProvider>
      </body>
    </html>
  );
}

