// 시드니 박물관/전시관 데이터 추가 (초등학생 친화적)
// 임시로 tour 카테고리 사용 (DB 제약조건 때문)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkssxcrcndghqysjjbql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrc3N4Y3JjbmRnaHF5c2pqYnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3Mzg3OTIsImV4cCI6MjA4MTMxNDc5Mn0.NcdK8gm4XrQ05uqCfrpGtC4hRSFApUVxaQfoyczUAuo';

const supabase = createClient(supabaseUrl, supabaseKey);

const museums = [
    {
        name: '🏛️ 호주 국립 해양 박물관',
        category: 'tour',  // museum 대신 tour 사용
        rating: 5,
        is_kid_friendly: true,
        notes: '[전시관] 달링하버 위치. 실제 잠수함(HMAS 온슬로)과 구축함에 직접 탑승 체험! 초등학생 강추. 상설 갤러리 무료.',
        google_map_url: 'https://maps.google.com/?q=Australian+National+Maritime+Museum'
    },
    {
        name: '🏛️ 호주 박물관 (Australian Museum)',
        category: 'tour',
        rating: 5,
        is_kid_friendly: true,
        notes: '[전시관] 호주 최고(最古) 박물관. 공룡 뼈, 박제 동물, 보석. Burra 체험공간에서 원주민 문화 학습. 상설전시 무료!',
        google_map_url: 'https://maps.google.com/?q=Australian+Museum+Sydney'
    },
    {
        name: '🏛️ 파워하우스 뮤지엄',
        category: 'tour',
        rating: 5,
        is_kid_friendly: true,
        notes: '[전시관] 과학/기술 체험 박물관. 버튼 누르고 만지는 인터랙티브 전시. 초등학생이 직접 참여 가능!',
        google_map_url: 'https://maps.google.com/?q=Powerhouse+Museum+Sydney'
    },
    {
        name: '🏛️ NSW 미술관',
        category: 'tour',
        rating: 4,
        is_kid_friendly: true,
        notes: '[전시관] 입장 무료. 어린이용 활동 책자 제공. 미술 트레일 따라가며 그림 그리기. 어린이 미술 도서관 있음.',
        google_map_url: 'https://maps.google.com/?q=Art+Gallery+of+New+South+Wales'
    },
    {
        name: '🏛️ 시드니 현대미술관 (MCA)',
        category: 'tour',
        rating: 4,
        is_kid_friendly: true,
        notes: '[전시관] 서큘러키 위치. 가족용 아트 채터박스 카드 제공. 감각 놀이하며 작품 만들기 체험.',
        google_map_url: 'https://maps.google.com/?q=Museum+of+Contemporary+Art+Australia'
    },
    {
        name: '🏛️ 시드니 천문대',
        category: 'tour',
        rating: 4,
        is_kid_friendly: true,
        notes: '[전시관] 밤에 별자리 관측. 망원경으로 달, 행성 관찰. 초등학생 우주 교육에 최적!',
        google_map_url: 'https://maps.google.com/?q=Sydney+Observatory'
    }
];

async function seedMuseums() {
    console.log('시드니 박물관/전시관 추가 중...');

    const { data, error } = await supabase
        .from('places')
        .insert(museums);

    if (error) {
        console.error('에러:', error);
    } else {
        console.log('성공! 6개 박물관/전시관 추가됨 (이름에 🏛️ 표시)');
    }
}

seedMuseums();
