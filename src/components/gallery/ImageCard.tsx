"use client"

import * as React from "react"
import { GalleryImage } from "@/lib/types"
import { MoreHorizontal, Trash2, Download, ExternalLink, Info } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface ImageCardProps {
  image: GalleryImage
  onDelete: () => void
  onUpdate: (image: GalleryImage) => void
  onClick: () => void
  viewMode: 'grid' | 'list'
}

export function ImageCard({ image, onDelete, onUpdate, onClick, viewMode }: ImageCardProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    const link = document.createElement('a')
    link.href = image.url
    link.download = `${image.title || 'image'}.${image.type.split('/')[1]}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (viewMode === 'list') {
    return (
      <div 
        className="group relative flex items-center gap-4 rounded-xl border bg-card p-3 shadow-sm transition-all hover:bg-secondary/50 cursor-pointer"
        onClick={onClick}
      >
        <div className="h-16 w-16 overflow-hidden rounded-lg bg-secondary shrink-0">
          <img src={image.url} alt={image.title} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate font-headline">{image.title}</h4>
          <p className="text-xs text-muted-foreground truncate">{image.caption || 'No caption'}</p>
        </div>
        <div className="hidden md:flex flex-wrap gap-1 max-w-[200px]">
          {image.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px] h-5">{tag}</Badge>
          ))}
          {image.tags.length > 2 && <span className="text-[10px] text-muted-foreground">+{image.tags.length - 2}</span>}
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
          {formatDistanceToNow(image.createdAt)} ago
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <ImageActionsMenu onDelete={onDelete} onDownload={handleDownload} />
        </div>
      </div>
    )
  }

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-secondary">
        <img 
          src={image.url} 
          alt={image.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
          loading="lazy"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-b from-black/40 to-transparent">
          <Badge variant="secondary" className="bg-white/90 text-primary border-none shadow-sm backdrop-blur-sm">
            {(image.size / 1024 / 1024).toFixed(1)} MB
          </Badge>
          <ImageActionsMenu onDelete={onDelete} onDownload={handleDownload} />
        </div>
      </div>
      
      <div className="flex flex-col p-4">
        <div className="mb-1 flex items-start justify-between">
          <h4 className="font-semibold leading-none truncate font-headline">{image.title}</h4>
        </div>
        <p className="line-clamp-1 text-xs text-muted-foreground mb-3 h-4">
          {image.caption || 'Add a caption...'}
        </p>
        
        <div className="flex flex-wrap gap-1 mt-auto">
          {image.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 border-accent/20 text-accent-foreground">
              {tag}
            </Badge>
          ))}
          {image.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground pl-1">+{image.tags.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function ImageActionsMenu({ onDelete, onDownload }: { onDelete: () => void, onDownload: (e: React.MouseEvent) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-black/20 text-white hover:bg-black/40 hover:text-white backdrop-blur-sm border-none md:opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          <span>Download</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>Share Link</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
