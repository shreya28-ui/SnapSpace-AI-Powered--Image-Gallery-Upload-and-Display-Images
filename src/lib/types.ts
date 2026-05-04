export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  caption?: string;
  tags: string[];
  albumId?: string;
  createdAt: number;
  size: number;
  type: string;
  width?: number;
  height?: number;
}

export interface Album {
  id: string;
  name: string;
  createdAt: number;
}