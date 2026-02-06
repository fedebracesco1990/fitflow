import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AppNotificationDto {
  id: string;
  title: string;
  body: string;
  type: string | null;
  targetType: 'user' | 'broadcast';
  createdAt: string;
  read: boolean;
}

export interface GetNotificationsResponse {
  notifications: AppNotificationDto[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsApiService {
  private readonly api = inject(ApiService);

  getMyNotifications(limit = 50, offset = 0): Observable<GetNotificationsResponse> {
    return this.api.get<GetNotificationsResponse>('notifications/my', { limit, offset });
  }

  markAsRead(notificationId: string): Observable<{ message: string }> {
    return this.api.patch<{ message: string }>(`notifications/${notificationId}/read`);
  }

  markAllAsRead(): Observable<{ marked: number }> {
    return this.api.patch<{ marked: number }>('notifications/read-all');
  }
}
