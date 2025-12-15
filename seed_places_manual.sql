-- Insert Places for Sydney (Restaurants & Cafes)
-- Note: 'address' is appended to 'notes' as there is no address column.
-- Category mapped to 'food' for all items.

INSERT INTO places (name, city, category, rating, is_kid_friendly, notes, google_map_url) VALUES
-- 🌏 Asian Road
('챗 타이 (Chat Thai)', '시드니', 'food', 4.5, true, '시드니 타이 음식의 표준. 팟타이, 솜땀 등 기본 메뉴가 훌륭하며 밤늦게까지 붐빕니다. [주소] 20 Campbell St, Haymarket NSW 2000', 'https://maps.google.com/?q=Chat+Thai+Haymarket'),
('마막 (Mamak)', '시드니', 'food', 4.5, true, '말레이시아 로티와 나시르막 맛집. 보는 앞에서 반죽을 돌리는 퍼포먼스가 유명합니다. [주소] 15 Goulburn St, Haymarket NSW 2000', 'https://maps.google.com/?q=Mamak+Haymarket'),
('호 지악 (Ho Jiak Haymarket)', '시드니', 'food', 4.5, false, '자극적이고 진한 말레이시아 스트리트 푸드. 차 퀘이 테오(볶음면)가 대표 메뉴입니다. [주소] 92 Hay St, Haymarket NSW 2000', 'https://maps.google.com/?q=Ho+Jiak+Haymarket'),
('홈 타이 (Home Thai)', '시드니', 'food', 4.4, true, '챗 타이의 라이벌로 불맛이 강한 볶음 요리가 특징입니다. 인더스트리얼 인테리어가 깔끔합니다. [주소] Shop 1 & 2, 299 Sussex St, Sydney NSW 2000', 'https://maps.google.com/?q=Home+Thai+Sydney'),
('차이니즈 누들 레스토랑 (Chinese Noodle Restaurant)', '시드니', 'food', 4.3, true, '포도 넝쿨 장식으로 유명한 가성비 끝판왕. 수제 만두와 엄청난 양의 수타면을 팝니다. [주소] Shop 7, Prince Centre, 8 Quay St, Haymarket NSW 2000', 'https://maps.google.com/?q=Chinese+Noodle+Restaurant+Haymarket'),
('검샤라 (Gumshara)', '시드니', 'food', 4.6, false, '숟가락이 설 정도로 걸쭉한 초고농축 돈코츠 라멘. 라멘 매니아들의 성지입니다. [주소] Shop 211/25-29 Dixon St, Haymarket NSW 2000', 'https://maps.google.com/?q=Gumshara+Ramen'),
('매릭빌 포크 롤 (Marrickville Pork Roll)', '시드니', 'food', 4.7, true, '줄 서서 먹는 인생 반미 맛집. 바삭한 바게트와 푸짐한 속재료가 일품입니다. [주소] 236A Illawarra Rd, Marrickville NSW 2204', 'https://maps.google.com/?q=Marrickville+Pork+Roll'),
('엘 자나 (El Jannah)', '시드니', 'food', 4.5, true, '레바논식 숯불 치킨과 마약 갈릭 소스. 그랜빌 본점의 맛이 가장 유명합니다. [주소] 4-8 South St, Granville NSW 2142', 'https://maps.google.com/?q=El+Jannah+Granville'),
('도사 헛 (Dosa Hut)', '시드니', 'food', 4.4, true, '거대한 인도식 크레페 "도사" 전문점. 구글 리뷰 수가 14,000개가 넘는 시드니 서부의 랜드마크입니다. [주소] 69 Wigram St, Harris Park NSW 2150', 'https://maps.google.com/?q=Dosa+Hut+Harris+Park'),
('두 디 파이당 (Do Dee Paidang)', '시드니', 'food', 4.3, false, '매운맛 단계 조절이 가능한 태국 똠얌 국수 맛집. 한국인의 입맛에 잘 맞습니다. [주소] 9/37 Ultimo Rd, Haymarket NSW 2000', 'https://maps.google.com/?q=Do+Dee+Paidang+Haymarket'),

-- 🍔 Burger & Western
('바 루카 (Bar Luca)', '시드니', 'food', 4.6, false, '시드니 3대 버거 중 하나. 메이플 베이컨이 들어간 "Blame Canada" 버거가 시그니처입니다. [주소] 52 Phillip St, Sydney NSW 2000', 'https://maps.google.com/?q=Bar+Luca+Sydney'),
('메리스 (Mary''s)', '시드니', 'food', 4.5, false, '락 음악이 흐르는 힙한 분위기의 버거 & 치킨집. 기름진 미국 맛의 정석입니다. [주소] 6 Mary St, Newtown NSW 2042', 'https://maps.google.com/?q=Marys+Newtown'),
('팬케이크 온 더 록스 (Pancakes on the Rocks)', '시드니', 'food', 4.2, true, '24시간 영업하는 팬케이크와 폭립 맛집. 관광객 필수 코스입니다. [주소] 22 Playfair St, The Rocks NSW 2000', 'https://maps.google.com/?q=Pancakes+on+the+Rocks'),
('허리케인 그릴 (Hurricane''s Grill)', '시드니', 'food', 4.4, true, '달링하버 뷰를 보며 즐기는 거대한 폭립(Pork Ribs). 가족 외식 장소로 인기입니다. [주소] Level 2/10 Harbourside Shopping Centre, Darling Harbour NSW 2000', 'https://maps.google.com/?q=Hurricanes+Grill+Darling+Harbour'),
('해리스 카페 드 휠 (Harry''s Cafe de Wheels)', '시드니', 'food', 4.3, true, '울루물루 선착장의 명물 핫도그 트럭. 매쉬드 포테이토가 올라가는 "타이거 파이"가 유명합니다. [주소] Cowper Wharf Roadway, Woolloomooloo NSW 2011', 'https://maps.google.com/?q=Harrys+Cafe+de+Wheels'),

-- ☕ Cafe & Bakery
('더 그라운즈 오브 알렉산드리아 (The Grounds of Alexandria)', '시드니', 'food', 4.7, true, '정원 속에 있는 듯한 아름다운 카페 겸 복합 문화 공간. 브런치와 포토존으로 유명합니다. [주소] 7a/2 Huntley St, Alexandria NSW 2015', 'https://maps.google.com/?q=The+Grounds+of+Alexandria'),
('블랙 스타 페이스트리 (Black Star Pastry)', '시드니', 'food', 4.4, true, '전 세계 인스타그램을 강타한 "수박 케이크"의 원조집입니다. [주소] 1/325 King St, Newtown NSW 2042', 'https://maps.google.com/?q=Black+Star+Pastry+Newtown'),
('버크 스트리트 베이커리 (Bourke Street Bakery)', '시드니', 'food', 4.6, true, '시드니를 대표하는 베이커리. 소시지 롤과 진저 브륄레 타르트가 일품입니다. [주소] 633 Bourke St, Surry Hills NSW 2010', 'https://maps.google.com/?q=Bourke+Street+Bakery+Surry+Hills'),
('젤라또 메시나 (Gelato Messina)', '시드니', 'food', 4.8, true, '호주에서 가장 사랑받는 젤라또 브랜드. 피스타치오, 솔티드 카라멜 맛이 인기입니다. [주소] 389 Crown St, Surry Hills NSW 2010', 'https://maps.google.com/?q=Gelato+Messina+Surry+Hills'),
('카우 앤 더 문 (Cow & The Moon)', '시드니', 'food', 4.7, true, '이탈리아 젤라또 월드 투어 우승 맛집. "Almond Affogato" 맛은 꼭 드셔보세요. [주소] 181 Enmore Rd, Enmore NSW 2042', 'https://maps.google.com/?q=Cow+and+The+Moon');
