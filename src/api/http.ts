const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    sessionStorage.getItem('accessToken') ??
    localStorage.getItem('accessToken')
    
  const headers = new Headers(options.headers)

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const responseText = await response.text()

  let responseData: unknown = null

  if (responseText) {
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }
  }

  if (!response.ok) {
    const message =
      typeof responseData === 'object' &&
      responseData !== null &&
      'message' in responseData
        ? String(responseData.message)
        : '요청을 처리하는 중 오류가 발생했습니다.'

    throw new ApiError(response.status, message)
  }

  return responseData as T
}