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
import { AuthScreen } from "@/components/auth/AuthScreen"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Insights } from "@/components/dashboard/Insights"
import { SettingsDialog } from "@/components/profile/SettingsDialog"
import { 
  useUser, 
  useAuth,
  useFirestore, 
  useCollection, 
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  initiateSignOut
} from "@/firebase"
import { 
  collection, 
  doc, 
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore"
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
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()

  const [viewMode, setViewMode] = React.useState<'gallery' | 'dashboard'>('gallery')
  const [currentAlbumId, setCurrentAlbumId] = React.useState<string>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedImage, setSelectedImage] = React.useState<GalleryImage | null>(null)
  const [imageToDelete, setImageToDelete] = React.useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)

  const albumsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "albums"), orderBy("createdAt", "desc"))
  }, [db, user])

  const imagesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "images"),
      orderBy("createdAt", "desc")
    )
  }, [db, user])

  const { data: albumsData } = useCollection<Album>(albumsQuery)
  const { data: imagesData, isLoading: isImagesLoading } = useCollection<GalleryImage>(imagesQuery)

  const albums = React.useMemo(() => albumsData || [], [albumsData])
  const images = React.useMemo(() => imagesData || [], [imagesData])

  const filteredImages = React.useMemo(() => {
    return images.filter(image => {
      let matchesAlbum = true
      
      if (!searchTerm) {
        if (currentAlbumId === 'all') {
          matchesAlbum = true
        } else if (currentAlbumId === 'recent') {
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
          const createdAtDate = (image.createdAt as any)?.toDate?.() || 
                               (typeof image.createdAt === 'number' ? new Date(image.createdAt) : new Date())
          matchesAlbum = createdAtDate.getTime() > sevenDaysAgo
        } else {
          matchesAlbum = image.albumId === currentAlbumId
        }
      }

      const term = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm || 
                           (image.title || '').toLowerCase().includes(term) || 
                           (image.caption?.toLowerCase() || '').includes(term) ||
                           (image.tags || []).some(tag => tag.toLowerCase().includes(term))
      
      return matchesAlbum && matchesSearch
    })
  }, [images, currentAlbumId, searchTerm])

  const handleUploadComplete = (newImages: GalleryImage[]) => {
    if (!user || !db) return
    const imagesRef = collection(db, "users", user.uid, "images")
    newImages.forEach(img => {
      addDocumentNonBlocking(imagesRef, {
        ...img,
        userId: user.uid,
        createdAt: serverTimestamp()
      })
    })
  }

  const handleDeleteImage = () => {
    if (!imageToDelete || !user || !db) return
    const docRef = doc(db, "users", user.uid, "images", imageToDelete)
    deleteDocumentNonBlocking(docRef)
    if (selectedImage?.id === imageToDelete) setSelectedImage(null)
    setImageToDelete(null)
    toast({ title: "Image Deleted", description: "Removed from your gallery." })
  }

  const handleUpdateImage = (updatedImage: GalleryImage) => {
    if (!user || !db) return
    const docRef = doc(db, "users", user.uid, "images", updatedImage.id)
    updateDocumentNonBlocking(docRef, { ...updatedImage, updatedAt: serverTimestamp() })
    if (selectedImage?.id === updatedImage.id) setSelectedImage(updatedImage)
  }

  const handleAddAlbum = () => {
    if (!user || !db) return
    const name = window.prompt("Enter album name:")
    if (!name?.trim()) return
    const albumsRef = collection(db, "users", user.uid, "albums")
    addDocumentNonBlocking(albumsRef, {
      name: name.trim(),
      userId: user.uid,
      createdAt: serverTimestamp()
    })
  }

  const handleDeleteAlbum = (id: string) => {
    if (!user || !db) return
    if (window.confirm("Delete this album? Photos will remain in 'All Photos'.")) {
      const albumRef = doc(db, "users", user.uid, "albums", id)
      deleteDocumentNonBlocking(albumRef)
      images.filter(img => img.albumId === id).forEach(img => {
        const imageRef = doc(db, "users", user.uid, "images", img.id)
        updateDocumentNonBlocking(imageRef, { albumId: null })
      })
      if (currentAlbumId === id) setCurrentAlbumId('all')
    }
  }

  const handleSeedSingaporeData = () => {
    if (!user || !db || isImagesLoading) return
    const imagesRef = collection(db, "users", user.uid, "images")
    const singaporeIds = ["21", "22", "23", "24", "25", "26"]
    const singaporeImages = PlaceHolderImages.filter(img => singaporeIds.includes(img.id))
    const existingTitles = new Set(images.map(img => img.title))
    const uniqueSamples = singaporeImages.filter(img => !existingTitles.has(img.description))

    uniqueSamples.forEach(img => {
      addDocumentNonBlocking(imagesRef, {
        url: img.imageUrl,
        title: img.description,
        caption: `AI-identified Singapore landmark: ${img.description}.`,
        tags: ["singapore", "travel", "architecture", "landscape"],
        size: 1024 * 1024 * 1.5,
        type: "image/jpeg",
        userId: user.uid,
        albumId: null,
        createdAt: serverTimestamp()
      })
    })

    toast({ title: "Singapore Pack Imported", description: `Added ${uniqueSamples.length} photos.` })
  }

  if (isUserLoading) {
    return <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">Syncing SnapSpace...</div>
  }

  if (!user) return <AuthScreen />

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar 
          albums={albums} 
          currentAlbumId={currentAlbumId}
          onSelectAlbum={setCurrentAlbumId}
          onAddAlbum={handleAddAlbum}
          onDeleteAlbum={handleDeleteAlbum}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={() => initiateSignOut(auth)}
          onSeedSingapore={handleSeedSingaporeData}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        
        <SidebarInset className="flex flex-col">
          <Navbar onSearch={setSearchTerm} />
          
          <main className="flex-1 p-6 md:p-10 space-y-10 max-w-7xl mx-auto w-full">
            {viewMode === 'dashboard' ? (
              <Insights images={images} />
            ) : (
              <>
                <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <UploadZone onUploadComplete={handleUploadComplete} currentAlbumId={currentAlbumId} />
                </section>
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <GalleryGrid 
                    images={filteredImages} 
                    onDelete={setImageToDelete} 
                    onUpdate={handleUpdateImage}
                    onImageClick={setSelectedImage}
                    currentAlbumId={currentAlbumId}
                    hasAnyImages={images.length > 0}
                    searchTerm={searchTerm}
                  />
                </section>
              </>
            )}
          </main>
        </SidebarInset>

        <Lightbox 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)}
          onNext={() => {
            const index = filteredImages.findIndex(img => img.id === selectedImage?.id)
            if (index !== -1) setSelectedImage(filteredImages[(index + 1) % filteredImages.length])
          }}
          onPrev={() => {
            const index = filteredImages.findIndex(img => img.id === selectedImage?.id)
            if (index !== -1) setSelectedImage(filteredImages[(index - 1 + filteredImages.length) % filteredImages.length])
          }}
          onDelete={() => selectedImage && setImageToDelete(selectedImage.id)}
          onUpdate={handleUpdateImage}
        />

        <SettingsDialog 
          open={isSettingsOpen} 
          onOpenChange={setIsSettingsOpen} 
          user={user} 
          db={db} 
        />

        <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Image?</AlertDialogTitle>
              <AlertDialogDescription>Permanently remove this image from your cloud storage.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel suppressHydrationWarning>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteImage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" suppressHydrationWarning>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Toaster />
      </div>
    </SidebarProvider>
  )
}
