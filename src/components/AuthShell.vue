<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <main class="auth-page">
    <div class="auth-frame">
      <section class="auth-visual">
        <div class="auth-decoration decoration-one"></div>
        <div class="auth-decoration decoration-two"></div>
        <div class="auth-decoration decoration-three"></div>

        <div class="auth-visual-content">
          <div class="auth-introduction">
            <span class="auth-eyebrow">
              OUR TRAVEL STORY
            </span>

            <h1>
              함께한 여행의 순간을<br />
              하나의 이야기로 남겨보세요.
            </h1>

            <p>
              사진과 장소, 시간과 메모를 친구들과 함께
              기록하고 여행의 모든 순간을 간직할 수 있습니다.
            </p>
          </div>

          <div class="auth-feature-list">
            <article>
              <span class="feature-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
                  />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m5 17 4-4 3 3 2-2 5 4" />
                </svg>
              </span>

              <div>
                <strong>사진과 여행 기록</strong>
                <span>시간과 장소를 함께 저장합니다.</span>
              </div>
            </article>

            <article>
              <span class="feature-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="9" cy="8" r="3" />
                  <circle cx="17" cy="9" r="2" />
                  <path d="M3 20c0-4 2-6 6-6s6 2 6 6M15 15c4 0 6 2 6 5" />
                </svg>
              </span>

              <div>
                <strong>친구와 함께</strong>
                <span>초대한 사람들과 기록을 공유합니다.</span>
              </div>
            </article>

            <article>
              <span class="feature-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="m12 3 1.8 4.7L18.5 9l-4.7 1.3L12 15l-1.8-4.7L5.5 9l4.7-1.3z"
                  />
                  <path
                    d="m18.5 13 1 2.5L22 16.5l-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"
                  />
                </svg>
              </span>

              <div>
                <strong>AI 여행기</strong>
                <span>여행 기록을 하나의 이야기로 정리합니다.</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="auth-panel">
        <div class="auth-card">
          <header class="auth-card-header">
            <h2>{{ title }}</h2>
            <p>{{ description }}</p>
          </header>

          <slot />
        </div>
      </section>
    </div>
  </main>
</template>

<style>
.auth-page,
.auth-page * {
  box-sizing: border-box;
}

.auth-page {
  display: flex;
  min-height: calc(100vh - 72px);
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: var(--tmr-background);
}

.auth-frame {
  display: grid;
  width: min(1080px, 100%);
  height: 680px;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  grid-template-rows: minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--tmr-border);
  border-radius: 24px;
  background: var(--tmr-surface);
  box-shadow: 0 28px 70px rgba(44, 61, 86, 0.13);
}

.auth-visual {
  position: relative;
  min-height: 0;
  overflow: hidden;
  padding: 48px;
  color: #ffffff;
  background:
    radial-gradient(
      circle at 18% 20%,
      rgba(255, 255, 255, 0.14),
      transparent 25%
    ),
    linear-gradient(
      145deg,
      #6682c4,
      #405f9f 58%,
      #314a7c
    );
}

.auth-visual::after {
  position: absolute;
  right: -120px;
  bottom: -135px;
  width: 440px;
  height: 310px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  content: '';
}

.auth-decoration {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
}

.decoration-one {
  top: -120px;
  right: -100px;
  width: 350px;
  height: 350px;
}

.decoration-two {
  top: 120px;
  right: -145px;
  width: 300px;
  height: 300px;
}

.decoration-three {
  bottom: -170px;
  left: -130px;
  width: 380px;
  height: 380px;
}

.auth-visual-content {
  position: relative;
  z-index: 2;
  display: flex;
  height: 100%;
  flex-direction: column;
}

.auth-introduction {
  margin-top: 105px;
}

.auth-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.68);
}

.auth-introduction h1 {
  margin: 20px 0 0;
  font-size: 31px;
  line-height: 1.45;
}

.auth-introduction p {
  max-width: 390px;
  margin: 22px 0 0;
  font-size: 13px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.72);
}

.auth-feature-list {
  display: grid;
  gap: 13px;
  margin-top: auto;
  padding-top: 55px;
}

.auth-feature-list article {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 13px 15px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
}

.feature-icon {
  display: grid;
  width: 37px;
  height: 37px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.14);
}

.feature-icon svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.auth-feature-list article > div {
  display: flex;
  flex-direction: column;
}

.auth-feature-list strong {
  font-size: 12px;
}

.auth-feature-list article > div > span {
  margin-top: 4px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.66);
}

.auth-panel {
  display: flex;
  min-height: 0;
  align-items: center;
  justify-content: center;
  padding: 45px 68px;
  background: var(--tmr-surface);
}

.auth-card {
  width: 100%;
  max-width: 430px;
}

.auth-card-header h2 {
  margin: 0;
  font-size: 28px;
  color: var(--tmr-text);
}

.auth-card-header p {
  margin: 11px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--tmr-text-sub);
}

.auth-form {
  margin-top: 31px;
}

.auth-field {
  display: flex;
  flex-direction: column;
}

.auth-form > .auth-field + .auth-field {
  margin-top: 18px;
}

.auth-field-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.auth-field-row .auth-field {
  margin-top: 0;
}

.auth-field-row + .auth-field,
.auth-field + .auth-field-row,
.auth-field-row + .auth-field-row {
  margin-top: 18px;
}

.auth-success + .auth-field,
.auth-error + .auth-field {
  margin-top: 18px;
}

.auth-field label {
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--tmr-text);
}

.auth-field input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid var(--tmr-border);
  border-radius: 9px;
  outline: none;
  font-size: 13px;
  color: var(--tmr-text);
  background: var(--tmr-surface);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.auth-field input::placeholder {
  color: var(--tmr-text-sub);
}

.auth-field input:focus {
  border-color: var(--tmr-primary);
  box-shadow: 0 0 0 3px rgba(79, 124, 255, 0.11);
}

.auth-input-wrap {
  position: relative;
}

.auth-input-wrap input {
  padding-right: 70px;
}

.auth-password-toggle {
  position: absolute;
  top: 50%;
  right: 12px;
  padding: 5px;
  border: 0;
  font-size: 10px;
  font-weight: 700;
  color: var(--tmr-text-sub);
  background: transparent;
  transform: translateY(-50%);
}

.auth-helper {
  margin: 7px 0 0;
  font-size: 9px;
  line-height: 1.6;
  color: var(--tmr-text-sub);
}

.auth-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 17px;
}

.auth-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}

.auth-checkbox input {
  width: 15px;
  height: 15px;
  margin: 1px 0 0;
  accent-color: var(--tmr-primary);
}

.auth-checkbox span {
  font-size: 10px;
  line-height: 1.5;
  color: var(--tmr-text-sub);
}

.auth-text-button {
  padding: 0;
  border: 0;
  font-size: 10px;
  font-weight: 600;
  color: var(--tmr-primary);
  text-decoration: none;
  background: transparent;
}

.auth-submit {
  width: 100%;
  height: 49px;
  margin-top: 24px;
  border: 0;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  background: var(--tmr-primary);
  box-shadow: 0 9px 20px rgba(79, 124, 255, 0.2);
}

.auth-submit:hover {
  background: var(--tmr-primary-dark);
}

.auth-submit:disabled,
.auth-text-button:disabled {
  cursor: default;
  opacity: 0.65;
}

.auth-error,
.auth-success {
  margin: 16px 0 0;
  padding: 11px 12px;
  border-radius: 8px;
  font-size: 10px;
  line-height: 1.6;
}

.auth-error {
  color: #c23e51;
  background: #fff0f2;
}

.auth-success {
  color: #287458;
  background: #eaf8f2;
}

.auth-switch {
  margin: 23px 0 0;
  font-size: 11px;
  color: var(--tmr-text-sub);
  text-align: center;
}

.auth-switch a {
  margin-left: 5px;
  font-weight: 700;
  color: var(--tmr-primary);
  text-decoration: none;
}

@media (max-width: 900px) {
  .auth-panel {
    padding: 45px 40px;
  }

  .auth-visual {
    padding: 40px 32px;
  }

  .auth-introduction h1 {
    font-size: 26px;
  }
}

@media (max-width: 760px) {
  .auth-page {
    display: block;
    min-height: calc(100vh - 58px);
    padding: 0;
    background: var(--tmr-surface);
  }

  .auth-frame {
    display: block;
    width: 100%;
    height: auto;
    min-height: calc(100vh - 58px);
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .auth-visual {
    display: none;
  }

  .auth-panel {
    display: block;
    min-height: calc(100vh - 58px);
    padding: 32px 20px 45px;
  }

  .auth-card {
    max-width: none;
  }

  .auth-card-header h2 {
    font-size: 25px;
  }

  .auth-card-header p {
    font-size: 11px;
  }

  .auth-form {
    margin-top: 28px;
  }

  .auth-field-row {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .auth-field-row + .auth-field,
  .auth-field + .auth-field-row,
  .auth-field-row + .auth-field-row {
    margin-top: 18px;
  }
}
</style>