import { apiRequest } from './http'

export interface Member {
  id: number
  name: string
  email: string
  nickname: string
  createdAt: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
  nickname: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  member: Member
}

export async function signup(
  request: SignupRequest,
): Promise<void> {
  await apiRequest<void>(
    '/api/members',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
  )
}

export async function login(
  request: LoginRequest,
  rememberLogin = false,
): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>(
    '/api/members/login',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
  )

  const storage = rememberLogin
    ? localStorage
    : sessionStorage

  localStorage.removeItem('accessToken')
  localStorage.removeItem('member')

  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('member')

  storage.setItem(
    'accessToken',
    response.accessToken,
  )

  storage.setItem(
    'member',
    JSON.stringify(response.member),
  )

  return response
}

export function logout(): void {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('member')

  localStorage.removeItem('accessToken')
  localStorage.removeItem('member')
}

export function getAccessToken(): string | null {
  return (
    sessionStorage.getItem('accessToken') ??
    localStorage.getItem('accessToken')
  )
}

export function getStoredMember(): Member | null {
  const storedMember =
    sessionStorage.getItem('member') ??
    localStorage.getItem('member')

  if (!storedMember) {
    return null
  }

  try {
    return JSON.parse(storedMember) as Member
  } catch {
    return null
  }
}