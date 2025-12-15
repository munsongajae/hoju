// 시드니 놀이/키즈 카테고리 데이터 10개 추가
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkssxcrcndghqysjjbql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrc3N4Y3JjbmRnaHF5c2pqYnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3Mzg3OTIsImV4cCI6MjA4MTMxNDc5Mn0.NcdK8gm4XrQ05uqCfrpGtC4hRSFApUVxaQfoyczUAuo';

const supabase = createClient(supabaseUrl, supabaseKey);

const playPlaces = [
    {
        name: '달링 쿼터 놀이터',
        category: 'play',
        rating: 5,
        is_kid_friendly: true,
        notes: '시드니 최고의 무료 놀이터! 스플래시 패드, 미끄럼틀, 플라잉 폭스 등. 달링하버 위치.',
        google_map_url: 'https://maps.google.com/?q=Darling+Quarter+Playground'
    },
    {
        name: '루나 파크 시드니',
        category: 'play',
        rating: 5,
        is_kid_friendly: true,
        notes: '하버 브리지 아래 복고풍 놀이공원. 어린이용 놀이기구 풍부. 입장 무료(기구별 결제).',
        google_map_url: 'https://maps.google.com/?q=Luna+Park+Sydney'
    },
    {
        name: '레이징 워터스 시드니',
        category: 'play',
        rating: 5,
        is_kid_friendly: true,
        notes: '시드니 최대 워터파크! 40개 이상 슬라이드, 유수풀, 파도풀. 여름 필수!',
        google_map_url: 'https://maps.google.com/?q=Raging+Waters+Sydney'
    },
    {
        name: '이안 포터 어린이 와일드플레이 정원',
        category: 'play',
        rating: 5,
        is_kid_friendly: true,
        notes: '센테니얼 파크 내 자연 놀이터. 무료 입장. 나무 위 놀이대, 물놀이 등.',
        google_map_url: 'https://maps.google.com/?q=Ian+Potter+Children+WILD+PLAY+Garden'
    },
    {
        name: '텀바롱 공원 워터 플레이',
        category: 'play',
        rating: 4,
        is_kid_friendly: true,
        notes: '달링하버 무료 물놀이 공간. 더운 날 아이들 시원하게 놀기 좋음.',
        google_map_url: 'https://maps.google.com/?q=Tumbalong+Park+Sydney'
    },
    {
        name: '키즈데이 (Kidsday)',
        category: 'play',
        rating: 4,
        is_kid_friendly: true,
        notes: '한국인 운영 키즈카페. 깔끔하고 음식 맛있음. Meadowbank 위치. 양말 필수!',
        google_map_url: 'https://maps.google.com/?q=Kidsday+Meadowbank'
    },
    {
        name: '바이탈랜즈 키즈카페',
        category: 'play',
        rating: 4,
        is_kid_friendly: true,
        notes: '시드니 여러 지점. 기차놀이, 페이스페인팅, 댄스 수업 등. 부모 휴식 가능.',
        google_map_url: 'https://maps.google.com/?q=Vitalands+Kids+Cafe+Sydney'
    },
    {
        name: 'iFLY 다운언더 실내 스카이다이빙',
        category: 'play',
        rating: 5,
        is_kid_friendly: true,
        notes: '어린이도 가능한 실내 스카이다이빙 체험! 웨스트 시드니 위치. 잊지 못할 경험.',
        google_map_url: 'https://maps.google.com/?q=iFLY+Downunder+Sydney'
    },
    {
        name: '트리탑 어드벤처 파크',
        category: 'play',
        rating: 4,
        is_kid_friendly: true,
        notes: '나무 위 짚라인, 로프 코스 체험. 초등학생용 주니어 코스 있음. 자연 속 모험!',
        google_map_url: 'https://maps.google.com/?q=TreeTops+Adventure+Park+Sydney'
    },
    {
        name: '시드니 올림픽 파크 펀캐스터',
        category: 'play',
        rating: 4,
        is_kid_friendly: true,
        notes: '올림픽 파크 내 대형 바운스, 어린이 놀이시설. 방학 시즌 특별 이벤트.',
        google_map_url: 'https://maps.google.com/?q=Sydney+Olympic+Park'
    }
];

async function seedPlayPlaces() {
    console.log('시드니 놀이/키즈 장소 10개 추가 중...');

    const { data, error } = await supabase
        .from('places')
        .insert(playPlaces);

    if (error) {
        console.error('에러:', error);
    } else {
        console.log('성공! 10개 놀이 장소 추가됨');
    }
}

seedPlayPlaces();
