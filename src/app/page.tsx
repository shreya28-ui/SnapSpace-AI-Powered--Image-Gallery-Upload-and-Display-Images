"use client"

import * as React from "react"
import { Navbar } from "@/components/layout/Navbar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { UploadZone } from "@/components/upload/UploadZone"
import { GalleryGrid } from "@/components/gallery/GalleryGrid"
import { Lightbox } from "@/components/gallery/Lightbox"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { GalleryImage, Album } from "@/lib/types"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { 
  getStoredImages, 
  saveImagesToStore, 
  getStoredAlbums, 
  saveAlbumsToStore 
} from "@/lib/firebase"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SnapSpace() {
  const [images, setImages] = React.useState<GalleryImage[]>([])
  const [albums, setAlbums] = React.useState<Album[]>([])
  const [currentAlbumId, setCurrentAlbumId] = React.useState<string>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedImage, setSelectedImage] = React.useState<GalleryImage | null>(null)
  const [imageToDelete, setImageToDelete] = React.useState<string | null>(null)
  
  const { toast } = useToast()

  // Load initial data
  React.useEffect(() => {
    const storedImages = getStoredImages()
    const storedAlbums = getStoredAlbums()
    setImages(storedImages)
    setAlbums(storedAlbums)
  }, [])

  // Filter images based on current album and search term
  const filteredImages = React.useMemo(() => {
    return images.filter(image => {
      const matchesAlbum = currentAlbumId === 'all' || image.albumId === currentAlbumId
      const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (image.caption?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesAlbum && matchesSearch
    })
  }, [images, currentAlbumId, searchTerm])

  const handleUploadComplete = (newImages: GalleryImage[]) => {
    const updatedImages = [...newImages, ...images]
    setImages(updatedImages)
    saveImagesToStore(updatedImages)
  }

  const handleDeleteImage = () => {
    if (!imageToDelete) return
    const updatedImages = images.filter(img => img.id !== imageToDelete)
    setImages(updatedImages)
    saveImagesToStore(updatedImages)
    setImageToDelete(null)
    toast({
      title: "Image Deleted",
      description: "The image has been removed from your gallery."
    })
  }

  const handleUpdateImage = (updatedImage: GalleryImage) => {
    const updatedImages = images.map(img => img.id === updatedImage.id ? updatedImage : img)
    setImages(updatedImages)
    saveImagesToStore(updatedImages)
    if (selectedImage?.id === updatedImage.id) {
      setSelectedImage(updatedImage)
    }
  }

  const handleAddAlbum = () => {
    const name = window.prompt("Enter album name:")
    if (!name) return
    const newAlbum: Album = {
      id: Math.random().toString(36).substring(7),
      name,
      createdAt: Date.now()
    }
    const updatedAlbums = [...albums, newAlbum]
    setAlbums(updatedAlbums)
    saveAlbumsToStore(updatedAlbums)
    toast({
      title: "Album Created",
      description: `"${name}" has been added to your albums.`
    })
  }

  const handleDeleteAlbum = (id: string) => {
    if (confirm("Delete this album? Images inside will remain in 'All Photos'.")) {
      const updatedAlbums = albums.filter(a => a.id !== id)
      setAlbums(updatedAlbums)
      saveAlbumsToStore(updatedAlbums)
      
      // Clear albumId from images that were in this album
      const updatedImages = images.map(img => img.albumId === id ? { ...img, albumId: undefined } : img)
      setImages(updatedImages)
      saveImagesToStore(updatedImages)

      if (currentAlbumId === id) setCurrentAlbumId('all')
    }
  }

  const navigateImage = (direction: 'next' | 'prev') => {
    if (!selectedImage) return
    const index = filteredImages.findIndex(img => img.id === selectedImage.id)
    if (index === -1) return

    let nextIndex
    if (direction === 'next') {
      nextIndex = (index + 1) % filteredImages.length
    } else {
      nextIndex = (index - 1 + filteredImages.length) % filteredImages.length
    }
    setSelectedImage(filteredImages[nextIndex])
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar 
          albums={albums} 
          currentAlbumId={currentAlbumId}
          onSelectAlbum={setCurrentAlbumId}
          onAddAlbum={handleAddAlbum}
          onDeleteAlbum={handleDeleteAlbum}
        />
        
        <SidebarInset className="flex flex-col">
          <Navbar onSearch={setSearchTerm} />
          
          <main className="flex-1 p-6 md:p-10 space-y-10 max-w-7xl mx-auto w-full">
            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
              <UploadZone onUploadComplete={handleUploadComplete} currentAlbumId={currentAlbumId} />
            </section>

            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <GalleryGrid 
                images={filteredImages} 
                onDelete={setImageToDelete} 
                onUpdate={handleUpdateImage}
                onImageClick={setSelectedImage}
              />
            </section>
          </main>
        </SidebarInset>

        <Lightbox 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)}
          onNext={() => navigateImage('next')}
          onPrev={() => navigateImage('prev')}
          onDelete={() => selectedImage && setImageToDelete(selectedImage.id)}
          onUpdate={handleUpdateImage}
        />

        <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Image?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This image will be permanently removed from your storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteImage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Toaster />
      </div>
    </SidebarProvider>
  )
}
