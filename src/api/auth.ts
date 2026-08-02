import { apiRequest } from './http'

export interface Member {
  id: number
  name: string
  email: string
  nickname: string
  profileImagePath: string | null
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

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UpdateProfileRequest {
  name: string
  nickname: string
}

export interface DeleteAccountRequest {
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

export async function updateProfile(
  request: UpdateProfileRequest,
): Promise<Member> {
  const member = await apiRequest<Member>(
    '/api/members/me',
    {
      method: 'PATCH',
      body: JSON.stringify(request),
    },
  )

  saveStoredMember(member)

  return member
}

export async function uploadProfileImage(
  file: File,
): Promise<Member> {
  const formData = new FormData()

  formData.append(
    'file',
    file,
  )

  const member = await apiRequest<Member>(
    '/api/members/me/profile-image',
    {
      method: 'POST',
      body: formData,
    },
  )

  saveStoredMember(member)

  return member
}

export async function resetProfileImage(): Promise<Member> {
  const member = await apiRequest<Member>(
    '/api/members/me/profile-image',
    {
      method: 'DELETE',
    },
  )

  saveStoredMember(member)

  return member
}

export async function changePassword(
  request: ChangePasswordRequest,
): Promise<void> {
  await apiRequest<void>(
    '/api/members/me/password',
    {
      method: 'PATCH',
      body: JSON.stringify(request),
    },
  )
}

export async function deleteAccount(
  request: DeleteAccountRequest,
): Promise<void> {
  await apiRequest<void>(
    '/api/members/me',
    {
      method: 'DELETE',
      body: JSON.stringify(request),
    },
  )
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

function saveStoredMember(
  member: Member,
): void {
  if (
    sessionStorage.getItem(
      'accessToken',
    )
  ) {
    sessionStorage.setItem(
      'member',
      JSON.stringify(member),
    )

    return
  }

  if (
    localStorage.getItem(
      'accessToken',
    )
  ) {
    localStorage.setItem(
      'member',
      JSON.stringify(member),
    )
  }
}