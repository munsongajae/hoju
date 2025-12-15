// 시드니 관광 명소 10개 추가
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkssxcrcndghqysjjbql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrc3N4Y3JjbmRnaHF5c2pqYnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3Mzg3OTIsImV4cCI6MjA4MTMxNDc5Mn0.NcdK8gm4XrQ05uqCfrpGtC4hRSFApUVxaQfoyczUAuo';

const supabase = createClient(supabaseUrl, supabaseKey);

const tourPlaces = [
    {
        name: '맨리 비치',
        category: 'tour',
        rating: 5,
        is_kid_friendly: true,
        notes: '페리로 30분. 본다이보다 한적. 수영, 서핑, 스노클링 가능. 페리 여정 자체가 관광!',
        google_map_url: 'https://maps.google.com/?q=Manly+Beach+Sydney'
    },
    {
        name: '본다이-쿠지 해안 산책로',
        category: 'tour',
        rating: 5,
        is_kid_friendly: true,
        notes: '6km 절경 해안 산책. 약 2시간 소요. 중간에 카페, 해변 많음. 아이와 천천히 걷기 좋음.',
        google_map_url: 'https://maps.google.com/?q=Bondi+to+Coogee+Walk'
    },
    {
        name: '페더데일 와일드라이프 파크',
        category: 'tour',
        rating: 5,
        is_kid_friendly: true,
        notes: '코알라 안고 사진 찍기 가능! 캥거루, 웜뱃 직접 만져보기. 아이들 최고 인기.',
        google_map_url: 'https://maps.google.com/?q=Featherdale+Wildlife+Park'
    },
    {
        name: '왓슨스 베이',
        category: 'tour',
        rating: 4,
        is_kid_friendly: true,
        notes: '석양 맛집! 페리로 가는 바닷가 마을. 피쉬앤칩스 유명. 당일치기 추천.',
        google_map_url: 'https://maps.google.com/?q=Watsons+Bay+Sydney'
    },
    {
        name: '퀸 빅토리아 빌딩 (QVB)',
        category: 'tour',
        rating: 4,
        is_kid_friendly: true,
        notes: '1898년 건축물. 화려한 스테인드글라스, 중앙 시계. 쇼핑+구경 동시에.',
        google_map_url: 'https://maps.google.com/?q=Queen+Victoria+Building+Sydney'
    },
    {
        name: '웬디스 시크릿 가든',
        category: 'tour',
        rating: 4,
        is_kid_friendly: true,
        notes: '도심 속 비밀 정원! 하버 브리지 뷰. 피크닉 최적. 무료 입장.',
        google_map_url: 'https://maps.google.com/?q=Wendys+Secret+Garden+Sydney'
    },
    {
        name: '전망대 언덕 (Observatory Hill)',
        category: 'tour',
        rating: 4,
        is_kid_friendly: true,
        notes: '시드니 항구 탁 트인 전망. 일몰 시간 추천. 천문대와 함께 방문.',
        google_map_url: 'https://maps.google.com/?q=Observatory+Hill+Sydney'
    },
    {
        name: '커스텀스 하우스',
        category: 'tour',
        rating: 4,
        is_kid_friendly: true,
        notes: '150년 역사 건물. 도서관, 카페. 5층에서 오페라하우스+하버브리지 뷰!',
        google_map_url: 'https://maps.google.com/?q=Customs+House+Sydney'
    },
    {
        name: '패딩턴 저수지 정원',
        category: 'tour',
        rating: 4,
        is_kid_friendly: true,
        notes: '옛 저수지를 정원으로 개조. 자연+역사 조화. 인스타 명소. 무료.',
        google_map_url: 'https://maps.google.com/?q=Paddington+Reservoir+Gardens'
    },
    {
        name: '서큘러 키',
        category: 'tour',
        rating: 5,
        is_kid_friendly: true,
        notes: '시드니 관광 중심지. 오페라하우스-하버브리지 사이 항구. 페리 출발점. 버스커 공연.',
        google_map_url: 'https://maps.google.com/?q=Circular+Quay+Sydney'
    }
];

async function seedTourPlaces() {
    console.log('시드니 관광 명소 10개 추가 중...');

    const { data, error } = await supabase
        .from('places')
        .insert(tourPlaces);

    if (error) {
        console.error('에러:', error);
    } else {
        console.log('성공! 10개 관광 명소 추가됨');
    }
}

seedTourPlaces();
