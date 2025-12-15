// 시드니 박물관/전시관 추가 데이터 10개
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkssxcrcndghqysjjbql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrc3N4Y3JjbmRnaHF5c2pqYnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3Mzg3OTIsImV4cCI6MjA4MTMxNDc5Mn0.NcdK8gm4XrQ05uqCfrpGtC4hRSFApUVxaQfoyczUAuo';

const supabase = createClient(supabaseUrl, supabaseKey);

const museums = [
    {
        name: '시드니 유대인 박물관',
        category: 'museum',
        rating: 4,
        is_kid_friendly: true,
        notes: '홀로코스트 역사 교육. 인터랙티브 전시로 역사 학습. 초등 고학년 추천.',
        google_map_url: 'https://maps.google.com/?q=Sydney+Jewish+Museum'
    },
    {
        name: '화이트 래빗 갤러리',
        category: 'museum',
        rating: 4,
        is_kid_friendly: true,
        notes: '현대 중국 미술 전문. 독특하고 컬러풀한 작품들이 아이들 흥미 유발. 무료 입장!',
        google_map_url: 'https://maps.google.com/?q=White+Rabbit+Gallery+Sydney'
    },
    {
        name: '마담 투소 시드니',
        category: 'museum',
        rating: 4,
        is_kid_friendly: true,
        notes: '유명인 밀랍인형 전시. 사진 촬영 가능. 아이들이 좋아하는 체험형!',
        google_map_url: 'https://maps.google.com/?q=Madame+Tussauds+Sydney'
    },
    {
        name: '시드니 트램웨이 박물관',
        category: 'museum',
        rating: 4,
        is_kid_friendly: true,
        notes: '빈티지 트램 실제 탑승 체험! 교통 역사 학습. 초등학생 남자아이들 특히 좋아함.',
        google_map_url: 'https://maps.google.com/?q=Sydney+Tramway+Museum'
    },
    {
        name: 'S.H. Ervin 갤러리',
        category: 'museum',
        rating: 3,
        is_kid_friendly: false,
        notes: '호주 예술 전문 갤러리. 밀러스 포인트 위치. 조용한 분위기의 미술 감상.',
        google_map_url: 'https://maps.google.com/?q=SH+Ervin+Gallery+Sydney'
    },
    {
        name: '시드니 생활 박물관',
        category: 'museum',
        rating: 4,
        is_kid_friendly: true,
        notes: '시드니의 일상 역사 전시. 옛날 생활용품, 사진 등. 할머니 시대 이야기해주기 좋음.',
        google_map_url: 'https://maps.google.com/?q=Museum+of+Sydney'
    },
    {
        name: '하이드파크 배럭스 박물관',
        category: 'museum',
        rating: 4,
        is_kid_friendly: true,
        notes: '세계유산. 호주 죄수 역사. 인터랙티브 전시로 식민지 시대 학습.',
        google_map_url: 'https://maps.google.com/?q=Hyde+Park+Barracks+Museum'
    },
    {
        name: '저스티스 앤 폴리스 뮤지엄',
        category: 'museum',
        rating: 4,
        is_kid_friendly: true,
        notes: '범죄와 사법 역사. 실제 법정 재현. 초등 고학년 사회 학습에 유용.',
        google_map_url: 'https://maps.google.com/?q=Justice+and+Police+Museum+Sydney'
    },
    {
        name: '수잔 길모어 갤러리',
        category: 'museum',
        rating: 3,
        is_kid_friendly: false,
        notes: '원주민 현대 미술 전문. 울루루 출신 작가들 작품. 문화 다양성 교육.',
        google_map_url: 'https://maps.google.com/?q=Suzanne+Gelmour+Gallery+Sydney'
    },
    {
        name: '록스 디스커버리 뮤지엄',
        category: 'museum',
        rating: 4,
        is_kid_friendly: true,
        notes: '더 록스 역사 상설 전시. 무료 입장. 시드니 초기 정착 역사 학습.',
        google_map_url: 'https://maps.google.com/?q=The+Rocks+Discovery+Museum'
    }
];

async function seedMoreMuseums() {
    console.log('시드니 박물관/전시관 10개 추가 중...');

    const { data, error } = await supabase
        .from('places')
        .insert(museums);

    if (error) {
        console.error('에러:', error);
    } else {
        console.log('성공! 10개 박물관/전시관 추가됨');
    }
}

seedMoreMuseums();
