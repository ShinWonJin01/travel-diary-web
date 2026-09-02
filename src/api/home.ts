import { apiRequest } from './http'

export interface RecentActivity {
  tripId: number
  tripTitle: string
  actorId: number
  actorNickname: string
  actorProfileImagePath: string | null
  photoCount: number
  createdAt: string
}

export async function getRecentActivities(): Promise<RecentActivity[]> {
  return apiRequest<RecentActivity[]>(
    '/api/home/recent-activities',
    {
      method: 'GET',
    },
  )
}