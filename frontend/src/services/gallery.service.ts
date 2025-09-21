import api from './api.service';

// Lấy tất cả folder (active + inactive)
export const getAllFoldersRaw = async (): Promise<GalleryItem[]> => {
  const response = await api.get('/gallery');
  return response.data.data;
};

export interface GalleryItem {
  id: number;
  displayName: string;
  storageName?: string;
  thumbnailUrl: string;
  zipUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export const galleryService = {
  getAll: async (): Promise<GalleryItem[]> => {
    const response = await api.get('/gallery/folders/active');
    return response.data.data;
  },
  getAllFoldersRaw,
  upload: async (zipFile: File, thumbnail: File, name: string): Promise<GalleryItem> => {
    const formData = new FormData();
    formData.append('file', zipFile);
    formData.append('thumbnail', thumbnail);
    formData.append('displayName', name);
    const response = await api.post('/gallery/folders/uploadZip', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
  update: async (id: number, data: Partial<GalleryItem>): Promise<GalleryItem> => {
    const response = await api.put(`/gallery/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/gallery/folders/${id}`);
  },
  setInactive: async (id: number): Promise<GalleryItem> => {
    const response = await api.put(`/gallery/folders/${id}/active?active=false`);
    return response.data.data;
  },
  setActiveStatus: async (id: number, active: boolean): Promise<GalleryItem> => {
    const response = await api.put(`/gallery/folders/${id}/active?active=${active}`);
    return response.data.data;
  },
  getFolderItems: async (folderId: number) => {
    const response = await api.get(`/gallery/folders/${folderId}/items`);
    return response.data.data;
  },
  search: async (query: string): Promise<GalleryItem[]> => {
    const response = await api.get(`/gallery/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },
  deleteItem: async (itemId: number) => {
    await api.delete(`/gallery/items/${itemId}`);
  },
  setItemActiveStatus: async (itemId: number, active: boolean) => {
    await api.put(`/gallery/items/${itemId}/active?active=${active}`);
  },
  addItemToFolder: async (folderId: number, file: File, type: 'IMAGE' | 'VIDEO') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const response = await api.post(`/gallery/folders/${folderId}/items/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
  getAllSorted: async (): Promise<GalleryItem[]> => {
    const response = await api.get('/gallery/folders/active');
    const data = response.data.data;
    // Sort by createdAt descending (newest first)
    return data.sort((a: GalleryItem, b: GalleryItem) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
};
