import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // 앱 고유 식별자 (역방향 도메인 형식)
  appId: "com.hoju.travelapp",
  // 앱 표시 이름
  appName: "J여관",
  // Next.js 정적 빌드 출력 폴더
  webDir: "out",
  // 번들로 포함된 웹 에셋을 서버 없이 로드
  server: {
    // 네이티브 앱에서 bundled 사용 (배포용)
    // androidScheme: "https", // HTTPS scheme 사용 (ContentSecurityPolicy 호환)
  },
  plugins: {
    // 파일시스템 (이미지, 백업 저장에 사용)
    Filesystem: {},
    // 공유 (백업 파일 공유에 사용)
    Share: {},
    // 카메라 (향후 이미지 직접 촬영 기능 추가 시)
    // Camera: {},
  },
  android: {
    // 안드로이드 최소 SDK 버전 (API 22 = Android 5.1)
    minWebViewVersion: 60,
    // 다크 모드 지원
    // backgroundColor: "#ffffff",
  },
  ios: {
    // iOS 설정
    contentInset: "automatic",
  },
};

export default config;
