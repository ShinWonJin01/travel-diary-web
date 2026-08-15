import { apiRequest } from './http'

export type NotificationType =
  | 'TRIP_INVITED'
  | 'INVITATION_ACCEPTED'
  | 'INVITATION_REJECTED'
  | 'MEMBER_LEFT_TRIP'
  | 'TRIP_UPDATED'
  | 'TRIP_DELETED'

export interface Notification {
  id: number
  type: NotificationType
  message: string
  tripId: number | null
  read: boolean
  createdAt: string
}

export async function getNotifications(): Promise<Notification[]> {
  return apiRequest<Notification[]>(
    '/api/notifications',
    {
      method: 'GET',
    },
  )
}

export async function getUnreadNotificationCount(): Promise<number> {
  return apiRequest<number>(
    '/api/notifications/unread-count',
    {
      method: 'GET',
    },
  )
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<void> {
  await apiRequest<void>(
    `/api/notifications/${notificationId}/read`,
    {
      method: 'PATCH',
    },
  )
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiRequest<void>(
    '/api/notifications/read-all',
    {
      method: 'PATCH',
    },
  )
}