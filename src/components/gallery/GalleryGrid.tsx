
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
import { LayoutGrid, List, Image as ImageIcon, Clock, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GalleryGridProps {
  images: GalleryImage[]
  onDelete: (id: string) => void
  onUpdate: (image: GalleryImage) => void
  onImageClick: (image: GalleryImage) => void
  currentAlbumId?: string
  hasAnyImages?: boolean
  searchTerm?: string
}

export function GalleryGrid({ 
  images, 
  onDelete, 
  onUpdate, 
  onImageClick, 
  currentAlbumId,
  hasAnyImages,
  searchTerm
}: GalleryGridProps) {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest' | 'name'>('newest')

  const sortedImages = React.useMemo(() => {
    return [...images].sort((a, b) => {
      const timeA = (a.createdAt as any)?.toDate?.()?.getTime() || (typeof a.createdAt === 'number' ? a.createdAt : 0)
      const timeB = (b.createdAt as any)?.toDate?.()?.getTime() || (typeof b.createdAt === 'number' ? b.createdAt : 0)
      
      if (sortBy === 'newest') return timeB - timeA
      if (sortBy === 'oldest') return timeA - timeB
      return (a.title || '').localeCompare(b.title || '')
    })
  }, [images, sortBy])

  if (sortedImages.length === 0) {
    const isFilterEmpty = hasAnyImages && sortedImages.length === 0;
    
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-20 text-center animate-in fade-in duration-500">
        <div className="mb-4 rounded-full bg-secondary p-6">
          {searchTerm ? (
            <Search className="h-10 w-10 text-muted-foreground animate-pulse" />
          ) : currentAlbumId === 'recent' ? (
            <Clock className="h-10 w-10 text-muted-foreground" />
          ) : (
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
        <h3 className="text-xl font-bold font-headline">
          {searchTerm ? `No results for "${searchTerm}"` : isFilterEmpty ? "No matches found" : "Your gallery is empty"}
        </h3>
        <p className="mt-2 max-w-xs text-muted-foreground">
          {searchTerm 
            ? "Try different keywords or check your spelling. We searched titles, captions, tags, and albums."
            : currentAlbumId === 'recent' && isFilterEmpty
            ? "You haven't uploaded any photos in the last 7 days. Try uploading something new!"
            : isFilterEmpty 
            ? "No images match your current filters."
            : "Start by uploading some images or dragging them into the upload zone above."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight font-headline">
          {searchTerm ? (
            <span className="flex items-center gap-2">
              <Search className="h-5 w-5 text-accent" />
              Search Results
            </span>
          ) : currentAlbumId === 'recent' ? (
            'Recent Photos'
          ) : (
            'Gallery'
          )}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border bg-card p-1 shadow-sm">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
              suppressHydrationWarning
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
              suppressHydrationWarning
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-[160px] bg-card shadow-sm" suppressHydrationWarning>
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
