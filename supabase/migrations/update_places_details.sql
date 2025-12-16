-- 장소들의 주소, 연락처, 운영시간 정보 업데이트

-- 시드니 관광지들
UPDATE places SET 
    address = 'Bennelong Point, Sydney NSW 2000',
    contact_phone = '+61 2 9250 7111',
    operating_hours = '매일 9:00-17:00 (박스오피스: 월-토 9:00-20:30, 일 9:00-17:00)',
    website_url = 'https://www.sydneyoperahouse.com'
WHERE name = '시드니 오페라 하우스';

UPDATE places SET 
    address = 'Sydney Harbour Bridge, Sydney NSW 2000',
    contact_phone = '+61 2 8274 7777',
    operating_hours = '24시간 (브리지 클라임: 예약 필요)',
    website_url = 'https://www.bridgeclimb.com'
WHERE name = '시드니 하버 브리지';

UPDATE places SET 
    address = 'Bondi Beach, Bondi NSW 2026',
    contact_phone = '+61 2 9365 7900',
    operating_hours = '24시간 (해변)',
    website_url = 'https://www.waverley.nsw.gov.au'
WHERE name = '본다이 비치';

UPDATE places SET 
    address = 'Bradleys Head Road, Mosman NSW 2088',
    contact_phone = '+61 2 9969 2777',
    operating_hours = '매일 9:30-17:00',
    website_url = 'https://taronga.org.au'
WHERE name = '타롱가 동물원';

UPDATE places SET 
    address = '100 Market St, Sydney NSW 2000',
    contact_phone = '+61 2 9333 9222',
    operating_hours = '매일 9:00-21:30',
    website_url = 'https://www.sydneytowereye.com.au'
WHERE name = '시드니 타워 아이';

UPDATE places SET 
    address = 'Blue Mountains National Park, NSW',
    contact_phone = '+61 2 4787 8877',
    operating_hours = '24시간 (공원)',
    website_url = 'https://www.nationalparks.nsw.gov.au'
WHERE name = '블루 마운틴';

UPDATE places SET 
    address = 'Darling Harbour, Sydney NSW 2000',
    contact_phone = '+61 2 9240 8500',
    operating_hours = '매일 10:00-22:00 (시설별 상이)',
    website_url = 'https://www.darlingharbour.com'
WHERE name = '달링 하버';

UPDATE places SET 
    address = 'Aquarium Pier, Darling Harbour, Sydney NSW 2000',
    contact_phone = '+61 2 8251 7800',
    operating_hours = '매일 9:30-18:00',
    website_url = 'https://www.sydneyaquarium.com.au'
WHERE name = '시 라이프 시드니 아쿠아리움';

UPDATE places SET 
    address = 'Mrs Macquaries Rd, Sydney NSW 2000',
    contact_phone = '+61 2 9231 8111',
    operating_hours = '매일 7:00-19:30 (여름), 7:00-17:30 (겨울)',
    website_url = 'https://www.rbgsyd.nsw.gov.au'
WHERE name = '로열 보타닉 가든';

UPDATE places SET 
    address = 'The Rocks, Sydney NSW 2000',
    contact_phone = '+61 2 9240 8788',
    operating_hours = '매일 24시간 (마켓: 토일 10:00-17:00)',
    website_url = 'https://www.therocks.com'
WHERE name = '더 록스';

-- 시드니 맛집들 (seed_places_manual.sql에서 주소 추출)
UPDATE places SET 
    address = '20 Campbell St, Haymarket NSW 2000',
    contact_phone = '+61 2 9211 1808',
    operating_hours = '매일 10:00-02:00',
    website_url = 'https://chatthai.com'
WHERE name = '챗 타이 (Chat Thai)';

UPDATE places SET 
    address = '15 Goulburn St, Haymarket NSW 2000',
    contact_phone = '+61 2 9211 1668',
    operating_hours = '월-목 11:30-14:30, 17:30-22:00 / 금-일 11:30-22:00',
    website_url = 'https://mamak.com.au'
WHERE name = '마막 (Mamak)';

UPDATE places SET 
    address = '92 Hay St, Haymarket NSW 2000',
    contact_phone = '+61 2 9211 1888',
    operating_hours = '월-일 12:00-15:00, 17:00-22:00',
    website_url = 'https://hojiak.com.au'
WHERE name = '호 지악 (Ho Jiak Haymarket)';

UPDATE places SET 
    address = 'Shop 1 & 2, 299 Sussex St, Sydney NSW 2000',
    contact_phone = '+61 2 9267 8866',
    operating_hours = '월-일 11:30-22:00',
    website_url = 'https://homethai.com.au'
WHERE name = '홈 타이 (Home Thai)';

UPDATE places SET 
    address = 'Shop 7, Prince Centre, 8 Quay St, Haymarket NSW 2000',
    contact_phone = '+61 2 9281 9051',
    operating_hours = '월-일 11:00-21:00',
    website_url = NULL
WHERE name = '차이니즈 누들 레스토랑 (Chinese Noodle Restaurant)';

UPDATE places SET 
    address = 'Shop 211/25-29 Dixon St, Haymarket NSW 2000',
    contact_phone = '+61 2 9211 2852',
    operating_hours = '월-일 11:00-21:00',
    website_url = NULL
WHERE name = '검샤라 (Gumshara)';

UPDATE places SET 
    address = '236A Illawarra Rd, Marrickville NSW 2204',
    contact_phone = '+61 2 9557 1539',
    operating_hours = '월-일 6:00-20:00',
    website_url = NULL
WHERE name = '매릭빌 포크 롤 (Marrickville Pork Roll)';

UPDATE places SET 
    address = '4-8 South St, Granville NSW 2142',
    contact_phone = '+61 2 9637 5555',
    operating_hours = '월-일 11:00-23:00',
    website_url = 'https://eljannah.com.au'
WHERE name = '엘 자나 (El Jannah)';

UPDATE places SET 
    address = '69 Wigram St, Harris Park NSW 2150',
    contact_phone = '+61 2 9635 5555',
    operating_hours = '월-일 10:00-22:00',
    website_url = 'https://dosahut.com.au'
WHERE name = '도사 헛 (Dosa Hut)';

UPDATE places SET 
    address = '9/37 Ultimo Rd, Haymarket NSW 2000',
    contact_phone = '+61 2 9211 1888',
    operating_hours = '월-일 11:00-22:00',
    website_url = NULL
WHERE name = '두 디 파이당 (Do Dee Paidang)';

UPDATE places SET 
    address = '52 Phillip St, Sydney NSW 2000',
    contact_phone = '+61 2 9231 5555',
    operating_hours = '월-일 11:30-22:00',
    website_url = 'https://barluca.com.au'
WHERE name = '바 루카 (Bar Luca)';

UPDATE places SET 
    address = '6 Mary St, Newtown NSW 2042',
    contact_phone = '+61 2 9557 7777',
    operating_hours = '월-일 12:00-23:00',
    website_url = 'https://marys.com.au'
WHERE name = '메리스 (Mary''s)';

UPDATE places SET 
    address = '22 Playfair St, The Rocks NSW 2000',
    contact_phone = '+61 2 9247 6371',
    operating_hours = '24시간',
    website_url = 'https://pancakesontherocks.com.au'
WHERE name = '팬케이크 온 더 록스 (Pancakes on the Rocks)';

UPDATE places SET 
    address = 'Level 2/10 Harbourside Shopping Centre, Darling Harbour NSW 2000',
    contact_phone = '+61 2 9211 2210',
    operating_hours = '월-일 12:00-22:00',
    website_url = 'https://hurricanesgrill.com.au'
WHERE name = '허리케인 그릴 (Hurricane''s Grill)';

UPDATE places SET 
    address = 'Cowper Wharf Roadway, Woolloomooloo NSW 2011',
    contact_phone = '+61 2 9357 3074',
    operating_hours = '월-일 9:00-23:00',
    website_url = 'https://harryscafedewheels.com.au'
WHERE name = '해리스 카페 드 휠 (Harry''s Cafe de Wheels)';

UPDATE places SET 
    address = '7a/2 Huntley St, Alexandria NSW 2015',
    contact_phone = '+61 2 9699 2225',
    operating_hours = '월-금 7:30-16:00 / 토일 7:30-16:30',
    website_url = 'https://thegrounds.com.au'
WHERE name = '더 그라운즈 오브 알렉산드리아 (The Grounds of Alexandria)';

UPDATE places SET 
    address = '1/325 King St, Newtown NSW 2042',
    contact_phone = '+61 2 9557 8656',
    operating_hours = '월-일 7:00-17:00',
    website_url = 'https://blackstarpastry.com.au'
WHERE name = '블랙 스타 페이스트리 (Black Star Pastry)';

UPDATE places SET 
    address = '633 Bourke St, Surry Hills NSW 2010',
    contact_phone = '+61 2 9699 1011',
    operating_hours = '월-일 7:00-18:00',
    website_url = 'https://bourkestreetbakery.com.au'
WHERE name = '버크 스트리트 베이커리 (Bourke Street Bakery)';

UPDATE places SET 
    address = '389 Crown St, Surry Hills NSW 2010',
    contact_phone = '+61 2 8354 1223',
    operating_hours = '월-일 11:00-23:00',
    website_url = 'https://gelatomessina.com'
WHERE name = '젤라또 메시나 (Gelato Messina)';

UPDATE places SET 
    address = '181 Enmore Rd, Enmore NSW 2042',
    contact_phone = '+61 2 9550 4255',
    operating_hours = '월-일 12:00-22:00',
    website_url = 'https://cowandthemoon.com.au'
WHERE name = '카우 앤 더 문 (Cow & The Moon)';

-- 멜버른 맛집들 (seed_places_melbourne.sql에서 주소 추출)
UPDATE places SET 
    address = '125 Flinders Ln, Melbourne VIC 3000',
    contact_phone = '+61 3 8663 2000',
    operating_hours = '월-일 11:30-23:00',
    website_url = 'https://chinchinrestaurant.com.au'
WHERE name = '친 친 (Chin Chin)';

UPDATE places SET 
    address = '168 Russell St, Melbourne VIC 3000',
    contact_phone = '+61 3 9663 6342',
    operating_hours = '월-일 11:30-22:00',
    website_url = 'https://gensuke.com.au'
WHERE name = '하카타 겐스케 (Hakata Gensuke Ramen)';

UPDATE places SET 
    address = '342 Little Bourke St, Melbourne VIC 3000',
    contact_phone = '+61 3 9663 8555',
    operating_hours = '월-일 11:00-21:00',
    website_url = 'https://shanghaistreet.com.au'
WHERE name = '상하이 스트리트 (Shanghai Street Dumpling)';

UPDATE places SET 
    address = '241 Swanston St, Melbourne VIC 3000',
    contact_phone = '+61 3 9663 3288',
    operating_hours = '월-일 9:00-23:00',
    website_url = NULL
WHERE name = '메콩 베트남 (Mekong Vietnam)';

UPDATE places SET 
    address = '6-12 Pin Oak Cres, Flemington VIC 3031',
    contact_phone = '+61 3 9376 2733',
    operating_hours = '월-일 11:00-22:00',
    website_url = 'https://laksaking.com.au'
WHERE name = '락사 킹 (Laksa King)';

UPDATE places SET 
    address = '435 Elizabeth St, Melbourne VIC 3000',
    contact_phone = '+61 3 9663 2888',
    operating_hours = '월-일 11:00-22:00',
    website_url = NULL
WHERE name = '로즈 가든 BBQ (Rose Garden BBQ)';

UPDATE places SET 
    address = '38 Royal Ln, Melbourne VIC 3000',
    contact_phone = '+61 3 9650 5555',
    operating_hours = '월-일 11:00-22:00',
    website_url = NULL
WHERE name = '소이 38 (Soi 38)';

UPDATE places SET 
    address = 'Basement/353 Little Collins St, Melbourne VIC 3000',
    contact_phone = '+61 3 9663 8888',
    operating_hours = '월-일 11:00-22:00',
    website_url = NULL
WHERE name = '두디 파이당 (Dodee Paidang)';

UPDATE places SET 
    address = '213 Russell St, Melbourne VIC 3000',
    contact_phone = '+61 3 9663 8888',
    operating_hours = '월-일 11:30-22:30',
    website_url = 'https://dragonhotpot.com.au'
WHERE name = '드래곤 핫팟 (Dragon Hot Pot)';

UPDATE places SET 
    address = '177/183 Lonsdale St, Melbourne VIC 3000',
    contact_phone = '+61 3 9663 3316',
    operating_hours = '24시간',
    website_url = 'https://stalactites.com.au'
WHERE name = '스탈락티테스 (Stalactites)';

UPDATE places SET 
    address = '470 Collins St, Melbourne VIC 3000',
    contact_phone = '+61 3 9600 1888',
    operating_hours = '월-일 11:30-22:00',
    website_url = 'https://royalstacks.com.au'
WHERE name = '로얄 스택스 (Royal Stacks)';

UPDATE places SET 
    address = '10 Bourke St, Melbourne VIC 3000',
    contact_phone = '+61 3 9663 8888',
    operating_hours = '24시간',
    website_url = 'https://butchersdiner.com.au'
WHERE name = '부처스 다이너 (Butcher''s Diner)';

UPDATE places SET 
    address = '141 Lygon St, Carlton VIC 3053',
    contact_phone = '+61 3 9347 4393',
    operating_hours = '월-일 12:00-23:00',
    website_url = 'https://universalrestaurant.com.au'
WHERE name = '유니버셜 레스토랑 (Universal Restaurant)';

UPDATE places SET 
    address = '3/48 Easey St, Collingwood VIC 3066',
    contact_phone = '+61 3 9417 3277',
    operating_hours = '월-일 12:00-22:00',
    website_url = 'https://easeys.com.au'
WHERE name = '이지스 (Easey''s)';

UPDATE places SET 
    address = '119 Rose St, Fitzroy VIC 3065',
    contact_phone = '+61 3 9419 2323',
    operating_hours = '화-일 7:30-15:00 (월요일 휴무)',
    website_url = 'https://lunecroissanterie.com'
WHERE name = '룬 크로아상 (Lune Croissanterie)';

UPDATE places SET 
    address = '650 Little Bourke St, Melbourne VIC 3000',
    contact_phone = '+61 3 8899 6219',
    operating_hours = '월-일 7:00-16:00',
    website_url = 'https://higherground.com.au'
WHERE name = '하이어 그라운드 (Higher Ground)';

UPDATE places SET 
    address = '10 Katherine Pl, Melbourne VIC 3000',
    contact_phone = '+61 3 9078 5992',
    operating_hours = '월-일 7:00-15:00',
    website_url = 'https://hardwaresociete.com.au'
WHERE name = '더 하드웨어 소사이어티 (The Hardware Société)';

UPDATE places SET 
    address = '359 Little Bourke St, Melbourne VIC 3000',
    contact_phone = '+61 3 9605 4900',
    operating_hours = '월-금 7:00-17:00 / 토일 8:00-17:00',
    website_url = 'https://brotherbababudan.com.au'
WHERE name = '브라더 바바 부단 (Brother Baba Budan)';

UPDATE places SET 
    address = 'Rear of 493-495 Little Bourke St, Melbourne VIC 3000',
    contact_phone = '+61 3 9326 0000',
    operating_hours = '월-금 7:00-16:00 (토일 휴무)',
    website_url = 'https://patriciacoffee.com.au'
WHERE name = '패트리샤 커피 브루어스 (Patricia Coffee Brewers)';

UPDATE places SET 
    address = '380 Lygon St, Carlton VIC 3053',
    contact_phone = '+61 3 9347 2801',
    operating_hours = '월-일 7:00-23:00',
    website_url = 'https://brunetti.com.au'
WHERE name = '브루네티 클래시코 (Brunetti Classico)';
