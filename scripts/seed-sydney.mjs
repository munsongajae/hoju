// 시드니 관광명소 데이터 추가 스크립트
// Node.js로 실행: node scripts/seed-sydney.mjs

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkssxcrcndghqysjjbql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrc3N4Y3JjbmRnaHF5c2pqYnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3Mzg3OTIsImV4cCI6MjA4MTMxNDc5Mn0.NcdK8gm4XrQ05uqCfrpGtC4hRSFApUVxaQfoyczUAuo';

const supabase = createClient(supabaseUrl, supabaseKey);

const sydneyPlaces = [
    {
        name: '시드니 오페라 하우스',
        category: 'tour',
        rating: 5,
        is_kid_friendly: true,
        notes: '세계유산으로 등재된 돛 모양의 독특한 건축물. 공연 관람 또는 건축 투어 가능.',
        google_map_url: 'https://maps.google.com/?q=Sydney+Opera+House'
    },
    {
        name: '시드니 하버 브리지',
        category: 'tour',
        rating: 5,
        is_kid_friendly: false,
        notes: '1932년 완공된 세계 최대 규모의 철제 아치교. 브리지 클라임 체험 가능.',
        google_map_url: 'https://maps.google.com/?q=Sydney+Harbour+Bridge'
    },
    {
        name: '본다이 비치',
        category: 'tour',
        rating: 5,
        is_kid_friendly: true,
        notes: '황금빛 모래사장과 서핑으로 유명. 본다이-쿠지 해안 산책로 추천.',
        google_map_url: 'https://maps.google.com/?q=Bondi+Beach'
    },
    {
        name: '타롱가 동물원',
        category: 'play',
        rating: 5,
        is_kid_friendly: true,
        notes: '캥거루, 코알라 등 호주 야생동물을 만날 수 있는 동물원. 페리로 10분.',
        google_map_url: 'https://maps.google.com/?q=Taronga+Zoo'
    },
    {
        name: '시드니 타워 아이',
        category: 'tour',
        rating: 4,
        is_kid_friendly: true,
        notes: '시드니 시내 360도 전망대. 야경이 특히 아름다움.',
        google_map_url: 'https://maps.google.com/?q=Sydney+Tower+Eye'
    },
    {
        name: '블루 마운틴',
        category: 'tour',
        rating: 5,
        is_kid_friendly: true,
        notes: '유네스코 세계자연유산. 세 자매 봉과 다양한 하이킹 코스.',
        google_map_url: 'https://maps.google.com/?q=Blue+Mountains+Australia'
    },
    {
        name: '달링 하버',
        category: 'tour',
        rating: 4,
        is_kid_friendly: true,
        notes: '레스토랑, 카페, 박물관이 모여있는 엔터테인먼트 지구.',
        google_map_url: 'https://maps.google.com/?q=Darling+Harbour'
    },
    {
        name: '시 라이프 시드니 아쿠아리움',
        category: 'play',
        rating: 4,
        is_kid_friendly: true,
        notes: '호주 최대 규모 수족관. 700종 이상의 수중 생물 관람.',
        google_map_url: 'https://maps.google.com/?q=SEA+LIFE+Sydney+Aquarium'
    },
    {
        name: '로열 보타닉 가든',
        category: 'tour',
        rating: 4,
        is_kid_friendly: true,
        notes: '오페라하우스 옆 도심 속 휴식 공간. 산책과 피크닉 추천.',
        google_map_url: 'https://maps.google.com/?q=Royal+Botanic+Garden+Sydney'
    },
    {
        name: '더 록스',
        category: 'tour',
        rating: 4,
        is_kid_friendly: true,
        notes: '시드니 역사 발상지. 주말 록스 마켓에서 수공예품과 음식 구경.',
        google_map_url: 'https://maps.google.com/?q=The+Rocks+Sydney'
    }
];

async function seedPlaces() {
    console.log('시드니 관광명소 추가 중...');

    const { data, error } = await supabase
        .from('places')
        .insert(sydneyPlaces);

    if (error) {
        console.error('에러:', error);
    } else {
        console.log('성공! 10개 장소 추가됨');
    }
}

seedPlaces();
