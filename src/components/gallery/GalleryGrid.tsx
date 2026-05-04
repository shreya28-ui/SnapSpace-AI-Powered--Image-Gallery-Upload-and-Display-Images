"use client"

import * as React from "react"
import { GalleryImage } from "@/lib/types"
import { ImageCard } from "./ImageCard"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GalleryGridProps {
  images: GalleryImage[]
  onDelete: (id: string) => void
  onUpdate: (image: GalleryImage) => void
  onImageClick: (image: GalleryImage) => void
}

export function GalleryGrid({ images, onDelete, onUpdate, onImageClick }: GalleryGridProps) {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest' | 'name'>('newest')

  const sortedImages = React.useMemo(() => {
    return [...images].sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt
      if (sortBy === 'oldest') return a.createdAt - b.createdAt
      return a.title.localeCompare(b.title)
    })
  }, [images, sortBy])

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-20 text-center">
        <div className="mb-4 rounded-full bg-secondary p-6">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold font-headline">Your gallery is empty</h3>
        <p className="mt-2 max-w-xs text-muted-foreground">
          Start by uploading some images or dragging them into the upload zone above.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Gallery</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border bg-card p-1 shadow-sm">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-[160px] bg-card shadow-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={`
        grid gap-6 
        ${viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'}
      `}>
        {sortedImages.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onDelete={() => onDelete(image.id)}
            onUpdate={onUpdate}
            onClick={() => onImageClick(image)}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  )
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}
