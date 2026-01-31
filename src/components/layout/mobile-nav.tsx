"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    label: "Races",
    href: "/",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  {
    label: "About",
    href: "/about",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme, resolvedTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  return (
    <>
      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">SW</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Stintwise</span>
        </Link>
        
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={cycleTheme}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label={`Theme: ${theme}`}
          >
            {resolvedTheme === "dark" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {/* Menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <nav
        className={cn(
          "fixed top-14 left-0 right-0 z-50 bg-card border-b border-border p-4 space-y-1 lg:hidden transition-transform duration-200",
          open ? "translate-y-0" : "-translate-y-full pointer-events-none"
        )}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === "/" && pathname.startsWith("/race"))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
