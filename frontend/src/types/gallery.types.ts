export interface GalleryItem {
  id: number;
  displayName: string;
  storageName?: string;
  thumbnailUrl: string;
  zipUrl?: string;
  isActive: boolean;
  createdAt: string;
}
