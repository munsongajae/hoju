
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // Read .env.local
        const envPath = path.join(__dirname, '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error('.env.local not found');
            process.exit(1);
        }

        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim(); // Handle values with =
                env[key] = val;
            }
        });

        const url = env['NEXT_PUBLIC_SUPABASE_URL'];
        const key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

        if (!url || !key) {
            console.error('Missing credentials in .env.local');
            console.log('URL:', url ? 'Found' : 'Missing');
            console.log('Key:', key ? 'Found' : 'Missing');
            process.exit(1);
        }

        console.log('Connecting to Supabase at:', url);
        const supabase = createClient(url, key);

        const MARKETS = [
            // --- SYDNEY ---
            {
                name: "더 록스 마켓 (The Rocks Markets)",
                city: "시드니",
                category: "market",
                rating: 4.5,
                is_kid_friendly: true,
                notes: "주말(토/일)에만 열리는 유서 깊은 마켓. 수공예품과 길거리 음식이 많음. 하버브릿지 근처.",
                google_map_url: "https://maps.app.goo.gl/RocksMarkets"
            },
            {
                name: "패디스 마켓 헤이마켓 (Paddy's Market Haymarket)",
                city: "시드니",
                category: "market",
                rating: 4.0,
                is_kid_friendly: true,
                notes: "기념품 사기에 최적. 가격이 저렴함. 차이나타운 옆. 수-일 운영.",
                google_map_url: "https://maps.app.goo.gl/PaddysMarket"
            },
            {
                name: "시드니 피쉬 마켓 (Sydney Fish Market)",
                city: "시드니",
                category: "market",
                rating: 4.2,
                is_kid_friendly: true,
                notes: "남반구 최대 어시장. 신선한 해산물(굴, 사시미) 즉석 섭취 가능. 점심 시간에 붐빔.",
                google_map_url: "https://maps.app.goo.gl/FishMarket"
            },
            {
                name: "글리브 마켓 (Glebe Markets)",
                city: "시드니",
                category: "market",
                rating: 4.3,
                is_kid_friendly: false,
                notes: "토요일 운영. 빈티지 옷, 힙한 분위기. 젊은 층에게 인기 많음.",
                google_map_url: "https://maps.app.goo.gl/GlebeMarkets"
            },
            {
                name: "패딩턴 마켓 (Paddington Markets)",
                city: "시드니",
                category: "market",
                rating: 4.1,
                is_kid_friendly: false,
                notes: "토요일 운영. 로컬 디자이너 의류와 공예품 중심. 옥스포드 스트리트 근처.",
                google_map_url: "https://maps.app.goo.gl/PaddingtonMarkets"
            },
            {
                name: "키리빌리 마켓 (Kirribilli Markets)",
                city: "시드니",
                category: "market",
                rating: 4.4,
                is_kid_friendly: true,
                notes: "매월 4번째 토요일(Art & Design), 2번째 일요일(General). 하버뷰가 보이는 마켓.",
                google_map_url: "https://maps.app.goo.gl/KirribilliMarkets"
            },
            {
                name: "본다이 마켓 (Bondi Markets)",
                city: "시드니",
                category: "market",
                rating: 4.2,
                is_kid_friendly: false,
                notes: "일요일 운영. 본다이 비치 옆 학교에서 열림. 의류, 악세사리 위주.",
                google_map_url: "https://maps.app.goo.gl/BondiMarkets"
            },
            {
                name: "로젤 컬렉터스 마켓 (Rozelle Collectors Market)",
                city: "시드니",
                category: "market",
                rating: 4.0,
                is_kid_friendly: false,
                notes: "토/일 운영. 앤틱, 중고 음반, 빈티지 가구 찾기 좋은 벼룩시장.",
                google_map_url: "https://maps.app.goo.gl/RozelleMarkets"
            },
            {
                name: "매릭빌 오가닉 푸드 마켓 (Marrickville Organic Food Market)",
                city: "시드니",
                category: "market",
                rating: 4.5,
                is_kid_friendly: true,
                notes: "일요일 운영. 유기농 농산물, 맛있는 먹거리, 포니 라이딩 등 가족 친화적.",
                google_map_url: "https://maps.app.goo.gl/MarrickvilleMarket"
            },
            {
                name: "캐리지워크 파머스 마켓 (Carriageworks Farmers Market)",
                city: "시드니",
                category: "market",
                rating: 4.6,
                is_kid_friendly: true,
                notes: "토요일 오전 운영. 퀄리티 높은 식재료와 빵, 커피. 현지인들이 사랑하는 파머스 마켓.",
                google_map_url: "https://maps.app.goo.gl/Carriageworks"
            },
            // --- MELBOURNE ---
            {
                name: "퀸 빅토리아 마켓 (Queen Victoria Market)",
                city: "멜버른",
                category: "market",
                rating: 4.7,
                is_kid_friendly: true,
                notes: "멜버른 최대, 남반구 최대 규모 재래시장. 없는 게 없음. 월/수 휴무(확인 필요). 도넛 트럭 필수.",
                google_map_url: "https://maps.app.goo.gl/QVM"
            },
            {
                name: "사우스 멜버른 마켓 (South Melbourne Market)",
                city: "멜버른",
                category: "market",
                rating: 4.6,
                is_kid_friendly: true,
                notes: "미식가의 천국. 굴, 빠에야, 크루아상(Agathe) 유명. 수/금/토/일 운영.",
                google_map_url: "https://maps.app.goo.gl/SouthMelbMarket"
            },
            {
                name: "프라란 마켓 (Prahran Market)",
                city: "멜버른",
                category: "market",
                rating: 4.4,
                is_kid_friendly: true,
                notes: "고급 식재료 위주. '푸드 러버의 마켓'. 델리와 치즈가 훌륭함.",
                google_map_url: "https://maps.app.goo.gl/PrahranMarket"
            },
            {
                name: "로즈 스트리트 아티스트 마켓 (Rose St. Artists' Market)",
                city: "멜버른",
                category: "market",
                rating: 4.2,
                is_kid_friendly: false,
                notes: "피츠로이 위치. 주말 운영. 핸드메이드 예술품, 디자인 굿즈 중심.",
                google_map_url: "https://maps.app.goo.gl/RoseStMarket"
            },
            {
                name: "캠버웰 선데이 마켓 (Camberwell Sunday Market)",
                city: "멜버른",
                category: "market",
                rating: 4.3,
                is_kid_friendly: false,
                notes: "일요일 오전. 유명한 벼룩시장(Trash & Treasure). 빈티지 옷, 중고 물품.",
                google_map_url: "https://maps.app.goo.gl/CamberwellMarket"
            },
            {
                name: "피츠로이 밀스 마켓 (Fitzroy Mills Market)",
                city: "멜버른",
                category: "market",
                rating: 4.1,
                is_kid_friendly: true,
                notes: "토요일 운영. 로컬 농산물과 건강식품. 작지만 알찬 커뮤니티 마켓.",
                google_map_url: "https://maps.app.goo.gl/FitzroyMills"
            },
            {
                name: "세인트 킬다 에스플러네이드 마켓 (St Kilda Esplanade Market)",
                city: "멜버른",
                category: "market",
                rating: 4.3,
                is_kid_friendly: true,
                notes: "일요일 운영. 세인트 킬다 해변을 따라 열리는 예술/공예 시장. 산책하기 좋음.",
                google_map_url: "https://maps.app.goo.gl/StKildaMarket"
            },
            {
                name: "단데농 마켓 (Dandenong Market)",
                city: "멜버른",
                category: "market",
                rating: 4.2,
                is_kid_friendly: true,
                notes: "다문화 마켓. 다양한 국가의 길거리 음식과 향신료. 가성비 좋음.",
                google_map_url: "https://maps.app.goo.gl/DandenongMarket"
            },
            {
                name: "칼튼 파머스 마켓 (Carlton Farmers Market)",
                city: "멜버른",
                category: "market",
                rating: 4.4,
                is_kid_friendly: true,
                notes: "토요일 오전. 생산자 직거래. 신선한 로컬 푸드.",
                google_map_url: "https://maps.app.goo.gl/CarltonMarket"
            },
            {
                name: "디스트릭트 도크랜드 마켓 (The District Docklands Market)",
                city: "멜버른",
                category: "market",
                rating: 4.0,
                is_kid_friendly: true,
                notes: "도크랜드 쇼핑몰 구역 내 마켓. 쾌적하고 현대적. 대관람차 근처.",
                google_map_url: "https://maps.app.goo.gl/DocklandsMarket"
            }
        ];

        console.log('Clearing existing market data to avoid duplicates...');
        const { error: deleteError } = await supabase
            .from('places')
            .delete()
            .eq('category', 'market');

        if (deleteError) {
            console.error('Error clearing old markets:', deleteError);
            return;
        }

        console.log(`Inserting ${MARKETS.length} markets...`);
        const { data, error } = await supabase
            .from('places')
            .insert(MARKETS); // Insert only

        if (error) {
            console.error('Error inserting data:', JSON.stringify(error, null, 2));
        } else {
            console.log('Successfully inserted data!');
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

main();
