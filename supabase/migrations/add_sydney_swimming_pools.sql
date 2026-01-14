-- 시드니 아이들 수영장 장소 추가 (놀이 카테고리)
-- 이 스크립트는 가장 최근에 생성된 여행에 수영장 정보를 추가합니다.
-- 특정 여행에 추가하려면 (SELECT id FROM trips ORDER BY created_at DESC LIMIT 1) 부분을 원하는 trip_id로 변경하세요.

-- 1. Ryde Aquatic Leisure Centre
INSERT INTO public.places (
    name,
    city,
    category,
    rating,
    is_kid_friendly,
    address,
    notes,
    website_url,
    google_map_url,
    trip_id
) VALUES (
    'Ryde Aquatic Leisure Centre',
    '시드니',
    'play',
    4.2,
    true,
    '504 Victoria Rd, Ryde NSW 2112, Australia',
    '실내 수영장으로, 파도풀과 자이언트 슬라이드 등 아이들을 위한 다양한 놀이 시설이 갖춰져 있습니다.',
    'http://www.ryde.nsw.gov.au/RALC',
    'https://maps.google.com/?q=Ryde+Aquatic+Leisure+Centre',
    (SELECT id FROM trips ORDER BY created_at DESC LIMIT 1)
) ON CONFLICT DO NOTHING;

-- 2. Sydney Olympic Park Aquatic Centre
INSERT INTO public.places (
    name,
    city,
    category,
    rating,
    is_kid_friendly,
    address,
    notes,
    website_url,
    google_map_url,
    trip_id
) VALUES (
    'Sydney Olympic Park Aquatic Centre',
    '시드니',
    'play',
    4.3,
    true,
    '9 Olympic Blvd, Sydney Olympic Park NSW 2127, Australia',
    '2000년 시드니 올림픽 수영 경기장이었던 이곳은 현재 가족 친화적인 수영장으로, 어린이용 물놀이 시설과 슬라이드 등이 마련되어 있습니다.',
    'http://www.aquaticcentre.com.au/',
    'https://maps.google.com/?q=Sydney+Olympic+Park+Aquatic+Centre',
    (SELECT id FROM trips ORDER BY created_at DESC LIMIT 1)
) ON CONFLICT DO NOTHING;

-- 3. Ian Thorpe Aquatic Centre
INSERT INTO public.places (
    name,
    city,
    category,
    rating,
    is_kid_friendly,
    address,
    notes,
    website_url,
    google_map_url,
    trip_id
) VALUES (
    'Ian Thorpe Aquatic Centre',
    '시드니',
    'play',
    4.2,
    true,
    '458 Harris St, Ultimo NSW 2007, Australia',
    '시드니 도심에 위치한 이 수영장은 어린이 전용 수영장과 수영 교습 프로그램을 제공하며, 가족 단위 방문객에게 적합합니다.',
    'https://cityofsydneyleisure.com.au/visit/ian-thorpe-aquatic-centre',
    'https://maps.google.com/?q=Ian+Thorpe+Aquatic+Centre',
    (SELECT id FROM trips ORDER BY created_at DESC LIMIT 1)
) ON CONFLICT DO NOTHING;

-- 4. Bronte Baths
INSERT INTO public.places (
    name,
    city,
    category,
    rating,
    is_kid_friendly,
    address,
    notes,
    website_url,
    google_map_url,
    trip_id
) VALUES (
    'Bronte Baths',
    '시드니',
    'play',
    4.8,
    true,
    'Bronte Rd, Bronte NSW 2024, Australia',
    '브론테 해변 남쪽 곶에 위치한 바다 수영장으로, 무료로 이용할 수 있으며 해변 뒤편에는 바비큐와 테이블이 있는 넓은 잔디 공원이 있습니다.',
    'https://www.waverley.nsw.gov.au/recreation/beaches_and_coast/pool_cleaning_schedule/bronte_pool_cleaning_schedule',
    'https://maps.google.com/?q=Bronte+Baths',
    (SELECT id FROM trips ORDER BY created_at DESC LIMIT 1)
) ON CONFLICT DO NOTHING;
-- 5. Cook + Phillip Park Pool
INSERT INTO public.places (
    name,
    city,
    category,
    rating,
    is_kid_friendly,
    address,
    notes,
    website_url,
    google_map_url,
    trip_id
) VALUES (
    'Cook + Phillip Park Pool',
    '시드니',
    'play',
    4.1,
    true,
    '4 College St, Sydney NSW 2000, Australia',
    '세인트 메리 대성당 인근 도심에 위치해 접근성이 좋습니다. 수온이 따뜻한 레저 풀이 있어 아이들이 사계절 내내 물놀이를 즐기기 좋습니다.',
    'https://www.cookandphillip.org.au/',
    'https://maps.app.goo.gl/9Rz88W7M7C7X8rYy7',
    (SELECT id FROM trips ORDER BY created_at DESC LIMIT 1)
) ON CONFLICT DO NOTHING;

-- 6. Gunyama Park Aquatic and Recreation Centre
INSERT INTO public.places (
    name,
    city,
    category,
    rating,
    is_kid_friendly,
    address,
    notes,
    website_url,
    google_map_url,
    trip_id
) VALUES (
    'Gunyama Park Aquatic and Recreation Centre',
    '시드니',
    'play',
    4.5,
    true,
    '17 Zetland Ave, Zetland NSW 2017, Australia',
    '최근에 지어진 현대적인 시설로, 야외 온수 수영장과 아이들을 위한 인터랙티브 워터 플레이 존(물총, 분수 등)이 매우 잘 되어 있습니다.',
    'https://www.gunyamapark.com.au/',
    'https://maps.app.goo.gl/5q5L4p6p6P6P6P6P6',
    (SELECT id FROM trips ORDER BY created_at DESC LIMIT 1)
) ON CONFLICT DO NOTHING;

-- 7. North Sydney Olympic Pool
INSERT INTO public.places (
    name,
    city,
    category,
    rating,
    is_kid_friendly,
    address,
    notes,
    website_url,
    google_map_url,
    trip_id
) VALUES (
    'North Sydney Olympic Pool',
    '시드니',
    'play',
    4.4,
    true,
    '4 Alfred St S, Milsons Point NSW 2061, Australia',
    '하버 브릿지와 루나 파크 바로 옆에 위치해 뷰가 환상적입니다. 어린이용 얕은 풀이 있으며, 수영 후 바로 옆 루나 파크로 이동하기 좋습니다.',
    'https://www.northsydney.nsw.gov.au/NSOP',
    'https://maps.app.goo.gl/3w9e8R7T6Y5U4I3O2',
    (SELECT id FROM trips ORDER BY created_at DESC LIMIT 1)
) ON CONFLICT DO NOTHING;

-- 8. Dee Why Rockpool
INSERT INTO public.places (
    name,
    city,
    category,
    rating,
    is_kid_friendly,
    address,
    notes,
    website_url,
    google_map_url,
    trip_id
) VALUES (
    'Dee Why Rockpool',
    '시드니',
    'play',
    4.7,
    true,
    'Oaks Ave, Dee Why NSW 2099, Australia',
    '아이들이 안전하게 바닷물을 즐길 수 있도록 콘크리트 벽으로 분리된 오션풀입니다. 별도의 유아용 풀이 따로 있어 어린 자녀와 방문하기 최적입니다.',
    'https://www.northernbeaches.nsw.gov.au/things-to-do/recreation-area/dee-why-rockpool',
    'https://maps.app.goo.gl/1a2b3c4d5e6f7g8h9',
    (SELECT id FROM trips ORDER BY created_at DESC LIMIT 1)
) ON CONFLICT DO NOTHING;