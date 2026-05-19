"use client"

import * as React from "react"
import { GalleryImage } from "@/lib/types"
import { X, ChevronLeft, ChevronRight, Info, Calendar, FileText, Tag, Trash2, Download, Image as ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { doc } from "firebase/firestore"
import { updateDocumentNonBlocking } from "@/firebase"
import { useFirestore, useUser } from "@/firebase"
import { useToast } from "@/hooks/use-toast"

interface LightboxProps {
  image: GalleryImage | null
  onClose: () => void
  onNext?: () => void
  onPrev?: () => void
  onDelete?: () => void
  onUpdate: (image: GalleryImage) => void
}

export function Lightbox({ image, onClose, onNext, onPrev, onDelete, onUpdate }: LightboxProps) {
  const [showDetails, setShowDetails] = React.useState(true)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedImage, setEditedImage] = React.useState<GalleryImage | null>(null)
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  React.useEffect(() => {
    if (image) {
      setEditedImage(image)
      setIsEditing(false)
    }
  }, [image])

  const dateValue = React.useMemo(() => {
    if (!image || !image.createdAt) return new Date();
    if (typeof image.createdAt.toDate === 'function') {
      return image.createdAt.toDate();
    }
    const parsed = new Date(image.createdAt);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [image?.createdAt])

  if (!image) return null

  const handleSave = () => {
    if (editedImage) {
      onUpdate(editedImage)
      setIsEditing(false)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = `${image.title || 'image'}.${image.type.split('/')[1]}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 overflow-hidden border-none bg-black/95 gap-0 flex flex-col md:flex-row shadow-2xl">
        <DialogTitle className="sr-only">Image Detail - {image.title}</DialogTitle>
        <DialogDescription className="sr-only">View and edit image metadata.</DialogDescription>

        <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden group">
          <img 
            src={image.url} 
            alt={image.title} 
            className="max-h-full max-w-full object-contain animate-in zoom-in-95 duration-300" 
          />
          
          <div className="absolute top-4 left-4 flex gap-2">
             <Button variant="ghost" size="icon" className="rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm" onClick={handleDownload}>
              <Download className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm" onClick={() => setShowDetails(!showDetails)}>
              <Info className="h-5 w-5" />
            </Button>
          </div>

          {onPrev && (
            <button className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/50" onClick={onPrev}>
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}
          
          {onNext && (
            <button className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/50" onClick={onNext}>
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
        </div>

        {showDetails && (
          <div className="w-full md:w-80 bg-background h-full overflow-y-auto p-6 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-headline">Details</h2>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSave} className="bg-accent text-accent-foreground">Save</Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3 w-3" /> Title
                </label>
                {isEditing ? (
                  <Input 
                    value={editedImage?.title} 
                    onChange={(e) => setEditedImage(prev => prev ? {...prev, title: e.target.value} : null)}
                    className="h-8 text-sm"
                  />
                ) : (
                  <p className="text-sm font-medium">{image.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Tag className="h-3 w-3" /> Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {image.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[10px] font-medium px-2 py-0.5 border-none">
                      {tag}
                    </Badge>
                  ))}
                  {image.tags.length === 0 && <span className="text-xs text-muted-foreground italic">No tags</span>}
                </div>
              </div>

              <Separator />

              <div className="pt-2 flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Uploaded</span>
                  <span>{format(dateValue, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Storage</span>
                  <span>{(image.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>

              {onDelete && (
                <div className="pt-6">
                  <Button 
                    variant="ghost" 
                    className="w-full text-destructive hover:bg-destructive/10"
                    onClick={() => { onDelete(); onClose(); }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Image
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
