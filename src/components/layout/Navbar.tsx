"use client"

import * as React from "react"
import { Search, X, Image as ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface NavbarProps {
  onSearch: (term: string) => void
}

export function Navbar({ onSearch }: NavbarProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false)
  const [localSearchTerm, setLocalSearchTerm] = React.useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setLocalSearchTerm(term)
    onSearch(term)
  }

  const triggerSearch = () => {
    onSearch(localSearchTerm)
  }

  const clearSearch = () => {
    setLocalSearchTerm("")
    onSearch("")
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className={cn("flex items-center gap-4 transition-all", isMobileSearchOpen && "hidden sm:flex")}>
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <ImageIcon className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary font-headline hidden min-[400px]:block">SnapSpace</span>
        </div>
      </div>

      <div className={cn(
        "flex-1 max-w-md transition-all duration-300 ease-in-out",
        isMobileSearchOpen ? "flex mx-0" : "hidden sm:flex mx-4"
      )}>
        <div className="relative flex w-full items-center gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <Input
              placeholder="Search photos..."
              value={localSearchTerm}
              className="pl-9 pr-10 bg-secondary/50 border-transparent focus-visible:ring-accent transition-all duration-200 h-10"
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && triggerSearch()}
              autoFocus={isMobileSearchOpen}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {localSearchTerm && (
                <button 
                  onClick={clearSearch}
                  className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors"
                  type="button"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <Button 
            size="sm" 
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm px-4 h-10 hidden md:flex"
            onClick={triggerSearch}
          >
            Search
          </Button>
          {isMobileSearchOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileSearchOpen(false)} 
              className="sm:hidden h-10 w-10 shrink-0" 
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className={cn("flex items-center gap-2 transition-all", isMobileSearchOpen && "hidden sm:flex")}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="sm:hidden rounded-full hover:bg-secondary" 
          onClick={() => setIsMobileSearchOpen(true)}
          aria-label="Toggle search"
        >
          <Search className="h-5 w-5" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}
