export interface Festival {
  id: number;
  name: string;
  description?: string;
  location?: string;
  link?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFes {
  id: number;
  userId: number;
  festivalId: number;
  isActive: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
  festival?: Festival;
  user?: {
    id: number;
    username: string;
    fullName: string;
    email: string;
  };
}

export interface CreateFestivalRequest {
  name: string;
  description?: string;
  location?: string;
  link?: string;
  startDate: string;
  endDate: string;
}

export interface UpdateFestivalRequest {
  name: string;
  description?: string;
  location?: string;
  link?: string;
  startDate: string;
  endDate: string;
}

export interface CreateNotificationRequest {
  note?: string;
}

export interface UpdateNotificationRequest {
  note?: string;
  isActive?: boolean;
}
