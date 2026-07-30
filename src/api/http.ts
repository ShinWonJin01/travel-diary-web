const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

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
    console.error('API 요청 실패', {
      path,
      status: response.status,
      responseData,
    })

    let message = `요청을 처리하는 중 오류가 발생했습니다. (${response.status})`

    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'message' in responseData
    ) {
      message = String(responseData.message)
    } else if (
      typeof responseData === 'string' &&
      responseData.trim()
    ) {
      message = responseData
    }

    throw new ApiError(response.status, message)
  }

  if (!responseText) {
    return undefined as T
  }

  return responseData as T
}