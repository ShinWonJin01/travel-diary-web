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

export interface MemberSettings {
  invitationNotificationEnabled: boolean
  activityNotificationEnabled: boolean
}

export interface UpdateMemberSettingsRequest {
  invitationNotificationEnabled: boolean
  activityNotificationEnabled: boolean
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetVerifyRequest {
  email: string
  verificationCode: string
}

export interface PasswordResetConfirmRequest {
  email: string
  verificationCode: string
  newPassword: string
}

interface ApiMessageResponse {
  message: string
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

export async function requestPasswordReset(
  request: PasswordResetRequest,
): Promise<string> {
  const response =
    await apiRequest<ApiMessageResponse>(
      '/api/auth/password-reset/request',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    )

  return response.message
}

export async function verifyPasswordResetCode(
  request: PasswordResetVerifyRequest,
): Promise<string> {
  const response =
    await apiRequest<ApiMessageResponse>(
      '/api/auth/password-reset/verify',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    )

  return response.message
}

export async function confirmPasswordReset(
  request: PasswordResetConfirmRequest,
): Promise<string> {
  const response =
    await apiRequest<ApiMessageResponse>(
      '/api/auth/password-reset/confirm',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    )

  return response.message
}

export async function getCurrentMember(): Promise<Member> {
  const member = await apiRequest<Member>(
    '/api/members/me',
    {
      method: 'GET',
    },
  )

  saveStoredMember(member)

  return member
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

export async function getMemberSettings(): Promise<MemberSettings> {
  return apiRequest<MemberSettings>(
    '/api/members/me/settings',
    {
      method: 'GET',
    },
  )
}

export async function updateMemberSettings(
  request: UpdateMemberSettingsRequest,
): Promise<MemberSettings> {
  return apiRequest<MemberSettings>(
    '/api/members/me/settings',
    {
      method: 'PATCH',
      body: JSON.stringify(request),
    },
  )
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