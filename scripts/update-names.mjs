// 장소명 국문(영문) 병기 업데이트
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkssxcrcndghqysjjbql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrc3N4Y3JjbmRnaHF5c2pqYnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3Mzg3OTIsImV4cCI6MjA4MTMxNDc5Mn0.NcdK8gm4XrQ05uqCfrpGtC4hRSFApUVxaQfoyczUAuo';

const supabase = createClient(supabaseUrl, supabaseKey);

// 이름 매핑: 현재 이름 -> 새 이름 (국문 + 영문)
const nameUpdates = [
    // 관광 명소
    { old: '시드니 오페라 하우스', new: '시드니 오페라 하우스 (Sydney Opera House)' },
    { old: '시드니 하버 브리지', new: '시드니 하버 브리지 (Sydney Harbour Bridge)' },
    { old: '본다이 비치', new: '본다이 비치 (Bondi Beach)' },
    { old: '타롱가 동물원', new: '타롱가 동물원 (Taronga Zoo)' },
    { old: '시드니 타워 아이', new: '시드니 타워 아이 (Sydney Tower Eye)' },
    { old: '블루 마운틴', new: '블루 마운틴 (Blue Mountains)' },
    { old: '달링 하버', new: '달링 하버 (Darling Harbour)' },
    { old: '로열 보타닉 가든', new: '로열 보타닉 가든 (Royal Botanic Garden)' },
    { old: '더 록스', new: '더 록스 (The Rocks)' },
    { old: '맨리 비치', new: '맨리 비치 (Manly Beach)' },
    { old: '본다이-쿠지 해안 산책로', new: '본다이-쿠지 해안 산책로 (Bondi to Coogee Walk)' },
    { old: '페더데일 와일드라이프 파크', new: '페더데일 와일드라이프 파크 (Featherdale Wildlife Park)' },
    { old: '왓슨스 베이', new: '왓슨스 베이 (Watsons Bay)' },
    { old: '퀸 빅토리아 빌딩 (QVB)', new: '퀸 빅토리아 빌딩 (Queen Victoria Building)' },
    { old: '웬디스 시크릿 가든', new: '웬디스 시크릿 가든 (Wendy\'s Secret Garden)' },
    { old: '전망대 언덕 (Observatory Hill)', new: '전망대 언덕 (Observatory Hill)' },
    { old: '커스텀스 하우스', new: '커스텀스 하우스 (Customs House)' },
    { old: '패딩턴 저수지 정원', new: '패딩턴 저수지 정원 (Paddington Reservoir Gardens)' },
    { old: '서큘러 키', new: '서큘러 키 (Circular Quay)' },

    // 전시/박물관
    { old: '🏛️ 호주 국립 해양 박물관', new: '호주 국립 해양 박물관 (Australian National Maritime Museum)' },
    { old: '🏛️ 호주 박물관 (Australian Museum)', new: '호주 박물관 (Australian Museum)' },
    { old: '🏛️ 파워하우스 뮤지엄', new: '파워하우스 뮤지엄 (Powerhouse Museum)' },
    { old: '🏛️ NSW 미술관', new: 'NSW 미술관 (Art Gallery of NSW)' },
    { old: '🏛️ 시드니 현대미술관 (MCA)', new: '시드니 현대미술관 (Museum of Contemporary Art)' },
    { old: '🏛️ 시드니 천문대', new: '시드니 천문대 (Sydney Observatory)' },
    { old: '시드니 유대인 박물관', new: '시드니 유대인 박물관 (Sydney Jewish Museum)' },
    { old: '화이트 래빗 갤러리', new: '화이트 래빗 갤러리 (White Rabbit Gallery)' },
    { old: '마담 투소 시드니', new: '마담 투소 시드니 (Madame Tussauds Sydney)' },
    { old: '시드니 트램웨이 박물관', new: '시드니 트램웨이 박물관 (Sydney Tramway Museum)' },
    { old: '시드니 생활 박물관', new: '시드니 생활 박물관 (Museum of Sydney)' },
    { old: '하이드파크 배럭스 박물관', new: '하이드파크 배럭스 박물관 (Hyde Park Barracks)' },
    { old: '저스티스 앤 폴리스 뮤지엄', new: '저스티스 앤 폴리스 뮤지엄 (Justice & Police Museum)' },
    { old: '록스 디스커버리 뮤지엄', new: '록스 디스커버리 뮤지엄 (The Rocks Discovery Museum)' },

    // 놀이
    { old: '달링 쿼터 놀이터', new: '달링 쿼터 놀이터 (Darling Quarter Playground)' },
    { old: '루나 파크 시드니', new: '루나 파크 시드니 (Luna Park Sydney)' },
    { old: '레이징 워터스 시드니', new: '레이징 워터스 시드니 (Raging Waters Sydney)' },
    { old: '이안 포터 어린이 와일드플레이 정원', new: '이안 포터 와일드플레이 (Ian Potter WILD PLAY Garden)' },
    { old: '텀바롱 공원 워터 플레이', new: '텀바롱 공원 (Tumbalong Park)' },
    { old: '키즈데이 (Kidsday)', new: '키즈데이 (Kidsday)' },
    { old: '바이탈랜즈 키즈카페', new: '바이탈랜즈 키즈카페 (Vitalands Kids Cafe)' },
    { old: 'iFLY 다운언더 실내 스카이다이빙', new: 'iFLY 실내 스카이다이빙 (iFLY Downunder)' },
    { old: '트리탑 어드벤처 파크', new: '트리탑 어드벤처 파크 (TreeTops Adventure Park)' },
    { old: '시드니 올림픽 파크 펀캐스터', new: '올림픽 파크 (Sydney Olympic Park)' },
    { old: '시 라이프 시드니 아쿠아리움', new: '시 라이프 아쿠아리움 (SEA LIFE Sydney Aquarium)' },
];

async function updateNames() {
    console.log('장소명 국문(영문) 병기 업데이트 중...');
    let updated = 0;
    let failed = 0;

    for (const item of nameUpdates) {
        const { error } = await supabase
            .from('places')
            .update({ name: item.new })
            .eq('name', item.old);

        if (error) {
            console.log(`❌ 실패: ${item.old}`);
            failed++;
        } else {
            console.log(`✅ 업데이트: ${item.new}`);
            updated++;
        }
    }

    console.log(`\n완료! 업데이트: ${updated}개, 실패: ${failed}개`);
}

updateNames();
