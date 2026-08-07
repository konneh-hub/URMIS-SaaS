import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "../shared/auth/AuthProvider";
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
  title: "URMIS | University Result Management Information System",
  description: "A multi-tenant SaaS platform for academic result management.",
  icons: {
    icon: '/urmis.png',
    shortcut: '/urmis.png',
    apple: '/urmis.png',
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <script dangerouslySetInnerHTML={{ __html: `try{const stored=localStorage.getItem('urmis-theme');const system=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';const theme=stored||'system';const resolved=theme==='system'?system:theme;document.documentElement.setAttribute('data-theme', resolved);document.documentElement.style.colorScheme=resolved;}catch(e){}` }} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
