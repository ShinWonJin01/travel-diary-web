<script setup lang="ts">
import type {
  NotificationCategory,
  NotificationItem,
} from '@/composables/notifications/useNotifications'

withDefaults(
  defineProps<{
    notifications: NotificationItem[]
    unreadCount: number
    mobile?: boolean
  }>(),
  {
    mobile: false,
  },
)

const emit = defineEmits<{
  'mark-all-read': []
  open: [notification: NotificationItem]
}>()

const getNotificationTypeLabel = (
  type: NotificationCategory,
) => {
  switch (type) {
    case 'invitation':
      return '초대'

    case 'trip-change':
      return '여행 변경'

    case 'activity':
      return '참여자 활동'

    case 'trip-deleted':
      return '여행 삭제'
  }
}
</script>

<template>
  <div
    class="notification-popup"
    :class="{ 'notification-popup-mobile': mobile }"
  >
    <div class="notification-popup-header">
      <div>
        <h2>알림</h2>
        <p>
          읽지 않은 알림 {{ unreadCount }}개
        </p>
      </div>

      <button
        type="button"
        :disabled="unreadCount === 0"
        @click="emit('mark-all-read')"
      >
        모두 읽음
      </button>
    </div>

    <div
      v-if="notifications.length > 0"
      class="notification-list"
    >
      <button
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="{
          unread: !notification.isRead,
        }"
        type="button"
        @click="emit('open', notification)"
      >
        <span
          class="notification-unread-dot"
          :class="{
            hidden: notification.isRead,
          }"
        ></span>

        <span class="notification-information">
          <span
            class="notification-type"
            :class="notification.type"
          >
            {{
              getNotificationTypeLabel(
                notification.type,
              )
            }}
          </span>

          <strong>
            {{ notification.message }}
          </strong>

          <span class="notification-meta">
            {{ notification.time }}
          </span>
        </span>
      </button>
    </div>

    <div
      v-else
      class="empty-notification"
    >
      <p>새로운 알림이 없습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.notification-popup {
  position: absolute;
  top: calc(100% + 17px);
  right: 0;
  z-index: 300;
  width: 370px;
  overflow: hidden;
  border: 1px solid #e2e7ed;
  border-radius: 13px;
  background: #ffffff;
  box-shadow: 0 16px 45px rgba(31, 43, 61, 0.18);
}

.notification-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 19px;
  border-bottom: 1px solid #edf0f4;
}

.notification-popup-header h2 {
  margin: 0;
  font-size: 16px;
  color: #252c36;
}

.notification-popup-header p {
  margin: 5px 0 0;
  font-size: 10px;
  color: #949ca7;
}

.notification-popup-header > button {
  padding: 5px;
  border: 0;
  font-size: 11px;
  font-weight: 600;
  color: #4164e9;
  background: transparent;
  cursor: pointer;
}

.notification-popup-header > button:disabled {
  color: #b6bcc4;
  cursor: default;
}

.notification-list {
  max-height: 390px;
  overflow-y: auto;
}

.notification-item {
  display: grid;
  grid-template-columns: 9px minmax(0, 1fr);
  gap: 10px;
  width: 100%;
  padding: 15px 18px;
  border: 0;
  border-bottom: 1px solid #f0f2f5;
  text-align: left;
  background: #ffffff;
  cursor: pointer;
}

.notification-item:last-child {
  border-bottom: 0;
}

.notification-item.unread {
  background: #f8faff;
}

.notification-item:hover {
  background: #f4f7fb;
}

.notification-unread-dot {
  width: 7px;
  height: 7px;
  margin-top: 7px;
  border-radius: 50%;
  background: #3f67ef;
}

.notification-unread-dot.hidden {
  visibility: hidden;
}

.notification-information {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
}

.notification-type {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 0 7px;
  border-radius: 5px;
  font-size: 9px;
  font-weight: 700;
}

.notification-type.invitation {
  color: #315ce8;
  background: #eaf0ff;
}

.notification-type.trip-change {
  color: #8a6415;
  background: #fff4d5;
}

.notification-type.activity {
  color: #28745c;
  background: #e7f7f0;
}

.notification-type.trip-deleted {
  color: #c23b43;
  background: #fdecee;
}

.notification-information strong {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: #303741;
}

.notification-meta {
  margin-top: 6px;
  font-size: 10px;
  color: #979fa9;
}

.empty-notification {
  display: flex;
  min-height: 170px;
  align-items: center;
  justify-content: center;
}

.empty-notification p {
  margin: 0;
  font-size: 12px;
  color: #959da7;
}

@media (max-width: 760px) {
  .notification-popup-mobile {
    position: fixed;
    top: 66px;
    right: 12px;
    left: 12px;
    width: auto;
    max-height: calc(100vh - 150px);
  }

  .notification-popup-header {
    padding: 15px 16px;
  }

  .notification-popup-header h2 {
    font-size: 14px;
  }

  .notification-popup-header p {
    font-size: 9px;
  }

  .notification-popup-header > button {
    font-size: 10px;
  }

  .notification-list {
    max-height: calc(100vh - 235px);
  }

  .notification-item {
    padding: 13px 15px;
  }

  .notification-information strong {
    font-size: 11px;
  }

  .notification-meta {
    font-size: 9px;
  }
}
</style>