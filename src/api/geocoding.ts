import { apiRequest } from './http'

export interface LocationSearchResult {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

export async function searchLocations(
  query: string,
): Promise<LocationSearchResult[]> {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  return apiRequest<LocationSearchResult[]>(
    `/api/locations/search?query=${encodeURIComponent(trimmedQuery)}`,
    {
      method: 'GET',
    },
  )
}