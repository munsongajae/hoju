// 시드니 수영장 장소 추가 스크립트
// 실행 방법: npx tsx scripts/add_sydney_pools.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const swimmingPools = [
  {
    name: 'Ryde Aquatic Leisure Centre',
    city: '시드니',
    category: 'play',
    rating: 4.2,
    is_kid_friendly: true,
    address: '504 Victoria Rd, Ryde NSW 2112, Australia',
    notes: '실내 수영장으로, 파도풀과 자이언트 슬라이드 등 아이들을 위한 다양한 놀이 시설이 갖춰져 있습니다.',
    website_url: 'http://www.ryde.nsw.gov.au/RALC',
    google_map_url: 'https://maps.google.com/?q=Ryde+Aquatic+Leisure+Centre',
  },
  {
    name: 'Sydney Olympic Park Aquatic Centre',
    city: '시드니',
    category: 'play',
    rating: 4.3,
    is_kid_friendly: true,
    address: '9 Olympic Blvd, Sydney Olympic Park NSW 2127, Australia',
    notes: '2000년 시드니 올림픽 수영 경기장이었던 이곳은 현재 가족 친화적인 수영장으로, 어린이용 물놀이 시설과 슬라이드 등이 마련되어 있습니다.',
    website_url: 'http://www.aquaticcentre.com.au/',
    google_map_url: 'https://maps.google.com/?q=Sydney+Olympic+Park+Aquatic+Centre',
  },
  {
    name: 'Ian Thorpe Aquatic Centre',
    city: '시드니',
    category: 'play',
    rating: 4.2,
    is_kid_friendly: true,
    address: '458 Harris St, Ultimo NSW 2007, Australia',
    notes: '시드니 도심에 위치한 이 수영장은 어린이 전용 수영장과 수영 교습 프로그램을 제공하며, 가족 단위 방문객에게 적합합니다.',
    website_url: 'https://cityofsydneyleisure.com.au/visit/ian-thorpe-aquatic-centre',
    google_map_url: 'https://maps.google.com/?q=Ian+Thorpe+Aquatic+Centre',
  },
  {
    name: 'Bronte Baths',
    city: '시드니',
    category: 'play',
    rating: 4.8,
    is_kid_friendly: true,
    address: 'Bronte Rd, Bronte NSW 2024, Australia',
    notes: '브론테 해변 남쪽 곶에 위치한 바다 수영장으로, 무료로 이용할 수 있으며 해변 뒤편에는 바비큐와 테이블이 있는 넓은 잔디 공원이 있습니다.',
    website_url: 'https://www.waverley.nsw.gov.au/recreation/beaches_and_coast/pool_cleaning_schedule/bronte_pool_cleaning_schedule',
    google_map_url: 'https://maps.google.com/?q=Bronte+Baths',
  },
];

async function addSwimmingPools() {
  try {
    // 최신 여행 가져오기
    const { data: trips, error: tripsError } = await supabase
      .from('trips')
      .select('id, title')
      .order('created_at', { ascending: false })
      .limit(1);

    if (tripsError) {
      console.error('여행 조회 실패:', tripsError);
      return;
    }

    if (!trips || trips.length === 0) {
      console.error('여행이 없습니다. 먼저 여행을 생성해주세요.');
      return;
    }

    const tripId = trips[0].id;
    console.log(`여행 "${trips[0].title}" (${tripId})에 수영장을 추가합니다...\n`);

    // 각 수영장 추가
    for (const pool of swimmingPools) {
      const { data, error } = await supabase
        .from('places')
        .insert([{
          ...pool,
          trip_id: tripId,
        }])
        .select();

      if (error) {
        console.error(`❌ ${pool.name} 추가 실패:`, error.message);
      } else {
        console.log(`✅ ${pool.name} 추가 완료`);
      }
    }

    console.log('\n모든 수영장 추가가 완료되었습니다!');
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

addSwimmingPools();
