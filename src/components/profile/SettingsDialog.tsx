"use client"

import * as React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "firebase/auth"
import { Firestore, doc, serverTimestamp } from "firebase/firestore"
import { updateDocumentNonBlocking } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import { useDoc } from "@/firebase"
import { useMemoFirebase } from "@/firebase"
import { Loader2, User as UserIcon, Mail, Shield } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  db: Firestore | null
}

export function SettingsDialog({ open, onOpenChange, user, db }: SettingsDialogProps) {
  const { toast } = useToast()
  
  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])

  const { data: profile, isLoading } = useDoc(userRef)
  const [displayName, setDisplayName] = React.useState("")

  React.useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName)
    }
  }, [profile])

  const handleSave = () => {
    if (!userRef || !displayName.trim()) return

    updateDocumentNonBlocking(userRef, {
      displayName: displayName.trim(),
      updatedAt: serverTimestamp()
    })

    toast({
      title: "Profile Updated",
      description: "Your settings have been saved to the cloud."
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-accent" />
            Profile Settings
          </DialogTitle>
          <DialogDescription>
            Manage your personal space and display preferences.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="col-span-3"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Account Email</Label>
              <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user?.email || "Guest User"}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-accent/5 p-3 border border-accent/10">
              <Shield className="h-4 w-4 text-accent" />
              <p className="text-[11px] text-muted-foreground">
                Your data is securely stored in a private Firestore instance. Only you have access to your images.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-accent text-accent-foreground">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
