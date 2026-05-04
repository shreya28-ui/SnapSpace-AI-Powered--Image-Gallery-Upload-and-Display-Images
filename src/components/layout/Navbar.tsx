"use client"

import * as React from "react"
import { Search, Image as ImageIcon, Mic } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface NavbarProps {
  onSearch: (term: string) => void
}

export function Navbar({ onSearch }: NavbarProps) {
  const [isListening, setIsListening] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    onSearch(val);
  };

  const startVoiceSearch = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      alert("Your browser does not support Voice Search.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSearchChange(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ImageIcon className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary font-headline">SnapSpace</span>
        </div>
      </div>

      <div className="mx-4 flex-1 max-w-md hidden sm:block">
        <div className="relative group flex items-center">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <Input
            value={searchValue}
            placeholder="Search by caption or filename..."
            className="pl-9 pr-10 bg-secondary/50 border-transparent focus-visible:ring-accent transition-all duration-200"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <button
            type="button"
            onClick={startVoiceSearch}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
              isListening ? "bg-red-500 text-white animate-pulse" : "text-muted-foreground hover:text-accent hover:bg-secondary"
            }`}
            title="Voice Search"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
