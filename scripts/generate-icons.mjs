#!/usr/bin/env node
/**
 * 앱 아이콘 크기별 복사 스크립트
 * 
 * 사용법:
 * 1. public/icons/ 폴더에 icon-512x512.png 를 놓으세요
 * 2. node scripts/generate-icons.mjs 실행
 * 
 * 실제 크기별 리사이징은 Sharp 또는 온라인 도구를 활용하세요:
 * - https://www.appicon.co/ (iOS/Android 아이콘 자동 생성)
 * - capacitor-assets 패키지 사용 권장:
 *   npx @capacitor/assets generate --iconBackgroundColor '#18181B' --iconBackgroundColorDark '#18181B'
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const iconsDir = join(rootDir, 'public', 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// icons 폴더 생성
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
  console.log('✅ public/icons/ 폴더 생성됨');
}

console.log(`
📱 앱 아이콘 생성 안내
======================
아이콘 파일을 자동으로 리사이징하려면 아래 방법 중 하나를 사용하세요:

방법 1: capacitor-assets 사용 (권장)
  1. public/icon.png (1024x1024 이상) 파일을 준비하세요
  2. npx @capacitor/assets generate 실행
  → android/app/src/main/res/ 와 ios/ 에 자동으로 아이콘 생성

방법 2: 온라인 도구
  - https://www.appicon.co/ 에서 512x512 이미지 업로드
  → iOS/Android 모든 사이즈 자동 생성

필요한 아이콘 크기:
${sizes.map(s => `  - icon-${s}x${s}.png`).join('\n')}

현재 아이콘 소스: public/logo.png
`);
