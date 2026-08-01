import { apiRequest } from './http'

export type InvitationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'

export interface TripInvitation {
  invitationId: number

  tripId: number
  tripTitle: string

  startDate: string
  endDate: string | null

  inviterId: number
  inviterNickname: string

  inviteeId: number
  inviteeNickname: string

  currentParticipantCount: number

  status: InvitationStatus
  createdAt: string
}

export async function getReceivedInvitations(): Promise<
  TripInvitation[]
> {
  return apiRequest<TripInvitation[]>(
    '/api/invitations/received',
    {
      method: 'GET',
    },
  )
}

export async function getSentInvitations(): Promise<
  TripInvitation[]
> {
  return apiRequest<TripInvitation[]>(
    '/api/invitations/sent',
    {
      method: 'GET',
    },
  )
}

export async function acceptInvitation(
  invitationId: number,
): Promise<TripInvitation> {
  return apiRequest<TripInvitation>(
    `/api/invitations/${invitationId}/accept`,
    {
      method: 'PATCH',
    },
  )
}

export async function declineInvitation(
  invitationId: number,
): Promise<TripInvitation> {
  return apiRequest<TripInvitation>(
    `/api/invitations/${invitationId}/decline`,
    {
      method: 'PATCH',
    },
  )
}

export async function cancelInvitation(
  invitationId: number,
): Promise<void> {
  return apiRequest<void>(
    `/api/invitations/${invitationId}`,
    {
      method: 'DELETE',
    },
  )
}