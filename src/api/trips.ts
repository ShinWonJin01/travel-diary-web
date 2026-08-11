import { apiRequest } from './http'

export interface TripCreateRequest {
  title: string
  destination: string
  startDate: string
  endDate: string | null
  description: string
}

export interface TripUpdateRequest {
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

export type TripRole = 'OWNER' | 'MEMBER'

export interface TripListItem extends Trip {
  role: TripRole
  participantCount: number
}

export interface TripParticipant {
  memberId: number
  nickname: string
  profileImagePath: string | null
  role: TripRole
}

export interface TripPhoto {
  id: number
  tripId: number
  uploadedByMemberId: number | null
  uploadedByNickname: string | null
  filePath: string
  originalFileName: string
  takenAt: string | null
  latitude: number | null
  longitude: number | null
  locationName: string | null
  memo: string | null
  createdAt: string
}

export interface TripSummary {
  totalCount: number
  ownedCount: number
  participatingCount: number
}

export async function createTrip(
  request: TripCreateRequest,
): Promise<Trip> {
  return apiRequest<Trip>('/api/trips', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function updateTrip(
  tripId: number,
  request: TripUpdateRequest,
): Promise<Trip> {
  return apiRequest<Trip>(`/api/trips/${tripId}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export async function deleteTrip(tripId: number): Promise<void> {
  await apiRequest<void>(`/api/trips/${tripId}`, {
    method: 'DELETE',
  })
}

export async function leaveTrip(tripId: number): Promise<void> {
  await apiRequest<void>(`/api/trips/${tripId}/members/me`, {
    method: 'DELETE',
  })
}

export async function getTrips(): Promise<TripListItem[]> {
  return apiRequest<TripListItem[]>('/api/trips', {
    method: 'GET',
  })
}

export async function getTripSummary(): Promise<TripSummary> {
  return apiRequest<TripSummary>('/api/trips/summary', {
    method: 'GET',
  })
}

export async function getTripDetail(
  tripId: number,
): Promise<Trip> {
  return apiRequest<Trip>(
    `/api/trips/${tripId}`,
    {
      method: 'GET',
    },
  )
}

export async function getTripParticipants(
  tripId: number,
): Promise<TripParticipant[]> {
  return apiRequest<TripParticipant[]>(`/api/trips/${tripId}/members`, {
    method: 'GET',
  })
}

export async function getTripPhotos(
  tripId: number,
): Promise<TripPhoto[]> {
  return apiRequest<TripPhoto[]>(`/api/trips/${tripId}/photos`, {
    method: 'GET',
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

export async function uploadTripPhoto(
  tripId: number,
  file: File,
): Promise<TripPhoto> {
  const formData = new FormData()

  formData.append('file', file)

  return apiRequest<TripPhoto>(
    `/api/trips/${tripId}/photos`,
    {
      method: 'POST',
      body: formData,
    },
  )
}

export async function deleteTripPhoto(
  tripId: number,
  photoId: number,
): Promise<void> {
  await apiRequest<void>(
    `/api/trips/${tripId}/photos/${photoId}`,
    {
      method: 'DELETE',
    },
  )
}

export async function updateTripPhotoMemo(
  tripId: number,
  photoId: number,
  memo: string,
): Promise<TripPhoto> {
  return apiRequest<TripPhoto>(
    `/api/trips/${tripId}/photos/${photoId}/memo`,
    {
      method: 'PATCH',
      body: JSON.stringify({ memo }),
    },
  )
}

export async function updateTripPhotoTakenAt(
  tripId: number,
  photoId: number,
  takenAt: string | null,
): Promise<TripPhoto> {
  return apiRequest<TripPhoto>(
    `/api/trips/${tripId}/photos/${photoId}/taken-at`,
    {
      method: 'PATCH',
      body: JSON.stringify({ takenAt }),
    },
  )
}

export async function sendTripInvitation(
  tripId: number,
  nickname: string,
): Promise<void> {
  await apiRequest<void>(`/api/trips/${tripId}/invitations`, {
    method: 'POST',
    body: JSON.stringify({ nickname }),
  })
}