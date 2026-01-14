-- Add missing places for Sydney Trip (Trip ID: xkssxcrcndghqysjjbql) with detailed info

INSERT INTO places (
    trip_id, city, name, category, address, 
    contact_phone, website_url, operating_hours, 
    lat, lng, notes
) VALUES
    -- 1.1 최초의 함대 공원
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '최초의 함대 공원 (First Fleet Park)', 'play', 
    'George Street, The Rocks NSW 2000, Australia', '+61 2 9240 8500', 
    'https://www.therocks.com/venues/first-fleet-park', '24시간 개방 (연중무휴)', 
    -33.8602, 151.2091, 
    '1788년 제1함대가 상륙한 역사적 해안선 인접. 서큘러 키와 록스를 잇는 깔또기 역할 수행. 오페라 하우스와 하버 브리지 조망 가능.'),

    -- 1.2 록스
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '록스 (The Rocks)', 'tour', 
    'The Rocks, Sydney NSW 2000, Australia', '+61 2 9240 8500', 
    'https://www.therocks.com/', '24시간 개방 (상점/시설별 상이)', 
    -33.85985, 151.20901, 
    '시드니 도시 보존 운동(Green Bans)의 상징적 장소. 호크스베리 사암 지반 위 형성. 과거 슬럼가에서 현재 문화 지구로 변모.'),

    -- 1.3 록스 디스커버리 박물관
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '록스 디스커버리 박물관 (The Rocks Discovery Museum)', 'museum', 
    '2-8 Kendall Ln, The Rocks NSW 2000, Australia', '+61 2 9240 8680', 
    'https://rocksdiscoverymuseum.com', '매일 10:00 AM - 5:00 PM', 
    -33.85985, 151.20901, 
    '1850년대 사암 창고 복원. 4가지 시대(와라니, 식민지, 항구, 변화) 주제 전시. 고고학적 발굴 성과 공개 및 무료입장.'),

    -- 1.4 오스트레일리안 헤리티지 호텔
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '오스트레일리안 헤리티지 호텔 (Australian Heritage Hotel)', 'food', 
    '100 Cumberland St, The Rocks NSW 2000, Australia', '+61 2 9247 2229', 
    'https://australianheritagehotel.com', '매일 11:00 AM - Late', 
    -33.8597, 151.2070, 
    '1914-1915년 건설된 에드워드 양식 건축물. NSW 주 유산 등재. 캥거루/에뮤 피자 등 호주 미식 문화 아이콘.'),

    -- 1.5 수에즈 운하
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '수에즈 운하 (Suez Canal)', 'tour', 
    'Between George St and Harrington St, The Rocks NSW 2000', NULL, 
    'https://rocksdiscoverymuseum.com/place/suez-canal', '24시간 개방', 
    -33.85985, 151.20901, 
    '1840년대 조성된 좁은 골목. 과거 갱단(The Rocks Push)의 거점이자 범죄 구역. 도시의 어두운 이면을 보여주는 공간.'),

    -- 1.6 캠벨스 코브
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '캠벨스 코브 (Campbells Cove)', 'tour', 
    '7-27 Circular Quay West, The Rocks NSW 2000, Australia', '+61 2 9240 8500', 
    'https://www.therocks.com/venues/campbells-cove', '24시간 개방', 
    -33.8570, 151.2092, 
    '호주 최초의 사유 부두 및 사암 창고군(빅토리아 조지아 양식). 최근 현대적 수변 산책로로 재개발되어 보존과 활용의 조화.'),

    -- 1.7 힉슨 로드 리저브
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '힉슨 로드 리저브 (Hickson Road Reserve)', 'play', 
    'Hickson Road, The Rocks NSW 2000, Australia', '+61 2 9240 8500', 
    'https://www.therocks.com/venues/hickson-road-reserve', '24시간 개방', 
    -33.8545, 151.2095, 
    '20세기 초 항만 공학의 산물. 하버 브리지 남쪽 파일런과 강철 아치를 가장 가까이서 조망 가능한 녹지 공간.'),

    -- 1.8 글렌모어 호텔
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '글렌모어 호텔 (The Glenmore Hotel)', 'food', 
    '96 Cumberland St, The Rocks NSW 2000, Australia', '+61 2 9247 4794', 
    'https://www.theglenmore.com.au/', '일-목 11:00 AM - 12:00 AM, 금-토 11:00 AM - 1:00 AM', 
    -33.8587, 151.2074, 
    '1921년 건설된 전쟁 간 조지아 부흥 양식. 180도 파노라마 뷰를 가진 루프탑 바가 특징으로 시드니 루프탑 문화의 상징.'),

    -- 2.1 파일런 룩아웃
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '파일런 룩아웃 (Pylon Lookout)', 'tour', 
    'Sydney Harbour Bridge, The Rocks NSW 2000, Australia', '+61 2 9240 1100', 
    'https://www.pylonlookout.com.au', '매일 10:00 AM - 6:00 PM', 
    -33.8546, 151.2095, 
    '하버 브리지 남동쪽 지지대 내부 박물관 및 전망대. 다리 건설 역사와 희생된 노동자들을 기리는 공간.'),

    -- 2.2 브리지클라임 시드니
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '브리지클라임 시드니 (BridgeClimb Sydney)', 'play', 
    '3 Cumberland St, The Rocks NSW 2000, Australia', '+61 2 8274 7777', 
    'https://www.bridgeclimb.com/', '등반 일정에 따라 상이', 
    -33.85225, 151.21076, 
    '1998년 시작된 체험형 관광. 다리 외곽 아치를 등반하며 강철 공학을 체험하고 도시 지리적 맥락 이해.'),

    -- 3.1 베넬롱 론
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '베넬롱 론 (Bennelong Lawn)', 'play', 
    'Royal Botanic Garden, Sydney NSW 2000', '+61 2 9231 8111', 
    'https://www.botanicgardens.org.au/', '식물원 개방 시간', 
    -33.8567, 151.2150, 
    '원주민 ''베넬롱''의 이름을 딴 공간. 오페라 하우스를 위에서 내려다보는 희소성 있는 조망점.'),

    -- 3.2 매쿼리 포인트
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '매쿼리 포인트 (Mrs Macquarie''s Chair)', 'tour', 
    '1d Mrs Macquaries Rd, Sydney NSW 2000', '+61 2 9231 8111', 
    'https://www.botanicgardens.org.au/', '식물원/도메인 개방 시간', 
    -33.8595, 151.2222, 
    '1810년 죄수들이 만든 사암 벤치. 오페라 하우스와 하버 브리지가 겹쳐 보이는 ''픽처레스크'' 풍경의 대표적 장소.'),

    -- 3.3 구 시드니 조폐국
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '구 시드니 조폐국 (The Sydney Mint)', 'museum', 
    '10 Macquarie St, Sydney NSW 2000', '+61 2 8239 2288', 
    'https://mhnsw.au/visit-us/the-mint/', '월-금 9:00 AM - 4:00 PM', 
    -33.8689, 151.2124, 
    'CBD 최고(最古) 공공 건물 중 하나. ''럼 병원''에서 골드러시 이후 조폐국으로 전환된 역사적 건물.'),

    -- 3.4 뉴사우스웨일스 주립 도서관
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '뉴사우스웨일스 주립 도서관 (State Library of NSW)', 'museum', 
    'Corner of Macquarie St and Shakespeare Place, Sydney NSW 2000', '+61 2 9273 1414', 
    'https://www.sl.nsw.gov.au/', '일반적으로 9am/10am - 5pm/8pm', 
    -33.8665, 151.2132, 
    '호주 최초 도서관(1826년). 미첼 도서관의 타즈만 지도 모자이크 등 유럽인의 호주 탐험사와 원주민 기록 소장.'),

    -- 4.1 포트 데니슨
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '포트 데니슨 (Fort Denison)', 'tour', 
    'Sydney Harbour, near Botanic Gardens', '1300 072 757', 
    'https://www.nationalparks.nsw.gov.au/', '폐쇄 중 (2026년 중반 재개장 예정)', 
    -33.8550, 151.2258, 
    '과거 죄수 감옥(''Pinchgut'')에서 크림 전쟁 당시 요새로 변모. 호주 유일의 마텔로 타워 보유.'),

    -- 4.2 노스헤드
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '노스헤드 (North Head)', 'tour', 
    'North Head Scenic Drive, Manly NSW 2095', '+61 2 9960 6266', 
    'https://www.harbourtrust.gov.au/', '차량 게이트 6am-8pm', 
    -33.8150, 151.3003, 
    '시드니 항의 관문. 2차 대전 포병 기지 유적과 멸종 위기종 서식지(긴코반디쿠트)가 공존하는 생태/군사 유산.'),

    -- 5.1 마틴 플레이스
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '마틴 플레이스 (Martin Place)', 'tour', 
    'Martin Place, Sydney NSW 2000', NULL, 
    'https://www.cityofsydney.nsw.gov.au/', '24시간 개방', 
    -33.8678, 151.2103, 
    '시드니의 ''시민의 심장''. 금융 기관 밀집 및 안작 데이 추모의 중심지. 영화 매트릭스 촬영지.'),

    -- 5.2 스트랜드 아케이드
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '스트랜드 아케이드 (The Strand Arcade)', 'shop', 
    '195-197 Pitt St, Sydney NSW 2000', '+61 2 9265 6800', 
    'https://www.strandarcade.com.au/', '상점별 상이 (보통 9am - 5:30pm)', 
    -33.8694, 151.2076, 
    '1892년 개장, 시드니 유일의 빅토리아 시대 스타일 쇼핑 아케이드. 화재 후 원형 복원되어 장인 정신과 우아함 대변.'),

    -- 5.3 헤이마켓
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '헤이마켓 (Haymarket)', 'market', 
    'Haymarket NSW 2000', NULL, 
    'https://www.sydney.com/', '상점별 상이', 
    -33.8808, 151.2028, 
    '과거 건초 시장에서 현재 차이나타운 중심지로 발전. 패루와 풍수지리 조형물 등 아시아 문화의 깊은 정착을 보여줌.'),

    -- 6.1 피어몬트 브리지
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '피어몬트 브리지 (Pyrmont Bridge)', 'tour', 
    'Pyrmont Bridge, Darling Harbour NSW 2000', NULL, 
    'https://www.darlingharbour.com/', '24시간 개방 (스윙 타임 별도)', 
    -33.8706, 151.2006, 
    '1902년 개통된 세계 최고(最古) 전동 스윙 브리지 중 하나. 현재 보행자 전용으로 전환되어 산업 유산 활용 사례.'),

    -- 6.2 프로미나드
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '프로미나드 (The Promenade)', 'tour', 
    'Darling Harbour, Sydney NSW 2000', NULL, 
    'https://www.darlingharbour.com/', '24시간 개방', 
    -33.8723, 151.2005, 
    '코클 베이를 둘러싼 수변 산책로. 박물관, 공원, 레스토랑을 유기적으로 연결하며 도시와 물의 경계를 허무는 공간.'),

    -- 6.3 치펜데일
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '치펜데일 (Chippendale)', 'tour', 
    'Chippendale NSW 2008', NULL, 
    NULL, '시설별 상이', 
    -33.8863, 151.1999, 
    '구 양조장 공장 지대에서 ''원 센트럴 파크'' 등 친환경 건축과 예술(화이트 래빗 갤러리) 중심지로 재생된 힙한 동네.'),

    -- 7.1 울루물루
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '울루물루 (Woolloomooloo)', 'tour', 
    'Woolloomooloo NSW 2011', NULL, 
    NULL, '시설별 상이', 
    -33.8704, 151.2223, 
    '해군 기지, 공공 주택, 초호화 주거지가 공존. 핑거 워프(역사적 목재 부두)와 해리스 카페 드 휠(파이 카트)이 유명.'),

    -- 7.2 서리 힐스
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '서리 힐스 (Surry Hills)', 'tour', 
    'Surry Hills NSW 2010', NULL, 
    NULL, '시설별 상이', 
    -33.8838, 151.2098, 
    '구 의류 산업 중심지에서 젠트리피케이션을 통해 트렌디한 카페/패션 거리로 변모. 테라스 하우스 보존.'),

    -- 7.3 킹스 크로스 & 달링허스트
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '킹스 크로스 & 달링허스트 (Kings Cross & Darlinghurst)', 'tour', 
    'Kings Cross & Darlinghurst, NSW', NULL, 
    NULL, '시설별 상이', 
    -33.8753, 151.2220, 
    '유흥과 보헤미안 문화, LGBTQ+ 커뮤니티의 성지. 마디그라 퍼레이드의 중심지이자 역사적 감옥 등이 공존.'),

    -- 8.1 밀슨스 포인트
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '밀슨스 포인트 (Milsons Point)', 'tour', 
    'Milsons Point NSW 2061', NULL, 
    NULL, '시설별 상이', 
    -33.8477, 151.2120, 
    '하버 브리지 북단 교통 요지. 루나 파크(아르데코 스타일)와 브래드필드 공원이 있어 최고의 야경 명소.'),

    -- 8.2 키리빌리
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '시드니', '키리빌리 (Kirribilli)', 'tour', 
    'Kirribilli NSW 2061', NULL, 
    NULL, '시설별 상이', 
    -33.8505, 151.2148, 
    '호주 총리 및 총독 관저가 위치한 정치적 상징 장소. 자카란다 터널로 유명한 부촌.')
;
