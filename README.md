# T5 조명 자동계산기

조명 설치를 위한 최적 조합을 자동으로 계산해주는 PWA(Progressive Web App)입니다.

## 🌟 주요 기능

- **자동 계산**: 총 길이 또는 가로x세로 입력으로 조명 개수 자동 계산
- **최적 조합**: 다양한 길이의 T5 조명 최적 조합 추천
- **전원 코드 옵션**: 전원 코드 포함 여부 선택 가능
- **결과 저장**: 계산 결과를 로컬에 저장하고 관리
- **모바일 최적화**: 반응형 디자인으로 모든 기기에서 사용 가능
- **PWA 지원**: 오프라인 사용 가능, 홈 화면 추가 가능

## 🚀 사용 방법

1. **총 길이 입력**: 조명을 설치할 공간의 총 길이 입력
2. **가로x세로 입력**: 또는 가로와 세로 길이를 각각 입력
3. **전원 코드 선택**: 전원 코드 포함 여부 선택
4. **계산 실행**: "최적 조합 계산" 버튼 클릭
5. **결과 확인**: 자동으로 계산된 최적 조합 확인
6. **결과 저장**: 필요시 계산 결과를 저장

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **PWA**: Service Worker, Web App Manifest
- **Build Tool**: Create React App
- **Deployment**: GitHub Pages

## 📱 PWA 기능

- **오프라인 사용**: 인터넷 연결 없이도 사용 가능
- **홈 화면 추가**: 모바일 기기의 홈 화면에 앱 추가 가능
- **앱처럼 사용**: 네이티브 앱과 유사한 사용자 경험

## 🚀 배포

이 앱은 GitHub Pages를 통해 배포됩니다:

- **URL**: https://attierang.github.io/t5-lighting-calculator
- **자동 배포**: main 브랜치에 푸시하면 자동으로 배포됩니다

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build

# PWA 빌드
npm run build:pwa
```

### 개발 서버
- **로컬**: http://localhost:3000
- **네트워크**: http://192.168.45.168:3000

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── ui/           # Radix UI 컴포넌트들
│   ├── LightingCalculator.tsx  # 메인 계산기 컴포넌트
│   └── SupabaseTest.tsx        # Supabase 테스트 컴포넌트
├── styles/
│   └── globals.css   # 전역 스타일
├── utils/
│   ├── cn.ts         # Tailwind CSS 유틸리티
│   └── supabase/     # Supabase 설정
└── App.tsx           # 메인 앱 컴포넌트

public/
├── manifest.json     # PWA 매니페스트
├── sw.js            # Service Worker
├── index.html       # 메인 HTML 파일
└── icons/           # 앱 아이콘들
```

## 🎯 Google Play Store 등록

이 PWA는 Google Play Store에 등록될 예정입니다:

- **앱 이름**: T5 조명 자동계산기
- **카테고리**: 도구
- **가격**: 무료
- **대상**: 건설업계, 인테리어 업계, 일반 사용자

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여

버그 리포트나 기능 제안은 이슈를 통해 해주세요.

## 📞 문의

문의사항이 있으시면 이슈를 통해 연락해주세요.

---

**T5 조명 자동계산기** - 조명 설치를 더욱 효율적이고 정확하게 만들어드립니다! 💡

