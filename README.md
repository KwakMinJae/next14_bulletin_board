# 게시판 프로젝트

이 프로젝트는 Next.js 14와 Firebase를 활용하여 만든 간단한 게시판입니다. 사용자는 게시글을 등록하고, 조회하고, 수정하거나 삭제할 수 있습니다. 또한 검색 기능을 통해 원하는 게시글을 찾을 수 있습니다.

## 기술 스택

- **Next.js 14**: React 기반의 SSR (Server Side Rendering) 프레임워크로, SEO와 성능 최적화를 제공합니다.
- **TypeScript**: 타입 안정성과 개발 효율성을 높이기 위해 사용됩니다.
- **Firebase**: Firestore를 데이터베이스로 사용하여 게시글 데이터를 저장하고, Firebase Auth로 사용자 인증을 처리합니다.
- **Tailwind CSS**: UI 스타일링을 위해 사용한 유틸리티 중심의 CSS 프레임워크입니다.
- **EmailJS**: 이메일 전송을 위한 API로, 사용자 인증 및 알림 이메일을 발송하는데 사용됩니다.

## 기능

- **사용자 인증**: Firebase Auth를 사용하여 이메일과 비밀번호로 로그인 및 회원가입을 할 수 있으며, Google 및 GitHub 소셜 로그인을 지원합니다.
- **게시글 작성**: 로그인한 사용자는 게시글을 작성할 수 있습니다. 게시글 작성 시 제목, 작성자, 내용, 작성일이 저장됩니다.
- **게시글 조회 및 검색**: 작성된 게시글을 조회하고, 제목과 작성자를 기준으로 검색할 수 있습니다.
- **게시글 수정 및 삭제**: 게시글 작성자만 본인의 게시글을 수정하거나 삭제할 수 있습니다.
- **댓글 및 답글**: 게시글에 대한 댓글과 답글을 작성할 수 있습니다.
- **이메일 알림**: EmailJS를 사용하여 사용자에게 중요한 알림을 이메일로 전송할 수 있습니다.

## 설치 및 설정

1. 필수 패키지 설치
npm install

2. .env 파일을 프로젝트 루트에 생성하고 아래의 환경 변수를 추가하세요.
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

NEXT_PUBLIC_YOUR_SERVICE_ID=your_emailjs_service_id
NEXT_PUBLIC_YOUR_TEMPLATE_ID=your_emailjs_template_id
NEXT_PUBLIC_YOUR_USER_ID=your_emailjs_user_id

3. Firebase 설정 firebaseConfig.ts 파일에 Firebase 설정을 추가합니다.

4. 프로젝트 실행
npm run dev

5. 빌드
npm run build

## 사용된 라이브러리

1. @tanstack/react-table: 테이블 렌더링을 위한 라이브러리.
2. firebase: 로그인, 데이터베이스 사용.
3. emailjs-com: 이메일 전송 API.
4. SweetAlert2: alert와 confirm 창을 구현