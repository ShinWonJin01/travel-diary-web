interface NominatimSearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export interface LocationSearchResult {
  id: number
  name: string
  latitude: number
  longitude: number
}

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'

export async function searchLocations(
  query: string,
): Promise<LocationSearchResult[]> {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const params = new URLSearchParams({
    q: trimmedQuery,
    format: 'jsonv2',
    limit: '5',
    'accept-language': 'ko',
  })

  const response = await fetch(
    `${NOMINATIM_SEARCH_URL}?${params.toString()}`,
  )

  if (!response.ok) {
    throw new Error('장소 검색에 실패했습니다.')
  }

  const data: NominatimSearchResult[] = await response.json()

  return data
    .map((item) => ({
      id: item.place_id,
      name: item.display_name,
      latitude: Number(item.lat),
      longitude: Number(item.lon),
    }))
    .filter(
      (item) =>
        Number.isFinite(item.latitude) &&
        Number.isFinite(item.longitude),
    )
}