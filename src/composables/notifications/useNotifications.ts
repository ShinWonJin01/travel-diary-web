import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import type { Member } from '@/api/auth'

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification as ApiNotification,
  type NotificationType as ApiNotificationType,
} from '@/api/notifications'

export type NotificationCategory =
  | 'invitation'
  | 'trip-change'
  | 'activity'
  | 'trip-deleted'

export interface NotificationItem {
  id: number
  type: NotificationCategory
  message: string
  time: string
  isRead: boolean
  to: string
}

export default function useNotifications(
  currentMember: Ref<Member | null>,
) {
  const router = useRouter()

  const isNotificationOpen = ref(false)
  const notifications = ref<NotificationItem[]>([])
  const unreadCount = ref(0)

  const getNotificationCategory = (
    type: ApiNotificationType,
  ): NotificationCategory => {
    switch (type) {
      case 'TRIP_INVITED':
      case 'INVITATION_ACCEPTED':
      case 'INVITATION_REJECTED':
        return 'invitation'

      case 'TRIP_UPDATED':
        return 'trip-change'

      case 'MEMBER_LEFT_TRIP':
        return 'activity'

      case 'TRIP_DELETED':
        return 'trip-deleted'
    }
  }

  const getNotificationLink = (
    notification: ApiNotification,
  ) => {
    if (notification.type === 'TRIP_INVITED') {
      return '/invitations'
    }

    if (notification.tripId !== null) {
      return `/trips/${notification.tripId}`
    }

    return '/trips'
  }

  const formatNotificationTime = (
    createdAt: string,
  ) => {
    const createdTime = new Date(createdAt).getTime()

    if (Number.isNaN(createdTime)) {
      return ''
    }

    const diff = Date.now() - createdTime

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diff < minute) {
      return '방금 전'
    }

    if (diff < hour) {
      return `${Math.floor(diff / minute)}분 전`
    }

    if (diff < day) {
      return `${Math.floor(diff / hour)}시간 전`
    }

    if (diff < 7 * day) {
      return `${Math.floor(diff / day)}일 전`
    }

    return new Date(createdAt).toLocaleDateString(
      'ko-KR',
      {
        month: 'numeric',
        day: 'numeric',
      },
    )
  }

  const loadNotifications = async () => {
    try {
      const response = await getNotifications()

      notifications.value = response.map((notification) => ({
        id: notification.id,
        type: getNotificationCategory(notification.type),
        message: notification.message,
        time: formatNotificationTime(notification.createdAt),
        isRead: notification.read,
        to: getNotificationLink(notification),
      }))

      unreadCount.value = notifications.value.filter(
        (notification) => !notification.isRead,
      ).length
    } catch {
      notifications.value = []
    }
  }

  const loadUnreadCount = async () => {
    if (!currentMember.value) {
      unreadCount.value = 0
      return
    }

    try {
      unreadCount.value = await getUnreadNotificationCount()
    } catch {
      unreadCount.value = 0
    }
  }

  const toggleNotificationPopup = async () => {
    isNotificationOpen.value = !isNotificationOpen.value

    if (isNotificationOpen.value) {
      await loadNotifications()
    }
  }

  const closeNotificationPopup = () => {
    isNotificationOpen.value = false
  }

  const markAllAsRead = async () => {
    if (unreadCount.value === 0) {
      return
    }

    try {
      await markAllNotificationsAsRead()

      notifications.value.forEach((notification) => {
        notification.isRead = true
      })

      unreadCount.value = 0
    } catch {
      await loadNotifications()
      await loadUnreadCount()
    }
  }

  const markAsRead = async (
    notification: NotificationItem,
  ) => {
    if (notification.isRead) {
      return
    }

    try {
      await markNotificationAsRead(notification.id)

      notification.isRead = true

      unreadCount.value = Math.max(
        unreadCount.value - 1,
        0,
      )
    } catch {
      await loadNotifications()
      await loadUnreadCount()
    }
  }

  const openNotification = async (
    notification: NotificationItem,
  ) => {
    await markAsRead(notification)

    closeNotificationPopup()

    await router.push(notification.to)
  }

  return {
    isNotificationOpen,
    notifications,
    unreadCount,
    loadNotifications,
    loadUnreadCount,
    toggleNotificationPopup,
    closeNotificationPopup,
    markAllAsRead,
    markAsRead,
    openNotification,
  }
}