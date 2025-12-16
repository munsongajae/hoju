-- Insert missing Sydney Play places (10)
INSERT INTO places (name, category, rating, is_kid_friendly, notes, google_map_url) VALUES
('달링 쿼터 놀이터', 'play', 5, true, '시드니 최고의 무료 놀이터! 스플래시 패드, 미끄럼틀, 플라잉 폭스 등. 달링하버 위치.', 'https://maps.google.com/?q=Darling+Quarter+Playground'),
('루나 파크 시드니', 'play', 5, true, '하버 브리지 아래 복고풍 놀이공원. 어린이용 놀이기구 풍부. 입장 무료(기구별 결제).', 'https://maps.google.com/?q=Luna+Park+Sydney'),
('레이징 워터스 시드니', 'play', 5, true, '시드니 최대 워터파크! 40개 이상 슬라이드, 유수풀, 파도풀. 여름 필수!', 'https://maps.google.com/?q=Raging+Waters+Sydney'),
('이안 포터 어린이 와일드플레이 정원', 'play', 5, true, '센테니얼 파크 내 자연 놀이터. 무료 입장. 나무 위 놀이대, 물놀이 등.', 'https://maps.google.com/?q=Ian+Potter+Children+WILD+PLAY+Garden'),
('텀바롱 공원 워터 플레이', 'play', 4, true, '달링하버 무료 물놀이 공간. 더운 날 아이들 시원하게 놀기 좋음.', 'https://maps.google.com/?q=Tumbalong+Park+Sydney'),
('키즈데이 (Kidsday)', 'play', 4, true, '한국인 운영 키즈카페. 깔끔하고 음식 맛있음. Meadowbank 위치. 양말 필수!', 'https://maps.google.com/?q=Kidsday+Meadowbank'),
('바이탈랜즈 키즈카페', 'play', 4, true, '시드니 여러 지점. 기차놀이, 페이스페인팅, 댄스 수업 등. 부모 휴식 가능.', 'https://maps.google.com/?q=Vitalands+Kids+Cafe+Sydney'),
('iFLY 다운언더 실내 스카이다이빙', 'play', 5, true, '어린이도 가능한 실내 스카이다이빙 체험! 웨스트 시드니 위치. 잊지 못할 경험.', 'https://maps.google.com/?q=iFLY+Downunder+Sydney'),
('트리탑 어드벤처 파크', 'play', 4, true, '나무 위 짚라인, 로프 코스 체험. 초등학생용 주니어 코스 있음. 자연 속 모험!', 'https://maps.google.com/?q=TreeTops+Adventure+Park+Sydney'),
('시드니 올림픽 파크 펀캐스터', 'play', 4, true, '올림픽 파크 내 대형 바운스, 어린이 놀이시설. 방학 시즌 특별 이벤트.', 'https://maps.google.com/?q=Sydney+Olympic+Park');

-- Insert missing Sydney Museums (6)
INSERT INTO places (name, category, rating, is_kid_friendly, notes, google_map_url) VALUES
('🏛️ 호주 국립 해양 박물관', 'museum', 5, true, '달링하버 위치. 실제 잠수함, 구축함 탑승 체험 가능. 어린이 프로그램 풍성.', 'https://maps.google.com/?q=Australian+National+Maritime+Museum'),
('🏛️ 호주 박물관 (Australian Museum)', 'museum', 5, true, '호주 최초의 박물관. 공룡, 동물, 원주민 문화 전시. 어린이 전용 공간(Burra) 있음.', 'https://maps.google.com/?q=Australian+Museum'),
('🏛️ 파워하우스 뮤지엄', 'museum', 5, true, '과학, 디자인, 기술 박물관. 증기기관차, 우주선 전시 등 아이들 호기심 자극.', 'https://maps.google.com/?q=Powerhouse+Museum'),
('🏛️ NSW 미술관', 'museum', 4, false, '호주 및 세계적인 미술 작품 전시. 무료 입장(특별전 제외). 왕립 식물원 옆.', 'https://maps.google.com/?q=Art+Gallery+of+New+South+Wales'),
('🏛️ 시드니 현대미술관 (MCA)', 'museum', 4, false, '서큘러 키 위치. 현대적인 예술 작품 전시. 옥상 카페 전망 좋음.', 'https://maps.google.com/?q=Museum+of+Contemporary+Art+Australia'),
('🏛️ 시드니 천문대', 'museum', 5, true, '별 관측 투어 가능(예약 필수). 하버 브리지 뷰 명소. 잔디밭 피크닉 추천.', 'https://maps.google.com/?q=Sydney+Observatory');

-- Insert missing Sydney Museums More (10)
INSERT INTO places (name, category, rating, is_kid_friendly, notes, google_map_url) VALUES
('시드니 유대인 박물관', 'museum', 4, false, '나치 대학살 생존자들의 목소리를 담은 역사 박물관.', 'https://maps.google.com/?q=Sydney+Jewish+Museum'),
('화이트 래빗 갤러리', 'museum', 4, false, '현대 중국 예술 전문 갤러리. 4개월마다 전시 교체. 찻집 있음.', 'https://maps.google.com/?q=White+Rabbit+Gallery'),
('마담 투소 시드니', 'museum', 3, true, '달링하버 위치. 유명 인사 밀랍 인형 전시. 사진 찍기 좋음.', 'https://maps.google.com/?q=Madame+Tussauds+Sydney'),
('시드니 트램웨이 박물관', 'museum', 4, true, '옛날 트램 탑승 체험 가능. 로프터스(Loftus) 위치. 주말 운영.', 'https://maps.google.com/?q=Sydney+Tramway+Museum'),
('S.H. Ervin 갤러리', 'museum', 3, false, '유서 깊은 건물 내 호주 미술 전시. 내셔널 트러스트 운영.', 'https://maps.google.com/?q=S.H.+Ervin+Gallery'),
('시드니 생활 박물관', 'museum', 4, false, '식민지 시대 저택. 호주 문화유산.', 'https://maps.google.com/?q=Museums+of+History+NSW'),
('하이드파크 배럭스 박물관', 'museum', 4, true, '유네스코 세계유산. 죄수들의 삶과 이민 역사를 체험.', 'https://maps.google.com/?q=Hyde+Park+Barracks'),
('저스티스 앤 폴리스 뮤지엄', 'museum', 3, false, '옛 경찰서와 법정 건물. 범죄와 처벌의 역사 전시.', 'https://maps.google.com/?q=Justice+and+Police+Museum'),
('수잔 길모어 갤러리', 'museum', 3, false, '패딩턴 위치. 현대 미술 갤러리.', 'https://maps.google.com/?q=Roslyn+Oxley9+Gallery'),
('록스 디스커버리 뮤지엄', 'museum', 4, true, '더 록스의 역사를 배울 수 있는 가족 친화적 박물관. 무료.', 'https://maps.google.com/?q=The+Rocks+Discovery+Museum');

-- Insert missing Sydney Tour (10)
INSERT INTO places (name, category, rating, is_kid_friendly, notes, google_map_url) VALUES
('맨리 비치', 'tour', 5, true, '서큘러 키에서 페리 타고 30분. 서핑과 여유로운 분위기. 코르소 거리 상점가.', 'https://maps.google.com/?q=Manly+Beach'),
('본다이-쿠지 해안 산책로', 'tour', 5, false, '해안 절경을 따라 걷는 6km 코스. 가을에 열리는 ''바다 조각전'' 유명.', 'https://maps.google.com/?q=Bondi+to+Coogee+Walk'),
('페더데일 와일드라이프 파크', 'tour', 4, true, '직접 동물들에게 먹이를 줄 수 있는 동물원. 블루마운틴 가는 길에 들르기 좋음.', 'https://maps.google.com/?q=Featherdale+Sydney+Wildlife+Park'),
('왓슨스 베이', 'tour', 4, true, '갭 파크(The Gap) 절벽 뷰. 피시 앤 칩스 맛집(도일스) 유명. 페리 접근성 좋음.', 'https://maps.google.com/?q=Watsons+Bay'),
('퀸 빅토리아 빌딩 (QVB)', 'tour', 4, false, '세상에서 가장 아름다운 쇼핑몰. 로마네스크 양식 건축미. 티룸 추천.', 'https://maps.google.com/?q=Queen+Victoria+Building'),
('웬디스 시크릿 가든', 'tour', 4, true, '하버 브리지 뷰가 숨겨진 비밀 정원. 조용하고 평화로운 분위기.', 'https://maps.google.com/?q=Wendy+Whiteleys+Secret+Garden'),
('전망대 언덕 (Observatory Hill)', 'tour', 5, true, '하버 브리지 뷰 최고 명소. 일몰 감상 및 피크닉 추천.', 'https://maps.google.com/?q=Observatory+Hill+Park'),
('커스텀스 하우스', 'tour', 3, true, '서큘러 키 위치. 바닥에 있는 시드니 모형 지도 아이들이 좋아함. 도서관 있음.', 'https://maps.google.com/?q=Customs+House'),
('패딩턴 저수지 정원', 'tour', 4, false, '옛 저수지를 개조한 로마 스타일 정원. 사진 찍기 좋은 핫플레이스.', 'https://maps.google.com/?q=Paddington+Reservoir+Gardens'),
('서큘러 키', 'tour', 5, true, '시드니 교통의 중심이자 관광 허브. 오페라하우스와 하버브리지 사이.', 'https://maps.google.com/?q=Circular+Quay');
