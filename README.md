# Travel Story

사진의 시간·위치 정보를 기반으로 여행 기록을 타임라인과 지도 형태로 구성하고,
동행자를 초대해 함께 기록을 공유할 수 있는 여행 기록 웹 서비스입니다.

이 저장소는 **Travel Story의 Frontend** 프로젝트입니다.

## Repository

* **Frontend:** https://github.com/ShinWonJin01/travel-story-frontend
* **Backend:** https://github.com/ShinWonJin01/travel-story-backend

## Tech Stack

### Frontend

* Vue 3
* TypeScript
* Vite
* Vue Router
* Axios

### Map / Location

* Leaflet
* OpenStreetMap
* Kakao Local API

### Tool

* Git / GitHub
* VS Code

## Main Features

### User

* 회원가입 및 로그인
* 마이페이지 및 프로필 관리
* 로그인 상태에 따른 화면 및 기능 제어

### Trip

* 여행 생성 및 조회
* 여행 정보 수정 및 관리
* 최근 여행 조회
* 여행 참여자 초대
* 받은 초대 및 보낸 초대 관리
* 초대 수락·거절·취소

### Photo

* 여행 사진 업로드 및 조회
* 사진 촬영 시간 정보를 활용한 타임라인 구성
* 사진의 위치 정보 표시
* 사진 상세 정보 조회
* 사진 위치 수정

### Timeline

* 촬영 시간을 기준으로 여행 사진을 시간순으로 구성
* 날짜별 여행 기록 그룹화
* 사진 및 여행 기록을 타임라인 형태로 조회

### Map

* 사진의 위치 정보를 지도에 마커로 표시
* 지도에서 여행 장소 확인
* 사진 위치 수정 시 지도와 마커 위치 변경
* 장소명·주소 검색을 통한 위치 검색 및 선택
* 선택한 위치를 사진 정보에 반영

### Invitation / Notification

* 여행 참여자 초대 기능
* 받은 초대 및 보낸 초대 조회
* 알림 목록 및 읽음 상태 관리
* 읽지 않은 알림 개수 표시
* 최근 활동 내역 조회

## Project Structure

```text
src
├── api
│   ├── invitations      # 여행 초대 관련 API
│   ├── notifications    # 알림 관련 API
│   ├── trips            # 여행 관련 API
│   └── ...
│
├── components
│   ├── home             # 홈 화면 컴포넌트
│   ├── trips            # 여행 상세·사진·지도 관련 컴포넌트
│   └── ...
│
├── router               # Vue Router 설정
├── views                # 페이지 단위 View
├── assets               # 이미지 및 정적 리소스
└── App.vue
```

> 실제 기능별 컴포넌트를 분리하여 View 파일의 역할을 줄이고 재사용성과 유지보수성을 높이는 방향으로 구성했습니다.

## Frontend Architecture

Frontend에서는 화면 단위의 View와 기능 단위의 Component를 분리하고,
Backend와의 통신은 API 모듈을 통해 처리하도록 구성했습니다.

```text
View
  ↓
Component
  ↓
API Module
  ↓
REST API
  ↓
Spring Boot Backend
```

이를 통해 화면 코드에서 API 호출 로직을 분리하고, 각 기능의 역할을 명확하게 관리하도록 구성했습니다.

## How to Run

### 1. Repository Clone

```bash
git clone https://github.com/ShinWonJin01/travel-story-frontend.git
cd travel-story-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Browser

Vite 개발 서버 실행 후 출력되는 주소로 접속합니다.

기본 개발 환경에서는 다음 주소를 사용합니다.

```text
http://localhost:5173
```

> Frontend 기능을 정상적으로 사용하려면 Travel Story Backend 서버가 함께 실행되어 있어야 합니다.

## Backend

Backend는 별도의 Spring Boot 프로젝트로 구성되어 있습니다.

**Backend Repository**
https://github.com/ShinWonJin01/travel-story-backend

Frontend에서는 REST API를 통해 회원, 여행, 사진, 초대, 알림 등의 데이터를 Backend와 주고받습니다.

## My Role

개인 프로젝트로 Frontend부터 Backend까지 전체 웹 서비스 개발을 진행했습니다.

Frontend에서는 다음 기능을 구현했습니다.

* Vue 3와 TypeScript 기반 SPA 화면 구현
* Vue Router를 활용한 페이지 이동 구조 구성
* API 모듈을 통한 Spring Boot REST API 연동
* 여행 생성·조회·수정 화면 구현
* 여행 참여자 초대 및 초대 관리 화면 구현
* 사진 업로드 및 여행 사진 관리 화면 구현
* 사진의 촬영 시간 정보를 활용한 타임라인 UI 구현
* Leaflet 기반 여행 지도 및 사진 위치 마커 구현
* 장소명·주소 검색을 활용한 사진 위치 수정 기능 구현
* 알림 및 최근 활동 화면 구현
* 마이페이지 및 프로필 관리 기능 구현
* 기능 단위 컴포넌트 분리를 통한 Vue 코드 구조 개선

## Troubleshooting

### 지도 클릭 방식의 사진 위치 수정 정확도 개선

#### Problem

사진의 위치 정보가 없거나 잘못된 경우 사용자가 지도에서 직접 위치를 클릭해 수정할 수 있도록 구현했습니다.

하지만 사용자가 지도를 확대해 직접 위치를 선택해야 했기 때문에, 정확한 장소를 찾기 어렵고 원하는 위치와 실제 저장 위치 사이에 차이가 발생할 수 있었습니다.

#### Cause

지도 좌표를 직접 선택하는 방식만으로는 사용자가 원하는 장소명이나 정확한 주소를 기준으로 위치를 찾기 어려웠습니다.

#### Solution

장소명이나 주소를 입력해 위치를 검색할 수 있는 기능을 추가했습니다.

검색 결과에서 원하는 장소를 선택하면 지도 중심과 마커가 해당 위치로 이동하도록 구현하고, 사용자가 선택한 위치를 사진 정보에 저장할 수 있도록 Frontend와 Backend API를 연결했습니다.

#### Result

사용자가 지도를 직접 확대해 좌표를 찾지 않아도 장소 검색을 통해 보다 정확하고 편리하게 사진 위치를 수정할 수 있도록 개선했습니다.

## Note

지도와 장소 검색 기능은 외부 지도·위치 API를 사용합니다.
API 설정이 되어 있지 않은 환경에서는 일부 지도 또는 위치 검색 기능이 정상적으로 동작하지 않을 수 있습니다.
