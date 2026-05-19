
"use client"

import * as React from "react"
import { Share, PlusSquare, X, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

export function PwaInstallPrompt() {
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    // Show prompt only if on mobile and not already in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isMobile && !isStandalone) {
      // Show after a short delay
      const timer = setTimeout(() => setIsVisible(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [isMobile])

  if (!isVisible) return null

  return (
    <div className="pwa-install-prompt animate-in slide-in-from-bottom-full duration-500">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-headline">Install SnapSpace</h4>
            <p className="text-xs text-primary-foreground/80 leading-tight mt-0.5">
              Add to your home screen for the full app experience.
            </p>
          </div>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-white/60 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="mt-4 flex flex-col gap-2 rounded-lg bg-black/10 p-3 text-[11px] font-medium border border-white/10">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-white/20">1</span>
          <span>Tap the <Share className="inline h-3 w-3 mx-0.5" /> Share button below</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-white/20">2</span>
          <span>Select <PlusSquare className="inline h-3 w-3 mx-0.5" /> "Add to Home Screen"</span>
        </div>
      </div>
      
      <Button 
        variant="secondary" 
        className="mt-4 w-full h-9 text-xs font-bold"
        onClick={() => setIsVisible(false)}
      >
        Got it!
      </Button>
    </div>
  )
}
