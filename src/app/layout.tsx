import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stintwise",
  description: "F1 race analysis - understanding why races unfold the way they do",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const saved = localStorage.getItem('stintwise-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (saved === 'dark' || (!saved && prefersDark) || saved === 'system' && prefersDark) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          
          {/* Mobile navigation */}
          <MobileNav />
          
          {/* Main content area */}
          <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
