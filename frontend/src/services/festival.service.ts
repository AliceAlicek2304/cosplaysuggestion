import axios from 'axios';
import api from './api.service';
import { Festival, CreateFestivalRequest, UpdateFestivalRequest, NotificationFes, CreateNotificationRequest, UpdateNotificationRequest } from '../types/festival.types';

class FestivalService {
  // Festival CRUD operations (Admin only)
  async getAllFestivals(): Promise<Festival[]> {
    const response = await api.get('/festivals/admin/all');
    return response.data.data;
  }

  async createFestival(festival: CreateFestivalRequest): Promise<Festival> {
    const response = await api.post('/festivals/admin', festival);
    return response.data.data;
  }

  async updateFestival(id: number, festival: UpdateFestivalRequest): Promise<Festival> {
    const response = await api.put(`/festivals/admin/${id}`, festival);
    return response.data.data;
  }

  async deleteFestival(id: number): Promise<void> {
    await api.delete(`/festivals/admin/${id}`);
  }

  async toggleFestivalStatus(id: number): Promise<Festival> {
    const response = await api.put(`/festivals/admin/${id}/toggle`);
    return response.data.data;
  }

  // Public festival operations
  async getActiveFestivals(): Promise<Festival[]> {
    const response = await api.get('/festivals/active');
    return response.data.data;
  }

  async getUpcomingFestivals(): Promise<Festival[]> {
    const response = await api.get('/festivals/upcoming');
    return response.data.data;
  }

  async searchFestivals(name?: string): Promise<Festival[]> {
    const params = name ? { name } : {};
    const response = await api.get('/festivals/search', { params });
    return response.data.data;
  }

  async getFestivalById(id: number): Promise<Festival> {
    const response = await api.get(`/festivals/${id}`);
    return response.data.data;
  }

  // Notification operations (Authenticated users)
  async getMyNotifications(): Promise<NotificationFes[]> {
    const response = await api.get('/notifications/fes/my');
    return response.data.data;
  }

  async getMyUpcomingNotifications(): Promise<NotificationFes[]> {
    const response = await api.get('/notifications/fes/my/upcoming');
    return response.data.data;
  }

  async createNotification(festivalId: number, request: CreateNotificationRequest): Promise<NotificationFes> {
    const response = await api.post(`/notifications/fes/festival/${festivalId}`, request);
    return response.data.data;
  }

  async updateNotification(notificationId: number, request: UpdateNotificationRequest): Promise<NotificationFes> {
    const response = await api.put(`/notifications/fes/${notificationId}`, request);
    return response.data.data;
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await api.delete(`/notifications/fes/${notificationId}`);
  }

  async toggleNotificationStatus(notificationId: number): Promise<NotificationFes> {
    const response = await api.put(`/notifications/fes/${notificationId}/toggle`);
    return response.data.data;
  }

  // Admin notification operations
  async getFestivalNotifications(festivalId: number): Promise<NotificationFes[]> {
    const response = await api.get(`/notifications/fes/admin/festival/${festivalId}`);
    return response.data.data;
  }

  async getActiveFestivalsSorted(): Promise<Festival[]> {
    const response = await api.get('/festivals/active');
    const data = response.data.data;
    // Sort by startDate descending (newest first)
    return data.sort((a: Festival, b: Festival) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }
}

export const festivalService = new FestivalService();
