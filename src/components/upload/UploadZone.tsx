"use client"

import * as React from "react"
import { Upload, X, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { aiImageAutoTagging } from "@/ai/flows/ai-image-auto-tagging"
import { GalleryImage } from "@/lib/types"

interface UploadZoneProps {
  onUploadComplete: (newImages: GalleryImage[]) => void
  currentAlbumId?: string
}

export function UploadZone({ onUploadComplete, currentAlbumId }: UploadZoneProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [previews, setPreviews] = React.useState<{ file: File; url: string; aiSuggesting: boolean }[]>([])
  const { toast } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const processFiles = async (files: FileList | null) => {
    if (!files) return

    const validFiles: { file: File; url: string; aiSuggesting: boolean }[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 5MB limit.`,
          variant: "destructive"
        })
        continue
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        toast({
          title: "Unsupported format",
          description: `${file.name} is not a supported image format.`,
          variant: "destructive"
        })
        continue
      }
      validFiles.push({ file, url: URL.createObjectURL(file), aiSuggesting: false })
    }

    if (validFiles.length > 0) {
      setPreviews(prev => [...prev, ...validFiles])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const removePreview = (index: number) => {
    const newPreviews = [...previews]
    URL.revokeObjectURL(newPreviews[index].url)
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)
  }

  const startUpload = async () => {
    if (previews.length === 0) return
    setIsUploading(true)
    setUploadProgress(0)

    const uploadedImages: GalleryImage[] = []
    let aiFailureCount = 0

    for (let i = 0; i < previews.length; i++) {
      const preview = previews[i]
      
      const reader = new FileReader()
      const dataUriPromise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(preview.file)
      })
      
      const dataUri = await dataUriPromise

      // AI Auto-tagging
      let aiResult = { tags: [], caption: "" }
      try {
        aiResult = await aiImageAutoTagging({ imageDataUri: dataUri })
      } catch (err) {
        console.warn("AI Auto-tagging failed for", preview.file.name, err)
        aiFailureCount++
      }

      // Determine albumId - Firestore doesn't support 'undefined'. Use 'null' instead.
      const albumIdToSave = (currentAlbumId === 'all' || currentAlbumId === 'recent') ? null : (currentAlbumId || null)

      const newImage: GalleryImage = {
        id: Math.random().toString(36).substring(7),
        url: dataUri,
        title: preview.file.name.split('.')[0],
        caption: aiResult.caption || "",
        tags: aiResult.tags || [],
        albumId: albumIdToSave as string, // Cast for type safety but it's null-safe for Firestore
        createdAt: Date.now(),
        size: preview.file.size,
        type: preview.file.type
      }

      uploadedImages.push(newImage)
      setUploadProgress(Math.round(((i + 1) / previews.length) * 100))
    }

    onUploadComplete(uploadedImages)
    setPreviews([])
    setIsUploading(false)
    setUploadProgress(0)
    
    if (aiFailureCount > 0) {
      toast({
        title: "Upload complete with AI warnings",
        description: `Added ${uploadedImages.length} images. ${aiFailureCount} image(s) could not be auto-tagged due to service demand.`,
        variant: "default"
      })
    } else {
      toast({
        title: "Upload Successful",
        description: `Added ${uploadedImages.length} images to your gallery.`
      })
    }
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all cursor-pointer
          ${isDragging ? 'border-accent bg-accent/5 scale-[1.01]' : 'border-muted-foreground/20 hover:border-accent/50 hover:bg-secondary/30'}
        `}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => processFiles(e.target.files)}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-accent/10 p-4">
            <Upload className="h-8 w-8 text-accent" />
          </div>
          <div>
            <p className="text-lg font-semibold font-headline">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground">JPEG, PNG, WebP, GIF (max. 5MB per image)</p>
          </div>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm animate-in fade-in duration-300">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-headline">
              Upload Preview ({previews.length})
            </h3>
            {!isUploading && (
              <Button variant="ghost" size="sm" onClick={() => setPreviews([])} className="text-destructive" suppressHydrationWarning>
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {previews.map((preview, index) => (
              <div key={index} className="group relative aspect-square overflow-hidden rounded-lg bg-secondary border">
                <img src={preview.url} alt="preview" className="h-full w-full object-cover" />
                {!isUploading && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removePreview(index); }}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
                    suppressHydrationWarning
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="text-accent">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-accent" />
                <span>AI will automatically tag your images</span>
              </div>
              <Button 
                onClick={startUpload} 
                disabled={isUploading} 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                suppressHydrationWarning
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Start Upload'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
