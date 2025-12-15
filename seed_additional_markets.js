
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
                const val = parts.slice(1).join('=').trim();
                env[key] = val;
            }
        });

        const url = env['NEXT_PUBLIC_SUPABASE_URL'];
        const key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

        if (!url || !key) {
            console.error('Missing credentials');
            process.exit(1);
        }

        const supabase = createClient(url, key);

        const NEW_MARKETS = [
            {
                name: "써리힐즈 마켓 (Surry Hills Markets)",
                city: "시드니",
                category: "market",
                rating: 4.1,
                is_kid_friendly: false,
                notes: "매월 첫째 주 토요일 08:00 ~ 16:00. 빈티지 명품, 가죽 제품, 재활용 패션 소품을 건지기 좋은 곳.",
                google_map_url: "https://maps.app.goo.gl/SurryHillsMarket"
            },
            {
                name: "EQ 마켓 (Cambridge Markets EQ)",
                city: "시드니",
                category: "market",
                rating: 4.3,
                is_kid_friendly: true,
                notes: "매주 수/토요일 08:00 ~ 14:00. 무어 파크에서 열림. 주차가 편리해 가족 단위 방문객 많음.",
                google_map_url: "https://maps.app.goo.gl/EQMarket"
            },
            {
                name: "차이나타운 프라이데이 나이트 마켓 (Chinatown Friday Night Market)",
                city: "시드니",
                category: "market",
                rating: 4.0,
                is_kid_friendly: true,
                notes: "매주 금요일 17:00 ~ 22:00. 딤섬, 꼬치 등 아시아 길거리 음식을 즐길 수 있는 야시장.",
                google_map_url: "https://maps.app.goo.gl/ChinatownNightMarket"
            },
            {
                name: "맨리 마켓플레이스 (Manly Marketplace)",
                city: "시드니",
                category: "market",
                rating: 4.4,
                is_kid_friendly: true,
                notes: "매주 토/일요일 09:00 ~ 17:00. 맨리 비치 근처. 휴양지 느낌이 물씬 나는 소품 판매.",
                google_map_url: "https://maps.app.goo.gl/ManlyMarketplace"
            }
        ];

        console.log(`Inserting ${NEW_MARKETS.length} new markets...`);
        const { data, error } = await supabase
            .from('places')
            .insert(NEW_MARKETS);

        if (error) {
            console.error('Error inserting data:', JSON.stringify(error, null, 2));
        } else {
            console.log('Successfully inserted new markets!');
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

main();
