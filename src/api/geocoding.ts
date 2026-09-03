import { apiRequest, ApiError } from './http'

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY

export interface LocationSearchResult {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

interface MapTilerFeature {
  id: string
  text: string
  text_ko?: string
  text_en?: string
  place_name: string
  place_name_ko?: string
  place_name_en?: string
  center: [number, number]
  relevance?: number
}

interface MapTilerGeocodingResponse {
  features: MapTilerFeature[]
}

const searchKakaoLocations = async (
  query: string,
): Promise<LocationSearchResult[]> => {
  return apiRequest<LocationSearchResult[]>(
    `/api/locations/search?query=${encodeURIComponent(query)}`,
    {
      method: 'GET',
    },
  )
}

const searchMapTilerLocations = async (
  query: string,
): Promise<LocationSearchResult[]> => {
  const params = new URLSearchParams({
    key: MAPTILER_API_KEY,
    language: 'ko,en',
    limit: '8',
    types:
      'poi,address,road,place,locality,neighbourhood,municipality',
  })

  const response = await fetch(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?${params}`,
  )

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `장소 검색에 실패했습니다. (${response.status})`,
    )
  }

  const data =
    await response.json() as MapTilerGeocodingResponse

  return data.features
    .filter(
      (feature) =>
        feature.relevance === undefined ||
        feature.relevance >= 0.5,
    )
    .map((feature) => ({
      id: `maptiler-${feature.id}`,
      name:
        feature.text_ko ??
        feature.text_en ??
        feature.text,
      address:
        feature.place_name_ko ??
        feature.place_name_en ??
        feature.place_name,
      longitude: feature.center[0],
      latitude: feature.center[1],
    }))
}

const removeDuplicateLocations = (
  locations: LocationSearchResult[],
) => {
  const seen = new Set<string>()

  return locations.filter((location) => {
    const key = [
      location.name.trim().toLowerCase(),
      location.latitude.toFixed(4),
      location.longitude.toFixed(4),
    ].join(':')

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

export async function searchLocations(
  query: string,
): Promise<LocationSearchResult[]> {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const [kakaoResult, mapTilerResult] =
    await Promise.allSettled([
      searchKakaoLocations(trimmedQuery),
      searchMapTilerLocations(trimmedQuery),
    ])

  const kakaoLocations =
    kakaoResult.status === 'fulfilled'
      ? kakaoResult.value
      : []

  const mapTilerLocations =
    mapTilerResult.status === 'fulfilled'
      ? mapTilerResult.value
      : []

  if (
    kakaoResult.status === 'rejected' &&
    mapTilerResult.status === 'rejected'
  ) {
    throw mapTilerResult.reason
  }

  return removeDuplicateLocations([
    ...kakaoLocations,
    ...mapTilerLocations,
  ]).slice(0, 8)
}