import {
  computed,
  ref,
  type ComputedRef,
  type Ref,
} from 'vue'

import { ApiError } from '@/api/http'
import {
  sendTripInvitation,
  type TripParticipant,
} from '@/api/trips'

export interface Participant {
  id: number
  nickname: string
  profileImageUrl: string | null
  avatarClass: string
}

interface UseTripParticipantsOptions {
  tripId: ComputedRef<number | null>
  participantProfileImageUrls: Ref<Record<number, string>>
}

const participantAvatarClasses = [
  'avatar-blue',
  'avatar-green',
  'avatar-orange',
]

export function useTripParticipants({
  tripId,
  participantProfileImageUrls,
}: UseTripParticipantsOptions) {
  const tripParticipants = ref<TripParticipant[]>([])

  const isParticipantModalOpen = ref(false)
  const inviteNickname = ref('')
  const isInviting = ref(false)
  const invitationMessage = ref('')
  const invitationErrorMessage = ref('')

  const participants = computed<Participant[]>(() =>
    tripParticipants.value.map((participant, index) => ({
      id: participant.memberId,
      nickname: participant.nickname,
      profileImageUrl:
        participantProfileImageUrls.value[
          participant.memberId
        ] || null,
      avatarClass:
        participantAvatarClasses[
          index % participantAvatarClasses.length
        ] ?? 'avatar-blue',
    })),
  )

  const participantCount = computed(
    () => participants.value.length,
  )

  const visibleParticipants = computed(
    () => participants.value.slice(0, 4),
  )

  const remainingParticipantCount = computed(() =>
    Math.max(
      participantCount.value
        - visibleParticipants.value.length,
      0,
    ),
  )

  const openParticipantModal = () => {
    invitationMessage.value = ''
    invitationErrorMessage.value = ''
    isParticipantModalOpen.value = true
  }

  const closeParticipantModal = () => {
    if (isInviting.value) {
      return
    }

    isParticipantModalOpen.value = false
    invitationMessage.value = ''
    invitationErrorMessage.value = ''
  }

  const sendInvitation = async () => {
    const nickname = inviteNickname.value.trim()
    const id = tripId.value

    if (!nickname) {
      invitationErrorMessage.value =
        '초대할 회원의 닉네임을 입력해 주세요.'
      invitationMessage.value = ''
      return
    }

    if (id === null) {
      invitationErrorMessage.value =
        '여행 정보를 확인할 수 없습니다.'
      invitationMessage.value = ''
      return
    }

    isInviting.value = true
    invitationMessage.value = ''
    invitationErrorMessage.value = ''

    try {
      await sendTripInvitation(id, nickname)

      inviteNickname.value = ''
      invitationMessage.value =
        '여행 초대를 보냈습니다.'
    } catch (error: unknown) {
      invitationErrorMessage.value =
        error instanceof ApiError
          ? error.message
          : '초대를 보내지 못했습니다.'
    } finally {
      isInviting.value = false
    }
  }

  return {
    tripParticipants,
    participants,
    participantCount,
    visibleParticipants,
    remainingParticipantCount,
    isParticipantModalOpen,
    inviteNickname,
    isInviting,
    invitationMessage,
    invitationErrorMessage,
    openParticipantModal,
    closeParticipantModal,
    sendInvitation,
  }
}