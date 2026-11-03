import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Capacitor 앱 빌드를 위한 정적 내보내기 설정
  output: "export",
  // 이미지 최적화 비활성화 (정적 export에서는 지원 안 됨 - Capacitor 환경에서 사용)
  images: {
    unoptimized: true,
  },
  // trailing slash 설정 (Capacitor에서 파일 로딩 안정성 향상)
  trailingSlash: true,
};

export default nextConfig;
