"use client"

import * as React from "react"
import { 
  FolderOpen, 
  Grid, 
  Plus, 
  Settings, 
  Trash2, 
  Clock,
  MoreVertical
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

interface AppSidebarProps {
  albums: Album[]
  currentAlbumId: string
  onSelectAlbum: (id: string) => void
  onAddAlbum: () => void
  onDeleteAlbum: (id: string) => void
}

export function AppSidebar({ 
  albums, 
  currentAlbumId, 
  onSelectAlbum, 
  onAddAlbum,
  onDeleteAlbum 
}: AppSidebarProps) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <ImageIcon className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold font-headline">My Gallery</span>
                <span className="text-xs text-muted-foreground">Personal space</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={currentAlbumId === 'all'} 
                  onClick={() => onSelectAlbum('all')}
                  tooltip="All Photos"
                >
                  <Grid />
                  <span>All Photos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Recent">
                  <Clock />
                  <span>Recent</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between pr-2">
            <SidebarGroupLabel>Albums</SidebarGroupLabel>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-md" 
              onClick={onAddAlbum}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {albums.filter(a => a.id !== 'all').map((album) => (
                <SidebarMenuItem key={album.id}>
                  <SidebarMenuButton 
                    isActive={currentAlbumId === album.id}
                    onClick={() => onSelectAlbum(album.id)}
                  >
                    <FolderOpen />
                    <span>{album.name}</span>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreVertical />
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
              {albums.filter(a => a.id !== 'all').length === 0 && (
                <div className="px-4 py-3 text-xs text-muted-foreground italic">
                  No albums created yet
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
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
