"use client"

import * as React from "react"
import { 
  FolderOpen, 
  Grid, 
  Plus, 
  Settings, 
  Trash2, 
  Clock,
  MoreVertical,
  Image as ImageIcon,
  Search,
  LogOut,
  MapPin,
  Share2,
  LayoutDashboard
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Album } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface AppSidebarProps {
  albums: Album[]
  currentAlbumId: string
  onSelectAlbum: (id: string) => void
  onAddAlbum: () => void
  onDeleteAlbum: (id: string) => void
  onOpenSettings: () => void
  onLogout?: () => void
  onSeedSingapore?: () => void
  isSearching?: boolean
  viewMode: 'gallery' | 'dashboard'
  onViewModeChange: (mode: 'gallery' | 'dashboard') => void
}

export function AppSidebar({ 
  albums, 
  currentAlbumId, 
  onSelectAlbum, 
  onAddAlbum,
  onDeleteAlbum,
  onOpenSettings,
  onLogout,
  onSeedSingapore,
  isSearching,
  viewMode,
  onViewModeChange
}: AppSidebarProps) {
  const { toast } = useToast()

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;

    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          toast({
            title: "Link Copied",
            description: "App preview URL copied to clipboard!"
          })
        })
        .catch(() => fallbackCopyTextToClipboard(url));
    } else {
      fallbackCopyTextToClipboard(url);
    }
  }

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      toast({ title: "Link Copied", description: "App URL copied to clipboard!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Copy Failed", description: "Copy manually from address bar." });
    }
    document.body.removeChild(textArea);
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent" suppressHydrationWarning>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ImageIcon className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold font-headline">SnapSpace</span>
                <span className="text-xs text-muted-foreground">Personal space</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={viewMode === 'dashboard'} 
                  onClick={() => onViewModeChange('dashboard')}
                  tooltip="Insights Dashboard"
                  suppressHydrationWarning
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>AI Insights</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={viewMode === 'gallery' && currentAlbumId === 'all'} 
                  onClick={() => { onViewModeChange('gallery'); onSelectAlbum('all'); }}
                  tooltip="All Photos"
                  suppressHydrationWarning
                >
                  <Grid className="h-4 w-4" />
                  <span>All Photos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={viewMode === 'gallery' && currentAlbumId === 'recent'}
                  onClick={() => { onViewModeChange('gallery'); onSelectAlbum('recent'); }}
                  tooltip="Recent (Last 7 Days)"
                  suppressHydrationWarning
                >
                  <Clock className="h-4 w-4" />
                  <span>Recent</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between pr-2">
            <SidebarGroupLabel className="flex items-center gap-2">
              Albums {isSearching && <Search className="h-3 w-3 animate-pulse" />}
            </SidebarGroupLabel>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-md hover:bg-accent" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddAlbum(); }}
              suppressHydrationWarning
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {albums.map((album) => (
                <SidebarMenuItem key={album.id}>
                  <SidebarMenuButton 
                    isActive={viewMode === 'gallery' && currentAlbumId === album.id}
                    onClick={() => { onViewModeChange('gallery'); onSelectAlbum(album.id); }}
                    suppressHydrationWarning
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span>{album.name}</span>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover suppressHydrationWarning>
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuItem className="text-destructive" onClick={() => onDeleteAlbum(album.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Album</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
              {albums.length === 0 && (
                <div className="px-4 py-3 text-xs text-muted-foreground italic">
                  No albums created
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {onSeedSingapore && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={onSeedSingapore}
                    className="text-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/10 border border-cyan-500/20"
                    tooltip="Import Singapore Landmarks"
                    suppressHydrationWarning
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Import Singapore Pack</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2 space-y-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleCopyLink} suppressHydrationWarning>
              <Share2 className="h-4 w-4" />
              <span>Share App Link</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onOpenSettings} suppressHydrationWarning>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {onLogout && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={onLogout} 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                suppressHydrationWarning
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
