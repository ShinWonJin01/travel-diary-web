import { apiRequest } from './http'

export interface TripCreateRequest {
  title: string
  destination: string
  startDate: string
  endDate: string | null
  description: string
}

export interface Trip {
  id: number
  title: string
  destination: string
  startDate: string
  endDate: string | null
  description: string
  coverImagePath: string | null
  ownerId: number
  ownerNickname: string
  createdAt: string
}

export async function createTrip(
  request: TripCreateRequest,
): Promise<Trip> {
  return apiRequest<Trip>('/api/trips', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function uploadTripCoverImage(
  tripId: number,
  file: File,
): Promise<Trip> {
  const formData = new FormData()

  formData.append('file', file)

  return apiRequest<Trip>(
    `/api/trips/${tripId}/cover-image`,
    {
      method: 'POST',
      body: formData,
    },
  )
}