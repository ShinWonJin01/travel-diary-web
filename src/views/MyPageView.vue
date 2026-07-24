<script setup lang="ts">
interface MyPageMenu {
  id: string
  title: string
  description: string
}

const menuItems: MyPageMenu[] = [
  {
    id: 'profile',
    title: '프로필 수정',
    description: '이름과 프로필 사진을 변경합니다.',
  },
  {
    id: 'notifications',
    title: '알림 설정',
    description: '여행 초대와 활동 알림을 설정합니다.',
  },
  {
    id: 'privacy',
    title: '개인정보·위치 설정',
    description: '개인정보와 사진 위치정보 사용 범위를 설정합니다.',
  },
  {
    id: 'password',
    title: '비밀번호 변경',
    description: '계정의 비밀번호를 변경합니다.',
  },
  {
    id: 'account',
    title: '계정 관리',
    description: '로그아웃과 회원 탈퇴를 관리합니다.',
  },
]
</script>

<template>
  <section class="mypage-page">
    <!-- PC 화면 제목 -->
    <div class="desktop-page-heading">
      <p>MY PAGE</p>
      <h1>마이페이지</h1>
    </div>

    <div class="mypage-content">
      <!-- 사용자 프로필 -->
      <section class="profile-card">
        <div class="profile-avatar">
          <span>신</span>
        </div>

        <div class="profile-information">
          <h2>신원진</h2>
          <p>wonjin@example.com</p>
        </div>
      </section>

      <!-- 여행 정보 -->
      <section class="trip-summary">
        <div class="summary-item">
          <strong>5</strong>
          <span>전체 여행</span>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-item">
          <strong>3</strong>
          <span>내가 만든 여행</span>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-item">
          <strong>2</strong>
          <span>참여 중</span>
        </div>
      </section>

      <!-- 설정 메뉴 -->
      <section class="settings-section">
        <h2>계정 및 설정</h2>

        <div class="settings-list">
          <button v-for="item in menuItems" :key="item.id" class="settings-item" type="button">
            <span class="settings-icon">
              <svg v-if="item.id === 'profile'" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-5 3-8 8-8s8 3 8 8" />
              </svg>

              <svg v-else-if="item.id === 'notifications'" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
              </svg>

              <svg v-else-if="item.id === 'privacy'" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3 4 6v5c0 5 3 8 8 10 5-2 8-5 8-10V6z" />
                <circle cx="12" cy="11" r="2" />
              </svg>

              <svg v-else-if="item.id === 'password'" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>

              <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12h8M12 8v8" />
              </svg>
            </span>

            <span class="settings-information">
              <strong>{{ item.title }}</strong>
              <span>{{ item.description }}</span>
            </span>

            <span class="settings-arrow">›</span>
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.mypage-page {
  padding: 42px 48px 72px;
}

.desktop-page-heading {
  margin-bottom: 32px;
}

.desktop-page-heading p {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #4566e8;
}

.desktop-page-heading h1 {
  margin: 0;
  font-size: 30px;
  color: #1d2430;
}

.mypage-content {
  width: 100%;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px 26px;
  border: 1px solid #e3e8ef;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 5px 18px rgba(37, 54, 78, 0.06);
}

.profile-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  color: #ffffff;
  background: linear-gradient(145deg, #7798be, #4e6688);
}

.profile-avatar span {
  font-size: 25px;
  font-weight: 700;
}

.profile-information {
  min-width: 0;
}

.profile-information h2 {
  margin: 0;
  font-size: 21px;
  color: #222934;
}

.profile-information p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #89919d;
}

.trip-summary {
  display: grid;
  grid-template-columns: 1fr 1px 1fr 1px 1fr;
  align-items: center;
  margin-top: 18px;
  padding: 20px;
  border: 1px solid #e3e8ef;
  border-radius: 12px;
  background: #ffffff;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
}

.summary-item strong {
  font-size: 20px;
  color: #315ce8;
}

.summary-item span {
  font-size: 12px;
  color: #7e8794;
}

.summary-divider {
  width: 1px;
  height: 34px;
  background: #e5e9ef;
}

.settings-section {
  margin-top: 34px;
}

.settings-section > h2 {
  margin: 0 0 15px;
  font-size: 17px;
  color: #202631;
}

.settings-list {
  overflow: hidden;
  border: 1px solid #e3e8ef;
  border-radius: 12px;
  background: #ffffff;
}

.settings-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 76px;
  padding: 13px 20px;
  border: 0;
  border-bottom: 1px solid #edf0f4;
  text-align: left;
  background: #ffffff;
  cursor: pointer;
}

.settings-item:last-child {
  border-bottom: 0;
}

.settings-item:hover {
  background: #f8fafc;
}

.settings-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: #4f6f98;
  background: #eef3f8;
}

.settings-icon svg {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.settings-information {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.settings-information strong {
  font-size: 14px;
  color: #272e38;
}

.settings-information > span {
  overflow: hidden;
  font-size: 11px;
  color: #959da8;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-arrow {
  font-size: 24px;
  color: #a3abb5;
  text-align: right;
}

@media (max-width: 760px) {
  .mypage-page {
    padding: 22px 17px 92px;
  }

  .desktop-page-heading {
    display: none;
  }

  .mypage-content {
    max-width: none;
  }

  .profile-card {
    gap: 14px;
    padding: 17px;
    border-radius: 11px;
  }

  .profile-avatar {
    width: 58px;
    height: 58px;
  }

  .profile-avatar span {
    font-size: 19px;
  }

  .profile-information h2 {
    font-size: 16px;
  }

  .profile-information p {
    margin-top: 6px;
    font-size: 10px;
  }

  .trip-summary {
    margin-top: 13px;
    padding: 16px 7px;
  }

  .summary-item {
    gap: 5px;
  }

  .summary-item strong {
    font-size: 16px;
  }

  .summary-item span {
    font-size: 9px;
  }

  .summary-divider {
    height: 28px;
  }

  .settings-section {
    margin-top: 27px;
  }

  .settings-section > h2 {
    margin-bottom: 11px;
    font-size: 13px;
  }

  .settings-item {
    grid-template-columns: 36px minmax(0, 1fr) 18px;
    gap: 11px;
    min-height: 66px;
    padding: 11px 13px;
  }

  .settings-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
  }

  .settings-icon svg {
    width: 18px;
    height: 18px;
  }

  .settings-information {
    gap: 4px;
  }

  .settings-information strong {
    font-size: 12px;
  }

  .settings-information > span {
    font-size: 9px;
  }

  .settings-arrow {
    font-size: 20px;
  }
}
</style>
