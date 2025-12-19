"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bus, PartyPopper, Globe, Info, Calendar, MapPin, ArrowLeft, MessageSquare, ExternalLink, Link as LinkIcon, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTrip } from "@/contexts/TripContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

interface Country {
    code: string;
    name: string;
    flag: string;
    cities: City[];
}

interface City {
    code: string;
    name: string;
}

const COUNTRIES: Country[] = [
    {
        code: "AU",
        name: "호주",
        flag: "🇦🇺",
        cities: [
            { code: "SYD", name: "시드니" },
            { code: "MEL", name: "멜버른" },
            { code: "BNE", name: "브리즈번" },
            { code: "PER", name: "퍼스" },
            { code: "ADL", name: "아델레이드" },
        ],
    },
    {
        code: "JP",
        name: "일본",
        flag: "🇯🇵",
        cities: [
            { code: "TYO", name: "도쿄" },
            { code: "OSA", name: "오사카" },
            { code: "KYO", name: "교토" },
            { code: "FUK", name: "후쿠오카" },
            { code: "SAP", name: "삿포로" },
        ],
    },
    {
        code: "US",
        name: "미국",
        flag: "🇺🇸",
        cities: [
            { code: "NYC", name: "뉴욕" },
            { code: "LAX", name: "로스앤젤레스" },
            { code: "SFO", name: "샌프란시스코" },
            { code: "CHI", name: "시카고" },
            { code: "MIA", name: "마이애미" },
        ],
    },
    {
        code: "TH",
        name: "태국",
        flag: "🇹🇭",
        cities: [
            { code: "BKK", name: "방콕" },
            { code: "CNX", name: "치앙마이" },
            { code: "HKT", name: "푸켓" },
            { code: "PAT", name: "파타야" },
        ],
    },
    {
        code: "VN",
        name: "베트남",
        flag: "🇻🇳",
        cities: [
            { code: "HAN", name: "하노이" },
            { code: "SGN", name: "호치민" },
            { code: "DAD", name: "다낭" },
            { code: "HUI", name: "후에" },
        ],
    },
];

// 아이콘 매핑
const ICON_MAP: Record<string, any> = {
    Bus,
    PartyPopper,
    Globe,
    Info,
    Calendar,
    MessageSquare,
    LinkIcon,
};

export default function TravelInfoPage() {
    const { selectedTrip } = useTrip();
    const [selectedCountry, setSelectedCountry] = useState<string>("AU");
    const [selectedCity, setSelectedCity] = useState<string>("SYD");
    const [loading, setLoading] = useState<boolean>(false);

    const currentCountry = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];
    const currentCity = currentCountry.cities.find((c) => c.code === selectedCity) || currentCountry.cities[0];

    // 데이터베이스에서 여행 정보 로드
    const loadTravelInfoFromDB = async (countryCode: string, cityCode: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("travel_info")
                .select("*")
                .eq("country_code", countryCode)
                .eq("city_code", cityCode)
                .order("section")
                .order("item_index");

            if (error) {
                console.error("Error loading travel info:", error);
                return getDefaultTravelInfo(countryCode, cityCode);
            }

            if (!data || data.length === 0) {
                // 데이터가 없으면 기본 데이터를 저장
                const defaultInfo = getDefaultTravelInfo(countryCode, cityCode);
                await saveDefaultTravelInfoToDB(countryCode, cityCode, defaultInfo);
                return defaultInfo;
            }

            // 데이터베이스 데이터를 UI 형식으로 변환
            const sections: Record<string, any> = {};
            data.forEach((item) => {
                if (!sections[item.section]) {
                    sections[item.section] = {
                        title: getSectionTitle(item.section),
                        items: [],
                    };
                }
                
                const iconComponent = item.icon ? ICON_MAP[item.icon] || Globe : Globe;
                
                if (item.section === "links") {
                    sections[item.section].items.push({
                        title: item.title,
                        links: item.content || [],
                        icon: iconComponent,
                    });
                } else {
                    sections[item.section].items.push({
                        title: item.title,
                        date: item.date || undefined,
                        content: item.content || [],
                        icon: iconComponent,
                    });
                }
            });

            // item_index 순서는 이미 데이터베이스에서 정렬되어 있음
            return sections;
        } catch (err) {
            console.error("Failed to load travel info:", err);
            return getDefaultTravelInfo(countryCode, cityCode);
        } finally {
            setLoading(false);
        }
    };

    // 기본 여행 정보 가져오기 (기존 getTravelInfo 함수)
    const getDefaultTravelInfo = (countryCode: string, cityCode: string) => {
        // 호주 시드니 정보 (예시)
        if (countryCode === "AU" && cityCode === "SYD") {
            return {
                transport: {
                    title: "대중교통",
                    items: [
                        {
                            title: "요금 결제 방법 - 오팔 카드 vs 비접촉 결제",
                            icon: Bus,
                            content: [
                                "별도의 종이 티켓 없이 두 가지 방법 중 하나를 선택하여 단말기에 태그(Tap)하면 됩니다",
                                "오팔 카드: 한국의 티머니와 같은 교통카드. 편의점, 기차역에서 무료로 받을 수 있으며(최소 충전 금액 있음), 앱으로 잔액 관리 가능. 기념품으로 소장하고 싶은 경우 추천",
                                "비접촉식 결제 (강력 추천): 해외 결제 가능한 신용/체크카드(Visa, Master, Amex)나 스마트폰 페이(Apple Pay, Samsung Pay 등)를 그대로 사용. 별도 카드 구매나 충전 불필요",
                                "⚠️ 중요: 반드시 '같은 카드(또는 같은 기기)'로만 계속 태그해야 누적 할인 혜택을 받을 수 있습니다. 실물 카드로 탔다가 애플페이로 내리면 환승 인정 안 됨",
                                "두 방식의 요금과 환승 혜택은 동일합니다",
                            ],
                        },
                        {
                            title: "요금 한도 (Opal Cap) - 2025년 기준",
                            icon: Bus,
                            content: [
                                "아무리 많이 타도 하루/주간 일정 금액 이상 과금되지 않는 요금 상한제가 있습니다",
                                "주중(월~목) 일일 한도: 성인 약 $19.30",
                                "주말(금, 토, 일) 및 공휴일 일일 한도: 성인 약 $9.65 (주말 여행이 훨씬 저렴합니다!)",
                                "주간 한도 (월~일): 성인 약 $50.00",
                                "💡 팁: 금~일요일에 장거리 이동(블루마운틴, 페리 등)을 배치하면 교통비를 획기적으로 절약할 수 있습니다",
                            ],
                        },
                        {
                            title: "피크/오프피크 요금제",
                            icon: Bus,
                            content: [
                                "출퇴근 시간을 피하면 요금이 약 30% 할인됩니다",
                                "피크 타임: 평일 06:30~10:00, 15:00~19:00",
                                "오프 피크: 위 시간 외, 주말 및 공휴일 전체",
                                "여행자는 오프 피크 시간대 이용을 권장합니다",
                            ],
                        },
                        {
                            title: "환승 및 주간 보상",
                            icon: Bus,
                            content: [
                                "환승 할인: 대중교통 하차 후 60분 이내에 다른 종류의 교통수단으로 갈아탈 경우 성인 $2 할인 (예: 페리 → 기차)",
                                "주간 리워드: 월~일요일 사이에 8번 이상 유료 이용을 했다면, 9번째 이용부터는 남은 주간 동안 요금이 50% 할인됩니다",
                                "환승은 같은 방향으로만 인정됩니다",
                            ],
                        },
                        {
                            title: "공항세 (Station Access Fee) - 매우 중요!",
                            icon: Bus,
                            content: [
                                "시드니 공항역(Domestic, International)에서 타고 내릴 때는 위 요금 한도와 별개로 약 $17~18의 추가 공항 이용료가 붙습니다",
                                "⚠️ 이 금액은 일일/주간 한도에 포함되지 않습니다",
                                "공항선(T8) 이용 시 추가 요금 발생",
                                "공항 접근 대안: 버스나 우버 이용 시 공항세 없음 (단, 우버는 공항 요금 $4.25 별도)",
                            ],
                        },
                        {
                            title: "트레인 (Train) - 시드니 기차",
                            icon: Bus,
                            content: [
                                "시드니 시티와 외곽을 연결하는 가장 빠른 수단입니다. 2층 열차가 특징",
                                "시티 서클(City Circle) 라인이 주요 관광지를 순환합니다",
                                "주요 노선: T1-T9까지 9개 노선, 공항선(T8)은 추가 요금 발생",
                                "운행 시간: 평일 오전 5시~자정, 주말 오전 5시~새벽 2시",
                                "피크 시간대(오전 7-9시, 오후 4-7시)에는 혼잡하니 피하는 것이 좋습니다",
                                "주요 역: Central, Town Hall, Circular Quay, Bondi Junction",
                            ],
                        },
                        {
                            title: "버스 (Bus)",
                            icon: Bus,
                            content: [
                                "전철이 닿지 않는 곳(특히 본다이 비치 등 동부 해안)을 갈 때 유용합니다",
                                "심야(자정~새벽 4:30)에는 전철 운행이 중단되고 'NightRide' 버스가 그 구간을 대신 운행",
                                "승차/하차 시 모두 카드를 태그해야 합니다 (미태그 시 최대 요금 부과)",
                                "버스는 안내 방송이 잘 안 나오므로 구글 맵을 켜고 가는 것이 좋습니다",
                                "주요 버스 노선: 333번(본디비치), 380번(본디-본디비치), 400번(본디-본디정션)",
                                "버스는 앞문으로만 승차, 하차는 모든 문 가능",
                                "노란색 'STOP' 버튼을 눌러야 정류장에 서는 버스가 많습니다",
                            ],
                        },
                        {
                            title: "페리 (Ferry)",
                            icon: Bus,
                            content: [
                                "단순한 이동 수단을 넘어 시드니 하버의 풍경을 즐기는 관광 코스로도 인기",
                                "추천 노선: 서큘러 키(Circular Quay) ↔ 맨리(Manly), 타롱가 주(Taronga Zoo)",
                                "Manly 페리: 어른 $9.90 (일반), $7.60 (오팔), 약 30분 소요",
                                "페리에서 시드니 하버 브리지와 오페라하우스를 가장 잘 볼 수 있습니다",
                                "주말에는 관광객이 많아 자리가 없을 수 있으니 평일 이용 권장",
                                "바다가 거칠면 멀미가 날 수 있으니 준비하세요",
                                "⚠️ 일부 페리(맨리 등)는 하차 태그 불필요 - 안내 확인",
                            ],
                        },
                        {
                            title: "라이트 레일 (Light Rail) - 트램",
                            icon: Bus,
                            content: [
                                "도심 노면 전차(트램)입니다",
                                "센트럴 역에서 차이나타운, 달링하버, 피쉬마켓 등을 이동할 때 편리",
                                "L1: Central ↔ Dulwich Hill (서부 지역 연결)",
                                "L2: Circular Quay ↔ Randwick (동부 해안 연결)",
                                "L3: Circular Quay ↔ Kingsford (동부 해안 연결)",
                                "트램은 지하철과 달리 지상에서 운행되어 시내 풍경을 즐길 수 있습니다",
                                "승차/하차 시 오팔 카드 태그 필수",
                            ],
                        },
                        {
                            title: "메트로 (Metro)",
                            icon: Bus,
                            content: [
                                "무인 자동 운전 시스템으로, 비교적 최근에 개통된 노선들",
                                "쾌적하고 빠른 이동이 가능합니다",
                                "주요 노선: Tallawong ↔ Chatswood (M1), Chatswood ↔ Bankstown (M2)",
                                "시드니 공항과 연결되는 노선도 계획 중",
                            ],
                        },
                        {
                            title: "Tap On / Tap Off - 필수 주의사항",
                            icon: Bus,
                            content: [
                                "승차할 때와 하차할 때 반드시 카드를 단말기에 대야 합니다 (페리, 기차, 라이트 레일, 버스 모두 포함)",
                                "하차 태그를 잊으면 최대 요금이 부과됩니다",
                                "단, 맨리 페리는 하차 태그 불필요 등 일부 예외 존재 - 안내 확인",
                                "같은 카드/기기로 일관되게 사용해야 할인 혜택을 받을 수 있습니다",
                            ],
                        },
                        {
                            title: "필수 앱 추천",
                            icon: Bus,
                            content: [
                                "TripView: 시드니 현지인들이 가장 많이 쓰는 앱으로, 실시간 시간표와 플랫폼 정보가 매우 정확합니다",
                                "Google Maps: 길 찾기에 보편적으로 좋습니다",
                                "Opal Travel: 카드 잔액 확인 및 요금 계산에 유용합니다",
                                "이 앱들을 함께 사용하면 시드니 대중교통을 효율적으로 이용할 수 있습니다",
                            ],
                        },
                        {
                            title: "우버 & 택시",
                            icon: Bus,
                            content: [
                                "가족 여행 시 가까운 거리는 우버가 더 저렴하고 편할 수 있습니다",
                                "카시트가 필요한 경우 'Uber Family' 옵션을 확인하세요",
                                "일반 택시: 미터기 기준, 기본 요금 $3.60 + 거리/시간 요금",
                                "공항 택시: 시드니 공항 ↔ 시내 약 $50-70 (거리에 따라 상이)",
                                "우버는 앱으로 예약, 결제는 카드 자동 결제",
                                "시드니 공항에서 우버 이용 시 추가 공항 요금 $4.25 발생",
                            ],
                        },
                        {
                            title: "주차 정보",
                            icon: Bus,
                            content: [
                                "시드니 시내 주차는 매우 비쌉니다: 시간당 $5-15",
                                "주차 미터기: 동전 또는 카드 결제 가능, 주말/공휴일 무료인 곳도 있음",
                                "주차장: Wilson, Secure Parking 등 민간 주차장 이용 가능",
                                "주말 주차: 일부 지역은 주말 무료이지만 제한 시간 확인 필수",
                                "본디비치 주차: 매우 어려우니 대중교통 이용 강력 권장",
                                "주차 위반 벌금: $100-300, 매우 엄격하니 주의하세요",
                            ],
                        },
                    ],
                },
                culture: {
                    title: "문화/팁",
                    items: [
                        {
                            title: "\"No worries\" 문화 - 호주의 대표 정신",
                            icon: Globe,
                            content: [
                                "호주인의 대표적인 말: 'No worries' (괜찮아 / 문제 없어 / 신경 쓰지 마)",
                                "서비스가 느리거나 일정이 조금 바뀌어도 여유를 중시합니다",
                                "여행자도 조급함보다 부드럽고 여유로운 태도가 호감도 높음",
                                "⚠️ 급하게 재촉하거나 짜증 섞인 톤은 오히려 역효과",
                                "'No worries' 한마디면 대부분 해결됩니다",
                            ],
                        },
                        {
                            title: "수평적·비형식적 사회",
                            icon: Globe,
                            content: [
                                "직급, 나이보다 개인 존중을 중시합니다",
                                "카페, 상점, 호텔 직원도 이름으로 부르거나 친근하게 대화",
                                "'Sir / Madam' 같은 과한 존칭은 거의 안 씀",
                                "기본 인사: 'Hi' / 'Hello', 'How are you?' (의례적 인사, 길게 답 안 해도 됨)",
                                "호주인들은 'Mate'라는 호칭을 자주 사용합니다 (친근한 표현)",
                            ],
                        },
                        {
                            title: "생활 에티켓 - 가장 중요!",
                            icon: Globe,
                            content: [
                                "좌측 통행: 운전석뿐만 아니라 에스컬레이터, 인도, 계단 등 모든 곳에서 '왼쪽'에 서는 것이 기본 매너 (한국과 반대!)",
                                "문 잡아주기: 건물 문을 열고 들어갈 때 뒷사람이 오고 있다면 문을 잡고 기다려주는 것이 매우 보편적인 매너",
                                "인사 문화: 점원과 눈이 마주치면 가볍게 'Hi'나 'How are you?'라고 인사. 계산할 때 아무 말 없이 물건만 내미는 것은 어색",
                                "식당에서 부르는 방법: '저기요!' 하고 소리치거나 손을 번쩍 드는 것은 무례. 눈을 마주치고 가볍게 손짓하거나 기다리면 다가옴",
                                "큐잉(대기줄) 문화가 발달되어 있어 줄을 서는 것을 존중하세요",
                                "공공장소에서 큰 소리로 통화하거나 시끄럽게 행동하지 마세요",
                            ],
                        },
                        {
                            title: "개인 공간 & 프라이버시 중시",
                            icon: Globe,
                            content: [
                                "줄 설 때 거리 유지",
                                "허락 없이 사진 촬영 ❌ (특히 아이, 원주민)",
                                "질문도 너무 사적인 건 피하는 게 좋음 (나이, 연봉, 종교, 정치 성향 등)",
                            ],
                        },
                        {
                            title: "팁(Tip) 문화",
                            icon: Globe,
                            content: [
                                "팁은 의무가 아닙니다. 호주는 최저시급이 높아 미국처럼 팁이 필수인 나라가 아닙니다",
                                "일반 카페/식당: 팁 안 줘도 전혀 문제없습니다",
                                "고급 레스토랑: 서비스가 매우 만족스러웠다면 금액의 5~10% 정도를 남기기도 하지만, 선택 사항",
                                "⚠️ 주말/공휴일 할증(Surcharge): 오히려 팁 대신 주말이나 공휴일에 음식값의 10~15%가 추가 요금으로 붙는 경우가 많으니 영수증을 확인하세요",
                                "한국처럼 '안 주면 실례' 개념 ❌",
                            ],
                        },
                        {
                            title: "물 & 식당 문화",
                            icon: Globe,
                            content: [
                                "수돗물(Tap Water)은 마셔도 안전합니다. 식당에서 'Tap water please' 하면 무료 물을 컵이나 병에 담아 줍니다",
                                "식당에서 물을 사 먹으려면 비쌉니다. 수돗물을 무료로 제공하니 요청하세요",
                                "식당 주문: 'Can I have...', 'I'd like...' 등 정중한 표현 사용",
                                "계산: 'Check please' 또는 'Bill please'로 계산서 요청",
                                "BYO (Bring Your Own): 일부 레스토랑은 와인을 가져와도 됩니다 (코르크 수수료 $2-5)",
                                "식사 시간: 점심 12-2시, 저녁 6-9시가 일반적",
                                "음식 양은 한국보다 적은 편 → 대신 질 중시",
                            ],
                        },
                        {
                            title: "카페 & 커피 문화 - 국가급!",
                            icon: Globe,
                            content: [
                                "호주는 커피 자존심이 매우 강합니다. 카페 문화는 '국가급'",
                                "기본 메뉴: Flat White (호주 대표), Long Black (아메리카노와 다름), Latte, Cappuccino",
                                "설탕 기본 제공 ❌ (필요하면 따로 요청)",
                                "두유/오트밀크 선택 가능 (유당 민감 배려)",
                                "브런치 문화 발달 → 오전~이른 오후가 맛집 타임 (10-2시)",
                                "저녁은 비교적 일찍 닫는 곳 많음",
                            ],
                        },
                        {
                            title: "대중교통 에티켓",
                            icon: Globe,
                            content: [
                                "먼저 내리는 사람 우선",
                                "통화는 조용히",
                                "노약자석은 정말 필요한 사람에게 양보",
                                "교통카드 필수 (오팔카드)",
                                "무임승차 단속 엄격 (벌금 상당히 큼)",
                            ],
                        },
                        {
                            title: "횡단보도 & 교통 - 매우 엄격!",
                            icon: Globe,
                            content: [
                                "보행자 신호 철저: 차가 안 와 보여도 빨간불이면 절대 안 건넘",
                                "운전자도 보행자 우선 문화가 강함",
                                "⚠️ 무단횡단 절대 금지: 횡단보도 신호 위반이나 무단횡단 적발 시 벌금이 셉니다",
                                "버튼을 눌러야 신호가 바뀌는 곳이 많으니 횡단보도 기둥의 버튼을 꼭 누르세요",
                                "⚠️ 운전 시: 좌측통행, 스쿨존 제한속도 매우 엄격",
                            ],
                        },
                        {
                            title: "벌금과 법규 - 매우 엄격!",
                            icon: Globe,
                            content: [
                                "호주는 '벌금의 나라'라고 불릴 정도로 규칙 위반에 엄격합니다",
                                "무단횡단: 벌금이 매우 큼",
                                "⚠️ 검역법 (입국 시): 음식물 반입이 까다롭습니다. 육류, 과일, 채소, 흙이 묻은 신발 등은 반입 금지거나 반드시 신고. 신고 안 하고 걸리면 수십만 원의 벌금",
                                "라면 스프의 고기 성분도 문제 될 수 있으니 주의",
                                "야외 음주 규제: 지정된 장소(Alcohol Free Zone 표지판이 없는 곳)가 아닌 공원이나 해변에서 술을 마시면 벌금",
                                "주차 위반 벌금: $100-300, 매우 엄격",
                            ],
                        },
                        {
                            title: "술 구매 제한",
                            icon: Globe,
                            content: [
                                "마트(Woolworths, Coles)에서는 술을 팔지 않습니다",
                                "반드시 'Bottle Shop'(Liquorland, BWS, Dan Murphy's 등)이라 적힌 주류 전문 매장에 가야 함",
                                "여권(ID) 검사가 철저합니다",
                            ],
                        },
                        {
                            title: "자외선 주의 - 매우 중요!",
                            icon: Globe,
                            content: [
                                "호주의 자외선은 한국보다 3~5배 강합니다! 오존층이 얇아 자외선이 강하게 도달합니다",
                                "흐린 날에도 타기 때문에 선크림(SPF 50+), 선글라스, 모자는 사계절 필수품",
                                "선크림은 외출 20분 전 필수",
                                "오전 10시~오후 4시는 자외선이 가장 강한 시간대입니다",
                                "그늘에서도 자외선이 반사되므로 항상 주의하세요",
                                "아이들은 특히 민감하니 아이 전용 선크림 사용 권장",
                            ],
                        },
                        {
                            title: "해변 안전 - 매우 중요!",
                            icon: Globe,
                            content: [
                                "빨간색-노란색 깃발 사이에서만 수영",
                                "해파리, 상어보다 이안류(rip current)가 위험",
                                "구조요원 있는 해변 이용",
                                "파도 얕아 보여도 방심 금물",
                            ],
                        },
                        {
                            title: "자연 보호 규칙 엄격",
                            icon: Globe,
                            content: [
                                "국립공원: 식물 채집 ❌, 쓰레기 투기 ❌",
                                "해변: 조개, 산호 채취 ❌",
                                "벌금이 생각보다 큼",
                            ],
                        },
                        {
                            title: "아이·가족 친화 문화",
                            icon: Globe,
                            content: [
                                "유모차 이동 매우 편리",
                                "아이 동반에 매우 관대",
                                "대부분 장소에: 키즈 메뉴, 기저귀 교환대, 패밀리 화장실 있음",
                                "동물원, 박물관, 해변 → 아이 중심 프로그램 풍부",
                            ],
                        },
                        {
                            title: "놀이터 & 공원 활용",
                            icon: Globe,
                            content: [
                                "동네마다 퀄리티 높은 무료 놀이터",
                                "바비큐 시설도 무료 사용 가능 (전기 BBQ)",
                                "💡 여행 일정 중 '공원 1~2시간' 넣으면 아이 만족도 ↑",
                            ],
                        },
                        {
                            title: "호주식 영어 특징",
                            icon: Globe,
                            content: [
                                "발음이 빠르고 줄임말 많음",
                                "예시: Afternoon → Arvo, Barbecue → Barbie, Breakfast → Brekkie",
                                "못 알아들어도: 'Sorry, could you say that again?', 'Could you speak a bit slower?' 이렇게 말하면 다들 친절함",
                            ],
                        },
                        {
                            title: "결제 & 현금",
                            icon: Globe,
                            content: [
                                "현금 거의 안 씀: 카드 결제 99%, 소액도 카드 OK",
                                "일부 카드 수수료(1~1.5%) 있음",
                                "현금은 비상용 소액만",
                                "통화: 호주 달러 (AUD, $)",
                                "환전: 공항, 은행, 환전소에서 가능 (공항 환율이 불리함)",
                                "ATM: 은행 ATM에서 현금 인출 가능 (수수료 확인 필수)",
                            ],
                        },
                        {
                            title: "쇼핑 & 매너",
                            icon: Globe,
                            content: [
                                "환불 규정 명확: 단순 변심도 환불 가능한 경우 많음 (단, 사용 흔적 있으면 ❌)",
                                "주요 쇼핑몽: Westfield Sydney, Queen Victoria Building, The Rocks",
                                "면세점: 시드니 공항, 시내 면세점에서 여권 제시 시 면세 구매 가능",
                                "GST 환급: $300 이상 구매 시 공항에서 환급 가능 (TRS 서비스 이용)",
                                "쇼핑 시간: 한국처럼 밤늦게까지 문을 여는 상점이 많지 않음. 보통 오후 5~6시면 대부분 문 닫고, 목요일(쇼핑 데이)에만 9시까지",
                                "마트는 밤 10시~자정까지 하기도 함",
                                "할인 마트: Coles, Woolworths (식료품), Kmart, Big W (생활용품)",
                                "약국: Chemist Warehouse, Priceline (의약품, 화장품)",
                            ],
                        },
                        {
                            title: "전압 및 전자제품",
                            icon: Globe,
                            content: [
                                "230V, 50Hz를 사용하며 콘센트 모양이 '삼발이' 형태(Type I)입니다",
                                "'O' 타입 변환 어댑터가 꼭 필요하며, 멀티탭을 가져가면 편리합니다",
                                "노트북, 스마트폰 충전기는 대부분 100-240V 지원하므로 어댑터만 필요",
                                "헤어드라이어, 전기면도기 등은 전압 확인 필수 (변압기 필요할 수 있음)",
                                "공항이나 호텔에서 어댑터 대여 가능하지만 비쌉니다",
                            ],
                        },
                        {
                            title: "통신 및 인터넷",
                            icon: Globe,
                            content: [
                                "시뮬카: Optus, Telstra, Vodafone 등에서 구매 가능 ($10-30)",
                                "공항에서 바로 구매하거나 편의점에서 구매 가능",
                                "Wi-Fi: 대부분 카페, 호텔, 공공장소에서 무료 Wi-Fi 제공",
                                "시드니 공항 무료 Wi-Fi: 1시간 무료, 이후 유료",
                                "인터넷 속도는 한국보다 느릴 수 있으니 참고하세요",
                            ],
                        },
                        {
                            title: "응급상황 대처",
                            icon: Globe,
                            content: [
                                "응급전화: 000 (경찰, 소방, 구급차 모두)",
                                "한국 대사관: +61-2-9210-0200 (비상연락처)",
                                "병원: Royal Prince Alfred Hospital, St Vincent's Hospital 등",
                                "약국: Chemist Warehouse 등에서 일반 약 구매 가능",
                                "보험: 여행자 보험 가입 필수 (의료비가 매우 비쌉니다)",
                            ],
                        },
                        {
                            title: "시간대 및 공휴일",
                            icon: Globe,
                            content: [
                                "시드니 시간대: AEST (Australian Eastern Standard Time), UTC+10",
                                "서머타임: 10월 첫째 일요일~4월 첫째 일요일 (UTC+11)",
                                "한국과의 시차: +1시간 (서머타임 시 +2시간)",
                                "주요 공휴일: 1월 1일(신정), 1월 26일(오스트레일리아 데이), 부활절, 크리스마스 등",
                                "공휴일에는 대부분 상점이 문을 닫으니 미리 확인하세요",
                            ],
                        },
                    ],
                },
                festivals: {
                    title: "축제/이벤트",
                    items: [
                        {
                            title: "시드니 페스티벌 (Sydney Festival)",
                            icon: PartyPopper,
                            date: "1월 8일 ~ 1월 25일",
                            content: [
                                "도시 전체가 예술 무대로 변신합니다!",
                                "오페라하우스와 하이드파크 등에서 연극, 무용, 음악 공연이 열리며 무료 야외 이벤트도 많습니다",
                                "주요 장소: Sydney Opera House, Hyde Park, Barangaroo",
                                "티켓: 일부 공연은 무료, 유료 공연은 미리 예약 권장",
                                "하이라이트: 야외 콘서트, 거리 공연, 예술 설치 작품",
                            ],
                        },
                        {
                            title: "오스트레일리아 데이 (Australia Day) - 상세 가이드",
                            icon: PartyPopper,
                            date: "매년 1월 26일 (호주 전역 공휴일)",
                            content: [
                                "📅 유래: 1788년 1월 26일, 아서 필립 선장이 이끄는 '제1함대(First Fleet)'가 시드니 코브(현재 서큘러 키)에 도착하여 영국 국기를 게양하고 식민지를 선포한 날을 기념",
                                "💭 현대적 의미: 'Reflect, Respect, Celebrate(성찰, 존중, 축하)' 슬로건으로 호주의 다문화 사회와 시민권을 축하하는 날",
                                "",
                                "🎉 시드니 하버 페스티벌 (Sydney Harbour Festival):",
                                "  • 페리톤 (Ferrython): 오전 10:45경, 시드니의 초록색/노란색 페리들이 하버 브리지 아래에서 경주 (무료 관람)",
                                "  • 공군 에어쇼 (RAAF Flyover): 호주 공군 전투기가 시드니 하버 상공을 낮게 비행하며 곡예비행",
                                "  • 톨 십 레이스 (Tall Ships Race): 식민지 시대 스타일의 거대한 범선들이 항구를 가로지르는 레이스",
                                "",
                                "🌅 공식 행사:",
                                "  • 우굴오라 아침 의식 (WugulOra Morning Ceremony): 오전 7:30, 바랑가루에서 원주민의 불과 연기를 이용한 정화 의식",
                                "  • 시민권 수여식: 이날 호주 전역에서 이민자들이 선서를 하고 정식으로 '호주 시민'이 되는 행사",
                                "",
                                "🎵 오스트레일리아 데이 라이브 (Australia Day Live):",
                                "  • 장소: 시드니 오페라 하우스 앞 광장 및 서큘러 키",
                                "  • 시간: 저녁 7시 30분부터",
                                "  • 내용: 호주 유명 가수들의 대형 야외 콘서트, 오페라 하우스와 하버 브리지를 배경으로 화려한 불꽃놀이와 제트스키 쇼 (티켓 필요, 서큘러 키 주변에서도 불꽃놀이 관람 가능)",
                                "",
                                "⚠️ 중요한 사회적 맥락 - '침략의 날' (Invasion Day):",
                                "  • 원주민 입장: 1788년 1월 26일은 백인 정착민에 의해 땅을 빼앗기고 학살이 시작된 날",
                                "  • 대안 명칭: '침략의 날(Invasion Day)' 또는 '생존의 날(Survival Day)'",
                                "  • 항의 시위: 시드니 시청(Town Hall)에서 시작해 하이드 파크나 빅토리아 파크까지 대규모 행진 시위 ('Always was, always will be Aboriginal land' 구호)",
                                "  • 여행자 팁: 시위는 대체로 평화롭지만 인파가 매우 몰림. 축제 분위기와 엄숙한 시위 분위기가 공존하는 날임을 이해하고, 시위대 근처에서는 사진 촬영 등에 주의하며 존중하는 태도 필요",
                                "",
                                "🚇 교통 대란 주의:",
                                "  • 시드니 시내(CBD) 주요 도로는 차량 통행 금지",
                                "  • 버스 노선이 우회하므로 지하철(Train/Metro) 이용 강력 권장",
                                "  • 오팔 카드 요금은 공휴일 요금(하루 최대 $9.65 정도) 적용",
                                "",
                                "🛒 상점 운영 시간:",
                                "  • 대형 마트(Woolworths, Coles)는 대부분 영업하지만 단축 영업 가능",
                                "  • 소규모 카페나 식당은 문을 닫거나 공휴일 추가 요금(Surcharge 10~15%) 받음",
                                "",
                                "🍺 음주 규제 (Alcohol Free Zone):",
                                "  • 서큘러 키나 바랑가루 등 인파가 몰리는 공공장소에서의 음주가 엄격히 금지되거나 지정된 구역(Bar)에서만 가능",
                                "  • 경찰 단속이 심하니 길거리 음주는 피하세요",
                                "",
                                "🎁 준비물:",
                                "  • 호주 국기 무늬의 티셔츠, 모자, 타투 스티커 등을 쓴 사람들을 많이 볼 수 있음",
                                "  • 마트(Coles, Woolworths, Kmart)에서 저렴하게 판매",
                                "",
                                "💡 요약: 오스트레일리아 데이는 '항구에서의 화려한 축제'와 '원주민 역사의 아픔'이 공존하는 날입니다. 오전에 페리톤 구경, 오후에 바비큐 파티, 저녁에 불꽃놀이를 즐기시되, 도심 행진을 마주치면 그들의 목소리에도 귀를 기울여 보시면 호주를 더 깊이 이해하는 계기가 될 것입니다.",
                            ],
                        },
                        {
                            title: "설날 축제 (Lunar New Year)",
                            icon: PartyPopper,
                            date: "2월 초중순 (음력 설날 기준)",
                            content: [
                                "아시아 밖에서 가장 큰 설날 축제 중 하나입니다",
                                "거대한 등불 전시와 사자춤, 드래곤 보트 경주(달링하버)를 놓치지 마세요",
                                "주요 장소: 차이나타운(Haymarket), 달링하버(Darling Harbour)",
                                "이벤트: 거리 퍼레이드, 사자춤, 드래곤 보트 경주, 등불 전시",
                                "음식: 차이나타운에서 다양한 아시아 음식과 전통 음식 맛보기",
                                "드래곤 보트 경주는 달링하버에서 열리며 매우 인기 있는 이벤트입니다",
                            ],
                        },
                        {
                            title: "마디그라 (Sydney Gay and Lesbian Mardi Gras)",
                            icon: PartyPopper,
                            date: "2월 15일 ~ 3월 1일",
                            content: [
                                "세계 최대의 LGBTQIA+ 축제입니다",
                                "2월 중순 'Fair Day'를 시작으로 축제 분위기가 고조되며, 2월 말/3월 초 퍼레이드가 하이라이트입니다",
                                "퍼레이드: 2월 말 토요일 저녁, Oxford Street에서 열림",
                                "Fair Day: Victoria Park에서 열리는 가족 친화적 이벤트",
                                "파티: 다양한 클럽과 장소에서 파티가 열립니다",
                                "티켓: 퍼레이드 관람은 무료, 파티는 유료 티켓 필요",
                            ],
                        },
                        {
                            title: "유나이티드 컵 (United Cup Tennis)",
                            icon: Calendar,
                            date: "12월 27일 ~ 1월 5일",
                            content: [
                                "호주 오픈의 전초전! 세계적인 테니스 스타들을 가까이서 볼 수 있는 기회입니다",
                                "장소: Ken Rosewall Arena, Sydney Olympic Park",
                                "티켓: 온라인 예매 가능, 조기 예매 시 할인",
                                "교통: 기차로 Olympic Park 역 하차",
                                "주변 시설: 올림픽 공원 내 레스토랑, 카페 이용 가능",
                            ],
                        },
                        {
                            title: "시드니 페스티벌 (Sydney Festival) 2026",
                            icon: PartyPopper,
                            date: "1월 8일 (목) ~ 1월 25일 (일)",
                            content: [
                                "매년 1월, 한여름의 시드니를 무대로 연극, 무용, 음악, 오페라, 시각 예술 등 다양한 장르의 공연이 펼쳐집니다",
                                "특히 호주 원주민(First Nations) 문화 예술이 축제의 중요한 축을 담당합니다",
                                "장소: 시드니 오페라 하우스, 타운 홀, 바랑가루, 파라마타 등 시내 전역",
                                "테마: '연결(Connection)'과 '이야기(Storytelling)'",
                                "주요 프로그램:",
                                "  • Garabari: 오페라 하우스 북쪽 산책로에서 펼쳐지는 거대한 댄스 플로어 (원주민 춤 의식)",
                                "  • Mama Does Derby: 타운 홀에서 열리는 롤러 더비 공연 (엄마와 딸의 관계를 다룬 유쾌한 공연)",
                                "  • HELD: 바랑가루 리저브의 대규모 조각 예술 작품 (무료 관람 가능)",
                                "  • Live at Hickson Road: 왈쉬 베이에서 관객이 엑스트라가 되는 독특한 거리극",
                                "  • WAVERIDER: 본다이 파빌리온의 거대한 공기 주입식 파도 조형물과 공중 곡예 공연",
                                "티켓: 공식 웹사이트 sydneyfestival.org.au에서 예매",
                                "가격: 공연마다 다름 ($30~$100), 무료 공연도 다수 있음",
                                "할인: 'Tix for under $49' 조기 예매 또는 러쉬 티켓(당일 남은 좌석) 확인",
                                "야외 공연 준비물: 선글라스, 모자, 선크림 필수 (1월은 한여름), 저녁에는 얇은 겉옷 권장",
                                "교통: 축제 기간 시티 주요 도로 통제 및 혼잡 예상, 대중교통(페리, 트레인, 라이트 레일) 이용 강력 권장",
                                "예산 절약 팁: HELD 같은 무료 설치 미술이나 무료 거리 공연(Festival Village) 정보 확인",
                            ],
                        },
                        {
                            title: "핑크 테스트 크리켓 (The Pink Test)",
                            icon: Calendar,
                            date: "1월 초 (매년 다름)",
                            content: [
                                "호주 대표 스포츠 크리켓! SCG가 핑크색으로 물드는 장관을 볼 수 있습니다",
                                "장소: Sydney Cricket Ground (SCG)",
                                "의미: 유방암 인식 제고를 위한 자선 이벤트",
                                "티켓: 온라인 예매, 조기 예매 권장",
                                "교통: Central 역에서 버스 또는 도보로 접근 가능",
                            ],
                        },
                        {
                            title: "시드니 비엔날레 (Biennale of Sydney)",
                            icon: Calendar,
                            date: "3월 ~ 6월 (2년마다)",
                            content: [
                                "아시아 태평양 지역 최대 규모의 현대 미술 비엔날레",
                                "주요 장소: Art Gallery of NSW, Museum of Contemporary Art, Cockatoo Island",
                                "전시: 세계 각국의 현대 미술 작품 전시",
                                "입장료: 대부분 무료 또는 저렴한 입장료",
                                "Cockatoo Island는 페리로 접근하며 섬 전체가 전시장으로 변신",
                            ],
                        },
                        {
                            title: "빈디지 페스티벌 (Vivid Sydney)",
                            icon: PartyPopper,
                            date: "5월 말 ~ 6월 중순",
                            content: [
                                "세계 최대 규모의 빛과 음악 축제",
                                "오페라하우스, 하버 브리지 등이 빛의 예술 작품으로 변신",
                                "주요 장소: Circular Quay, The Rocks, Darling Harbour, Royal Botanic Gardens",
                                "이벤트: 빛 설치 작품, 음악 공연, 강의 및 워크샵",
                                "관람: 대부분 무료, 일부 공연은 유료",
                                "교통: 매우 혼잡하니 대중교통 이용 필수",
                            ],
                        },
                        {
                            title: "시드니 해양 축제 (Sydney Harbour Regatta)",
                            icon: Calendar,
                            date: "3월 초",
                            content: [
                                "시드니 하버에서 열리는 요트 경주 축제",
                                "주요 장소: 시드니 하버 전역",
                                "관람: 해안가에서 무료 관람 가능",
                                "특별 이벤트: 고급 요트 투어, 해상 파티 등",
                            ],
                        },
                        {
                            title: "크리스마스 & 연말 이벤트",
                            icon: Calendar,
                            date: "12월",
                            content: [
                                "시드니 하버에서 열리는 크리스마스 불꽃놀이 (12월 31일)",
                                "Martin Place 크리스마스 트리 조명식",
                                "Pitt Street Mall 크리스마스 장식",
                                "크리스마스 이브: 대부분 상점이 오후 6시에 문 닫음",
                                "Boxing Day (12월 26일): 대규모 세일 시작, 매우 혼잡",
                            ],
                        },
                        {
                            title: "시드니 로얄 이스터 쇼 (Sydney Royal Easter Show)",
                            icon: PartyPopper,
                            date: "부활절 기간 (3-4월)",
                            content: [
                                "호주 최대 규모의 농업 및 축제 박람회",
                                "장소: Sydney Olympic Park",
                                "이벤트: 농산물 전시, 가축 쇼, 놀이기구, 음식, 공연",
                                "가족 친화적 이벤트로 아이들과 함께 즐기기 좋습니다",
                                "티켓: 온라인 예매 가능, 조기 예매 할인",
                            ],
                        },
                    ],
                },
                conversation: {
                    title: "회화",
                    items: [
                        {
                            title: "기본 인사 및 필수 표현",
                            icon: MessageSquare,
                            content: [
                                "G'day! / Hi there! → 안녕하세요! (가벼운 인사)",
                                "How are you going? → 잘 지내세요? (How are you?의 호주식 표현)",
                                "I'm good, thanks. And you? → 좋아요, 당신은요?",
                                "Excuse me. → 실례합니다 / 저기요",
                                "Cheers / Ta. → 고마워요 (Thank you 대신 가볍게 많이 씀)",
                                "No worries. → 천만에요 / 문제없어요 (You're welcome 대신 가장 많이 쓰는 말)",
                                "Sorry about that. → 미안합니다",
                                "Could you please help me? → 좀 도와주시겠어요?",
                                "I don't speak English very well. → 영어를 잘 못해요",
                                "Could you speak a bit slower? → 조금만 천천히 말씀해 주시겠어요?",
                            ],
                        },
                        {
                            title: "공항 및 입국 심사",
                            icon: MessageSquare,
                            content: [
                                "Where is the baggage claim? → 수하물 찾는 곳이 어디인가요?",
                                "I have nothing to declare. → 세관에 신고할 물건이 없습니다",
                                "I have some food/medicine. → 음식/약이 좀 있습니다",
                                "Where can I catch the train to the City? → 시티로 가는 기차는 어디서 타나요?",
                                "Where can I buy an Opal card? → 오팔 카드는 어디서 사나요?",
                                "Is there a currency exchange nearby? → 근처에 환전소가 있나요?",
                                "Where is the Uber pick-up zone? → 우버 탑승 구역이 어디인가요?",
                                "How do I get to the domestic terminal? → 국내선 터미널로 어떻게 가나요?",
                                "My luggage is missing. → 제 짐이 안 보여요",
                                "Is there free Wi-Fi here? → 여기 무료 와이파이 있나요?",
                            ],
                        },
                        {
                            title: "대중교통 이용",
                            icon: MessageSquare,
                            content: [
                                "Does this train go to Central Station? → 이 기차 센트럴 역 가나요?",
                                "Which platform for Circular Quay? → 서큘러 키 행은 몇 번 플랫폼인가요?",
                                "Is this the right stop for the Opera House? → 오페라 하우스 가려면 여기서 내리나요?",
                                "I'd like to top up my Opal card. → 오팔 카드 충전하고 싶어요",
                                "Can I use my credit card to tap on? → 신용카드로 태그해서 탈 수 있나요?",
                                "How much is the fare to Bondi Beach? → 본다이 비치까지 요금이 얼마인가요?",
                                "Does this bus stop at QVB? → 이 버스 QVB(퀸 빅토리아 빌딩)에 서나요?",
                                "Please let me know when we get there. → 도착하면 알려주세요",
                                "Is this seat taken? → 여기 자리 있나요?",
                                "When is the last ferry to Manly? → 맨리 가는 마지막 페리는 언제인가요?",
                            ],
                        },
                        {
                            title: "숙소",
                            icon: MessageSquare,
                            content: [
                                "I'd like to check in, please. → 체크인할게요",
                                "I have a reservation under [Name]. → [이름]으로 예약했습니다",
                                "Can I leave my luggage here before check-in? → 체크인 전에 짐 좀 맡길 수 있나요?",
                                "What is the Wi-Fi password? → 와이파이 비밀번호가 뭔가요?",
                                "Breakfast is included? → 조식 포함인가요?",
                                "When is check-out time? → 체크아웃 시간이 언제인가요?",
                                "Can I have a late check-out? → 레이트 체크아웃이 가능한가요?",
                                "The air conditioner isn't working. → 에어컨이 작동을 안 해요",
                                "Could I have extra towels? → 수건 좀 더 주시겠어요?",
                                "Can you call a taxi for me? → 택시 좀 불러주실 수 있나요?",
                            ],
                        },
                        {
                            title: "식당 및 카페",
                            icon: MessageSquare,
                            content: [
                                "Table for two, please. → 두 명 자리 부탁해요",
                                "Can I see the menu, please? → 메뉴판 좀 볼 수 있을까요?",
                                "What do you recommend? → 추천 메뉴가 뭔가요?",
                                "I'll have a Flat White, please. → 플랫 화이트 한 잔 주세요 (호주 대표 커피)",
                                "Can I get an Iced Long Black? → 아이스 롱블랙/아메리카노 주세요",
                                "Tap water is fine, thanks. → 수돗물/무료 물로 주셔도 돼요",
                                "Can I have the sauce on the side? → 소스는 따로 주시겠어요?",
                                "Is this gluten-free? → 이거 글루텐 프리인가요?",
                                "Table water, please. → 물 좀 주세요",
                                "Can we split the bill? → 따로 계산해도 될까요?",
                                "Do you have a surcharge on weekends? → 주말 추가 요금이 있나요?",
                                "For here or takeaway? → 드시고 가나요, 가져가나요? (To go 대신 Takeaway 사용)",
                                "I'll have the same. → 같은 걸로 주세요",
                            ],
                        },
                        {
                            title: "쇼핑",
                            icon: MessageSquare,
                            content: [
                                "How much is this? → 이거 얼마예요?",
                                "Can I try this on? → 입어봐도 되나요?",
                                "Do you have this in a smaller/larger size? → 더 작은/큰 사이즈 있나요?",
                                "Where is the fitting room? → 피팅룸이 어디인가요?",
                                "Do you accept cash? → 현금 받나요? (카드 전용 매장이 많음)",
                                "Can I get a tax invoice for TRS? → 택스 리펀(TRS)용 영수증 주실 수 있나요?",
                                "What time do you close? → 몇 시에 문 닫나요?",
                                "Is there a supermarket nearby? → 근처에 슈퍼마켓 있나요? (Coles, Woolworths)",
                                "Where is the nearest bottle shop? → 가장 가까운 주류 판매점이 어디죠? (마트에선 술 안 팖)",
                                "I'm just looking, thanks. → 그냥 둘러보는 중이에요",
                            ],
                        },
                        {
                            title: "관광 및 길 묻기",
                            icon: MessageSquare,
                            content: [
                                "How do I get to the Opera House? → 오페라 하우스 어떻게 가나요?",
                                "Is it within walking distance? → 걸어서 갈 만한 거리인가요?",
                                "Can you take a photo for us? → 사진 좀 찍어주시겠어요?",
                                "Where is the entrance? → 입구가 어디죠?",
                                "Is there an admission fee? → 입장료가 있나요?",
                                "Do students get a discount? → 학생 할인이 되나요?",
                                "Where is the best spot for photos? → 사진 찍기 제일 좋은 곳이 어디인가요?",
                                "Which way is north? → 어느 쪽이 북쪽인가요?",
                                "I think I'm lost. → 길을 잃은 것 같아요",
                                "Is it safe to walk here at night? → 밤에 여기 걸어 다녀도 안전한가요?",
                            ],
                        },
                        {
                            title: "긴급 상황",
                            icon: MessageSquare,
                            content: [
                                "Where is the nearest hospital? → 가장 가까운 병원이 어디인가요?",
                                "I need a doctor. → 의사가 필요해요",
                                "Where is the pharmacy/chemist? → 약국이 어디인가요? (Chemist라고도 많이 함)",
                                "I lost my passport. → 여권을 잃어버렸어요",
                                "Please call the police. → 경찰을 불러주세요",
                                "I left my bag on the train. → 기차에 가방을 두고 내렸어요",
                                "Where is the nearest toilet/bathroom? → 화장실이 어디인가요? (Toilet이 가장 무난)",
                                "My wallet has been stolen. → 지갑을 도둑맞았어요",
                                "Do you have a lost and found? → 분실물 센터가 있나요?",
                            ],
                        },
                        {
                            title: "알아두면 좋은 호주 슬랭",
                            icon: MessageSquare,
                            content: [
                                "G'day Mate. → 안녕 친구 (호주 남성들이 많이 씀)",
                                "No worries. → 문제없어/천만에/괜찮아 (만능 표현)",
                                "Arvo → Afternoon (오후. 예: See you in the arvo)",
                                "Brekkie → Breakfast (아침 식사)",
                                "Barbie → Barbecue (바비큐)",
                                "Maccas → McDonald's (맥도날드)",
                                "Thongs → Flip-flops ('쪼리' 슬리퍼. 속옷 아님 주의!)",
                                "Sunnies → Sunglasses (선글라스)",
                                "Mozzie → Mosquito (모기)",
                                "Aussie → Australian (호주 사람)",
                                "Bottle-O → Bottle shop (주류 판매점)",
                                "Servo → Service station (주유소/휴게소)",
                                "Heaps → A lot / Very (매우, 많이. 예: Thanks heaps!)",
                            ],
                        },
                        {
                            title: "기타 유용한 표현",
                            icon: MessageSquare,
                            content: [
                                "Do you have a power adapter? → 변환 어댑터 있나요?",
                                "Can I charge my phone here? → 여기서 핸드폰 충전해도 되나요?",
                                "What's the weather like tomorrow? → 내일 날씨 어때요?",
                                "It's boiling hot today. → 오늘 엄청 덥네요",
                                "Have a good one! → 좋은 하루 보내세요!",
                            ],
                        },
                    ],
                },
                links: {
                    title: "링크 모음",
                    items: [
                        {
                            title: "🇦🇺 비자 및 입국/정부 필수",
                            icon: LinkIcon,
                            links: [
                                { name: "Australian ETA (비자 신청)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601", note: "앱 설치 권장" },
                                { name: "Home Affairs (호주 내무부)", url: "https://immi.homeaffairs.gov.au" },
                                { name: "Australian Border Force (세관/검역)", url: "https://www.abf.gov.au" },
                                { name: "TRS (세금 환급 웹/앱 정보)", url: "https://www.abf.gov.au/entering-and-leaving-australia/tourist-refund-scheme" },
                                { name: "Smartraveller (안전 정보)", url: "https://www.smartraveller.gov.au" },
                                { name: "주 호주 대한민국 대사관", url: "https://overseas.mofa.go.kr/au-ko/index.do" },
                            ],
                        },
                        {
                            title: "✈️ 항공 및 이동 수단",
                            icon: LinkIcon,
                            links: [
                                { name: "Skyscanner", url: "https://www.skyscanner.co.kr" },
                                { name: "Google Flights", url: "https://www.google.com/flights" },
                                { name: "Qantas (콴타스 항공)", url: "https://www.qantas.com" },
                                { name: "Jetstar (젯스타)", url: "https://www.jetstar.com" },
                                { name: "Virgin Australia", url: "https://www.virginaustralia.com" },
                                { name: "Rex (Regional Express)", url: "https://www.rex.com.au" },
                                { name: "Transport NSW (시드니 오팔카드)", url: "https://transportnsw.info" },
                                { name: "PTV (멜버른 대중교통)", url: "https://www.ptv.vic.gov.au" },
                                { name: "Translink (브리즈번/골드코스트)", url: "https://translink.com.au" },
                                { name: "Transperth (퍼스 대중교통)", url: "https://www.transperth.wa.gov.au" },
                                { name: "Adelaide Metro", url: "https://www.adelaidemetro.com.au" },
                                { name: "Uber", url: "https://www.uber.com/au/en" },
                                { name: "DiDi", url: "https://web.didiglobal.com/au" },
                                { name: "13cabs", url: "https://www.13cabs.com.au" },
                                { name: "Rome2rio (경로 비교)", url: "https://www.rome2rio.com" },
                            ],
                        },
                        {
                            title: "🚐 렌터카 및 캠핑카",
                            icon: LinkIcon,
                            links: [
                                { name: "Rentalcars.com", url: "https://www.rentalcars.com" },
                                { name: "VroomVroomVroom", url: "https://www.vroomvroomvroom.com.au" },
                                { name: "Jucy (캠핑밴)", url: "https://www.jucy.com" },
                                { name: "Apollo Camper", url: "https://www.apollocamper.com" },
                                { name: "Britz", url: "https://www.britz.com" },
                                { name: "Maui", url: "https://www.maui-rentals.com" },
                                { name: "Camplify (캠핑카 공유)", url: "https://www.camplify.com.au" },
                                { name: "Spaceships Rentals", url: "https://www.spaceshipsrentals.com.au" },
                                { name: "FuelMap Australia", url: "https://www.fuelmap.com.au" },
                                { name: "WikiCamps Australia", url: "https://www.wikicamps.com.au" },
                                { name: "Live Traffic NSW", url: "https://www.livetraffic.com", note: "주별로 사이트 다름" },
                            ],
                        },
                        {
                            title: "🏨 숙소 예약",
                            icon: LinkIcon,
                            links: [
                                { name: "Booking.com", url: "https://www.booking.com" },
                                { name: "Airbnb", url: "https://www.airbnb.co.kr" },
                                { name: "Agoda", url: "https://www.agoda.com" },
                                { name: "Hostelworld", url: "https://www.hostelworld.com" },
                                { name: "YHA Australia", url: "https://www.yha.com.au" },
                                { name: "Stayz", url: "https://www.stayz.com.au" },
                                { name: "Hipcamp", url: "https://www.hipcamp.com" },
                                { name: "Wotif", url: "https://www.wotif.com" },
                                { name: "Luxury Escapes", url: "https://luxuryescapes.com" },
                            ],
                        },
                        {
                            title: "🍽️ 맛집 및 카페",
                            icon: LinkIcon,
                            links: [
                                { name: "Google Maps", url: "https://www.google.com/maps" },
                                { name: "TheFork (예약 할인)", url: "https://www.thefork.com.au" },
                                { name: "Broadsheet (로컬 매거진)", url: "https://www.broadsheet.com.au" },
                                { name: "The Urban List", url: "https://www.theurbanlist.com" },
                                { name: "Good Food (맛집 평가)", url: "https://www.goodfood.com.au" },
                                { name: "Beanhunter (커피 찾기)", url: "https://www.beanhunter.com" },
                                { name: "HappyCow (비건)", url: "https://www.happycow.net" },
                                { name: "Uber Eats", url: "https://www.ubereats.com/au" },
                                { name: "DoorDash", url: "https://www.doordash.com/en-AU" },
                                { name: "Menulog", url: "https://www.menulog.com.au" },
                            ],
                        },
                        {
                            title: "🏖️ 날씨 및 안전",
                            icon: LinkIcon,
                            links: [
                                { name: "BOM (호주 기상청)", url: "http://www.bom.gov.au" },
                                { name: "WillyWeather", url: "https://www.willyweather.com.au" },
                                { name: "Beachsafe (해변 안전)", url: "https://beachsafe.org.au" },
                                { name: "SunSmart (자외선 정보)", url: "https://www.sunsmart.com.au" },
                                { name: "Emergency+ (앱 정보)", url: "https://emergencyapp.triplezero.gov.au" },
                            ],
                        },
                        {
                            title: "🎟️ 액티비티 및 투어 예약",
                            icon: LinkIcon,
                            links: [
                                { name: "Klook", url: "https://www.klook.com" },
                                { name: "KKday", url: "https://www.kkday.com" },
                                { name: "GetYourGuide", url: "https://www.getyourguide.com" },
                                { name: "Viator", url: "https://www.viator.com" },
                                { name: "RedBalloon (이색 체험)", url: "https://www.redballoon.com.au" },
                                { name: "Adrenaline (익스트림)", url: "https://www.adrenaline.com.au" },
                                { name: "Bookme", url: "https://bookme.com.au" },
                                { name: "Groupon Australia", url: "https://www.groupon.com.au" },
                                { name: "Eventbrite", url: "https://www.eventbrite.com.au" },
                                { name: "Ticketek", url: "https://premier.ticketek.com.au" },
                                { name: "Ticketmaster", url: "https://www.ticketmaster.com.au" },
                            ],
                        },
                        {
                            title: "🛍️ 쇼핑 및 생활",
                            icon: LinkIcon,
                            links: [
                                { name: "Woolworths", url: "https://www.woolworths.com.au" },
                                { name: "Coles", url: "https://www.coles.com.au" },
                                { name: "Dan Murphy's (주류)", url: "https://www.danmurphys.com.au" },
                                { name: "BWS", url: "https://bws.com.au" },
                                { name: "Chemist Warehouse (약국/영양제)", url: "https://www.chemistwarehouse.com.au" },
                                { name: "Priceline", url: "https://www.priceline.com.au" },
                                { name: "JB Hi-Fi (전자제품)", url: "https://www.jbhifi.com.au" },
                                { name: "Kmart", url: "https://www.kmart.com.au" },
                                { name: "Target", url: "https://www.target.com.au" },
                                { name: "Big W", url: "https://www.bigw.com.au" },
                                { name: "Westfield", url: "https://www.westfield.com.au" },
                                { name: "QVB", url: "https://www.qvb.com.au" },
                                { name: "Paddy's Markets", url: "https://paddysmarkets.com.au" },
                                { name: "DFO (아울렛)", url: "https://www.dfo.com.au" },
                            ],
                        },
                        {
                            title: "🇰🇷 한인 커뮤니티",
                            icon: LinkIcon,
                            links: [
                                { name: "호주나라 (시드니)", url: "http://www.hojunara.com" },
                                { name: "멜번의 하늘 (멜버른)", url: "http://melbsky.com" },
                                { name: "썬브리즈번 (퀸즐랜드)", url: "http://www.sunbrisbane.com" },
                                { name: "퍼스 참을 수 없는 그리움 (다음 카페)", url: "https://cafe.daum.net/aushome" },
                                { name: "아들레이드 포커스", url: "http://www.adelaidefocus.com" },
                            ],
                        },
                        {
                            title: "🗺️ 관광청 및 지역 정보",
                            icon: LinkIcon,
                            links: [
                                { name: "Tourism Australia", url: "https://www.australia.com" },
                                { name: "Visit NSW", url: "https://www.visitnsw.com" },
                                { name: "Visit Victoria", url: "https://www.visitvictoria.com" },
                                { name: "Queensland", url: "https://www.queensland.com" },
                                { name: "Tourism Western Australia", url: "https://www.westernaustralia.com" },
                                { name: "South Australia Tourism", url: "https://southaustralia.com" },
                                { name: "Discover Tasmania", url: "https://www.discovertasmania.com.au" },
                                { name: "Northern Territory", url: "https://northernterritory.com" },
                                { name: "Sydney.com", url: "https://www.sydney.com" },
                            ],
                        },
                        {
                            title: "💡 기타 유용한 사이트",
                            icon: LinkIcon,
                            links: [
                                { name: "OzBargain (할인 정보 공유)", url: "https://www.ozbargain.com.au" },
                                { name: "Whirlpool Forums (IT/통신 정보)", url: "https://forums.whirlpool.net.au" },
                                { name: "Meetup (모임 찾기)", url: "https://www.meetup.com" },
                                { name: "XE Currency (환율)", url: "https://www.xe.com" },
                                { name: "TimeOut Australia", url: "https://www.timeout.com/australia" },
                            ],
                        },
                    ],
                },
            };
        }
        // 다른 도시/나라 정보는 여기에 추가 가능
        return {
            transport: { title: "대중교통", items: [] },
            culture: { title: "문화/팁", items: [] },
            festivals: { title: "축제/이벤트", items: [] },
            conversation: { title: "회화", items: [] },
            links: { title: "링크 모음", items: [] },
        };
    };

    // 섹션 제목 가져오기
    const getSectionTitle = (section: string): string => {
        const titles: Record<string, string> = {
            transport: "대중교통",
            culture: "문화/팁",
            festivals: "축제/이벤트",
            conversation: "회화",
            links: "링크 모음",
        };
        return titles[section] || section;
    };

    // 기본 데이터를 데이터베이스에 저장
    const saveDefaultTravelInfoToDB = async (
        countryCode: string,
        cityCode: string,
        travelInfo: any
    ) => {
        try {
            const itemsToInsert: any[] = [];

            Object.keys(travelInfo).forEach((section) => {
                const sectionData = travelInfo[section];
                if (sectionData && sectionData.items) {
                    sectionData.items.forEach((item: any, index: number) => {
                        // 아이콘 이름 찾기
                        let iconName = "Globe";
                        Object.keys(ICON_MAP).forEach((key) => {
                            if (ICON_MAP[key] === item.icon) {
                                iconName = key;
                            }
                        });

                        // content 데이터 준비
                        let contentData: any = null;
                        if (section === "links") {
                            contentData = Array.isArray(item.links) ? item.links : [];
                        } else {
                            contentData = Array.isArray(item.content) ? item.content : [];
                        }

                        // 데이터 검증
                        if (!item.title || item.title.trim() === "") {
                            console.warn(`Skipping item with empty title in section ${section}, index ${index}`);
                            return;
                        }

                        itemsToInsert.push({
                            country_code: countryCode,
                            city_code: cityCode,
                            section: section,
                            item_index: index,
                            title: item.title.trim(),
                            date: item.date ? item.date.trim() : null,
                            content: contentData,
                            icon: iconName,
                        });
                    });
                }
            });

            if (itemsToInsert.length > 0) {
                console.log(`Attempting to save ${itemsToInsert.length} items to database`);
                
                // 기존 데이터가 있는지 확인하고 upsert 사용
                const { data, error } = await supabase
                    .from("travel_info")
                    .upsert(itemsToInsert, {
                        onConflict: "country_code,city_code,section,item_index",
                        ignoreDuplicates: false,
                    });

                if (error) {
                    const errorDetails = {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code,
                        itemsCount: itemsToInsert.length,
                        sampleItem: itemsToInsert[0] ? {
                            country_code: itemsToInsert[0].country_code,
                            city_code: itemsToInsert[0].city_code,
                            section: itemsToInsert[0].section,
                            item_index: itemsToInsert[0].item_index,
                            title: itemsToInsert[0].title,
                            hasContent: !!itemsToInsert[0].content,
                            contentType: Array.isArray(itemsToInsert[0].content) ? 'array' : typeof itemsToInsert[0].content,
                        } : null,
                    };
                    console.error("Error saving default travel info:", errorDetails);
                    // 에러를 throw하지 않고 조용히 실패 (기본 데이터는 여전히 반환됨)
                    return;
                }
                
                console.log(`Successfully saved ${itemsToInsert.length} items to database`);
            }
        } catch (err) {
            console.error("Failed to save default travel info:", err);
            // 에러를 throw하지 않고 조용히 실패
        }
    };

    const [travelInfo, setTravelInfo] = useState<any>({
        transport: { title: "대중교통", items: [] },
        culture: { title: "문화/팁", items: [] },
        festivals: { title: "축제/이벤트", items: [] },
        conversation: { title: "회화", items: [] },
        links: { title: "링크 모음", items: [] },
    });
    const [editingItem, setEditingItem] = useState<{
        section: string;
        index: number;
        item: any;
    } | null>(null);
    const [editForm, setEditForm] = useState({
        title: "",
        date: "",
        content: [] as string[],
        links: [] as Array<{ name: string; url: string; note?: string }>,
    });

    // 페이지네이션 상태 (각 섹션별로 관리)
    const [currentPages, setCurrentPages] = useState<Record<string, number>>({
        transport: 1,
        culture: 1,
        festivals: 1,
        conversation: 1,
        links: 1,
    });
    const ITEMS_PER_PAGE = 5; // 페이지당 항목 수

    // 페이지네이션 헬퍼 함수
    const getPaginatedItems = (items: any[], section: string) => {
        const currentPage = currentPages[section] || 1;
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return items.slice(startIndex, endIndex);
    };

    const getTotalPages = (items: any[]) => {
        return Math.ceil(items.length / ITEMS_PER_PAGE);
    };

    const handlePageChange = (section: string, page: number) => {
        setCurrentPages((prev) => ({
            ...prev,
            [section]: page,
        }));
    };

    // 탭 변경 시 해당 섹션의 페이지를 1로 리셋
    const handleTabChange = (value: string) => {
        setCurrentPages((prev) => ({
            ...prev,
            [value]: 1,
        }));
    };

    useEffect(() => {
        loadTravelInfoFromDB(selectedCountry, selectedCity).then((info) => {
            setTravelInfo(info);
        });
        // 나라/도시 변경 시 모든 섹션의 페이지를 1로 리셋
        setCurrentPages({
            transport: 1,
            culture: 1,
            festivals: 1,
            conversation: 1,
            links: 1,
        });
    }, [selectedCountry, selectedCity]);

    const handleEdit = (section: string, index: number) => {
        const sectionData = travelInfo[section as keyof typeof travelInfo];
        if (!sectionData || !sectionData.items) return;
        
        const item = sectionData.items[index];
        setEditingItem({ section, index, item });
        
        if (section === "links") {
            setEditForm({
                title: item.title || "",
                date: "",
                content: [],
                links: item.links || [],
            });
        } else {
            setEditForm({
                title: item.title || "",
                date: item.date || "",
                content: item.content || [],
                links: [],
            });
        }
    };

    const handleSave = async () => {
        if (!editingItem) return;
        
        const { section, index } = editingItem;
        const updatedInfo = { ...travelInfo };
        const sectionData = updatedInfo[section as keyof typeof updatedInfo];
        
        if (!sectionData || !sectionData.items) return;
        
        const updatedItems = [...sectionData.items];
        
        // 아이콘 이름 찾기
        let iconName = "Globe";
        if (updatedItems[index] && updatedItems[index].icon) {
            Object.keys(ICON_MAP).forEach((key) => {
                if (ICON_MAP[key] === updatedItems[index].icon) {
                    iconName = key;
                }
            });
        }
        
        if (section === "links") {
            updatedItems[index] = {
                ...updatedItems[index],
                title: editForm.title,
                links: editForm.links,
            };
        } else {
            updatedItems[index] = {
                ...updatedItems[index],
                title: editForm.title,
                date: editForm.date,
                content: editForm.content,
            };
        }
        
        // 데이터베이스에 저장
        try {
            const { error } = await supabase
                .from("travel_info")
                .update({
                    title: editForm.title,
                    date: section === "festivals" ? editForm.date : null,
                    content: section === "links" ? editForm.links : editForm.content,
                    icon: iconName,
                })
                .eq("country_code", selectedCountry)
                .eq("city_code", selectedCity)
                .eq("section", section)
                .eq("item_index", index);

            if (error) {
                console.error("Error updating travel info:", error);
                alert("저장 중 오류가 발생했습니다.");
                return;
            }
        } catch (err) {
            console.error("Failed to update travel info:", err);
            alert("저장 중 오류가 발생했습니다.");
            return;
        }
        
        updatedInfo[section as keyof typeof updatedInfo] = {
            ...sectionData,
            items: updatedItems,
        };
        
        setTravelInfo(updatedInfo);
        setEditingItem(null);
        setEditForm({ title: "", date: "", content: [], links: [] });
    };

    const handleDelete = async (section: string, index: number) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        
        const sectionData = travelInfo[section as keyof typeof travelInfo];
        if (!sectionData || !sectionData.items || !sectionData.items[index]) {
            alert("삭제할 항목을 찾을 수 없습니다.");
            return;
        }

        try {
            console.log("Deleting item:", { section, index, country: selectedCountry, city: selectedCity });
            
            // 삭제 전 항목 존재 확인
            const { data: itemToDelete, error: findError } = await supabase
                .from("travel_info")
                .select("id, item_index, title")
                .eq("country_code", selectedCountry)
                .eq("city_code", selectedCity)
                .eq("section", section)
                .eq("item_index", index)
                .maybeSingle();

            if (findError) {
                console.error("Error finding item to delete:", findError);
                alert(`항목을 찾는 중 오류가 발생했습니다: ${findError.message}`);
                return;
            }

            if (!itemToDelete) {
                console.warn("Item not found for deletion");
                alert("삭제할 항목을 찾을 수 없습니다.");
                return;
            }

            console.log("Found item to delete:", itemToDelete);

            // item_index를 직접 사용하여 삭제
            const { error: deleteError } = await supabase
                .from("travel_info")
                .delete()
                .eq("id", itemToDelete.id);

            if (deleteError) {
                console.error("Error deleting travel info:", deleteError);
                alert(`삭제 중 오류가 발생했습니다: ${deleteError.message}`);
                return;
            }

            // 삭제가 실제로 되었는지 확인
            const { data: verifyDelete, error: verifyError } = await supabase
                .from("travel_info")
                .select("id")
                .eq("id", itemToDelete.id)
                .maybeSingle();

            if (verifyError) {
                console.error("Error verifying deletion:", verifyError);
            } else if (verifyDelete) {
                console.warn("Item still exists after deletion. This might be a RLS policy issue.");
                alert("삭제 권한이 없습니다. 로그인 상태를 확인해주세요.");
                return;
            }

            console.log("Item successfully deleted");

            // 삭제 후 인덱스 재정렬 (삭제된 인덱스보다 큰 항목들의 인덱스를 1씩 감소)
            const deletedIndex = itemToDelete.item_index;
            const { data: remainingItems, error: remainingError } = await supabase
                .from("travel_info")
                .select("id, item_index")
                .eq("country_code", selectedCountry)
                .eq("city_code", selectedCity)
                .eq("section", section)
                .gt("item_index", deletedIndex)
                .order("item_index");

            if (remainingError) {
                console.error("Error fetching remaining items:", remainingError);
            } else if (remainingItems && remainingItems.length > 0) {
                console.log("Reordering indices for", remainingItems.length, "items");
                // 인덱스 재정렬
                const updatePromises = remainingItems.map((item) =>
                    supabase
                        .from("travel_info")
                        .update({ item_index: item.item_index - 1 })
                        .eq("id", item.id)
                );

                const updateResults = await Promise.all(updatePromises);
                const updateErrors = updateResults.filter((result) => result.error);
                
                if (updateErrors.length > 0) {
                    console.error("Error updating indices:", updateErrors);
                } else {
                    console.log("Successfully reordered indices");
                }
            }

            // 데이터베이스에서 다시 로드하여 UI 동기화
            console.log("Reloading travel info from database...");
            const refreshedInfo = await loadTravelInfoFromDB(selectedCountry, selectedCity);
            setTravelInfo(refreshedInfo);
            console.log("Travel info reloaded successfully");
            
        } catch (err) {
            console.error("Failed to delete travel info:", err);
            alert(`삭제 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <header className="flex items-center gap-3">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">여행 정보</h1>
            </header>

            {/* 나라/도시 선택 */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">나라 선택</label>
                        <Select value={selectedCountry} onValueChange={(value) => {
                            setSelectedCountry(value);
                            const country = COUNTRIES.find((c) => c.code === value);
                            if (country && country.cities.length > 0) {
                                setSelectedCity(country.cities[0].code);
                            }
                        }}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {COUNTRIES.map((country) => (
                                    <SelectItem key={country.code} value={country.code}>
                                        {country.flag} {country.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">도시 선택</label>
                        <Select value={selectedCity} onValueChange={setSelectedCity}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {currentCountry.cities.map((city) => (
                                    <SelectItem key={city.code} value={city.code}>
                                        {city.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>
                            {currentCountry.flag} {currentCountry.name} · {currentCity.name}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* 로딩 상태 */}
            {loading && (
                <Card>
                    <CardContent className="p-4 text-center text-muted-foreground">
                        데이터를 불러오는 중...
                    </CardContent>
                </Card>
            )}

            {/* 상세 정보 탭 */}
            <Tabs defaultValue="transport" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="transport">대중교통</TabsTrigger>
                    <TabsTrigger value="culture">문화/팁</TabsTrigger>
                    <TabsTrigger value="festivals">축제/이벤트</TabsTrigger>
                    <TabsTrigger value="conversation">회화</TabsTrigger>
                    <TabsTrigger value="links">링크</TabsTrigger>
                </TabsList>

                <TabsContent value="transport" className="space-y-4 mt-4">
                    {travelInfo.transport.items.length > 0 ? (
                        <>
                            {getPaginatedItems(travelInfo.transport.items, "transport").map((item, pageIndex) => {
                                const originalIndex = (currentPages.transport - 1) * ITEMS_PER_PAGE + pageIndex;
                                return (
                                    <Card key={originalIndex}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <item.icon className="w-5 h-5 text-blue-500" />
                                                    <h3 className="font-semibold text-lg">{item.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit("transport", originalIndex)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => handleDelete("transport", originalIndex)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                {item.content.map((text, i) => (
                                                    <p key={i}>• {text}</p>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            {getTotalPages(travelInfo.transport.items) > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange("transport", currentPages.transport - 1)}
                                        disabled={currentPages.transport === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        {currentPages.transport} / {getTotalPages(travelInfo.transport.items)}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange("transport", currentPages.transport + 1)}
                                        disabled={currentPages.transport >= getTotalPages(travelInfo.transport.items)}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <Card>
                            <CardContent className="p-4 text-center text-muted-foreground">
                                {currentCity.name}의 대중교통 정보를 준비 중입니다.
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="culture" className="space-y-4 mt-4">
                    {travelInfo.culture.items.length > 0 ? (
                        <>
                            {getPaginatedItems(travelInfo.culture.items, "culture").map((item, pageIndex) => {
                                const originalIndex = (currentPages.culture - 1) * ITEMS_PER_PAGE + pageIndex;
                                return (
                                    <Card key={originalIndex}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <item.icon className="w-5 h-5 text-orange-500" />
                                                    <h3 className="font-semibold text-lg">{item.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit("culture", originalIndex)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => handleDelete("culture", originalIndex)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                {item.content.map((text, i) => (
                                                    <p key={i}>• {text}</p>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            {getTotalPages(travelInfo.culture.items) > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange("culture", currentPages.culture - 1)}
                                        disabled={currentPages.culture === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        {currentPages.culture} / {getTotalPages(travelInfo.culture.items)}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange("culture", currentPages.culture + 1)}
                                        disabled={currentPages.culture >= getTotalPages(travelInfo.culture.items)}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <Card>
                            <CardContent className="p-4 text-center text-muted-foreground">
                                {currentCity.name}의 문화/팁 정보를 준비 중입니다.
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="festivals" className="space-y-4 mt-4">
                    {travelInfo.festivals.items.length > 0 ? (
                        <>
                            {getPaginatedItems(travelInfo.festivals.items, "festivals").map((item, pageIndex) => {
                                const originalIndex = (currentPages.festivals - 1) * ITEMS_PER_PAGE + pageIndex;
                                return (
                                    <Card key={originalIndex}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <item.icon className="w-5 h-5 text-purple-500" />
                                                    <h3 className="font-semibold text-lg">{item.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit("festivals", originalIndex)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => handleDelete("festivals", originalIndex)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {item.date && (
                                                <div className="mb-3">
                                                    <span className="text-sm font-medium text-primary">{item.date}</span>
                                                </div>
                                            )}
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                {item.content.map((text, i) => (
                                                    <p key={i}>• {text}</p>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            {getTotalPages(travelInfo.festivals.items) > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange("festivals", currentPages.festivals - 1)}
                                        disabled={currentPages.festivals === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        {currentPages.festivals} / {getTotalPages(travelInfo.festivals.items)}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange("festivals", currentPages.festivals + 1)}
                                        disabled={currentPages.festivals >= getTotalPages(travelInfo.festivals.items)}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <Card>
                            <CardContent className="p-4 text-center text-muted-foreground">
                                {currentCity.name}의 축제/이벤트 정보를 준비 중입니다.
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="conversation" className="space-y-4 mt-4">
                    {travelInfo.conversation && travelInfo.conversation.items.length > 0 ? (
                        <>
                            {getPaginatedItems(travelInfo.conversation.items, "conversation").map((item, pageIndex) => {
                                const originalIndex = (currentPages.conversation - 1) * ITEMS_PER_PAGE + pageIndex;
                                return (
                                    <Card key={originalIndex}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <item.icon className="w-5 h-5 text-green-500" />
                                                    <h3 className="font-semibold text-lg">{item.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit("conversation", originalIndex)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => handleDelete("conversation", originalIndex)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                {item.content.map((text, i) => (
                                                    <p key={i} className="text-muted-foreground">• {text}</p>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            {getTotalPages(travelInfo.conversation.items) > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange("conversation", currentPages.conversation - 1)}
                                        disabled={currentPages.conversation === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        {currentPages.conversation} / {getTotalPages(travelInfo.conversation.items)}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange("conversation", currentPages.conversation + 1)}
                                        disabled={currentPages.conversation >= getTotalPages(travelInfo.conversation.items)}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <Card>
                            <CardContent className="p-4 text-center text-muted-foreground">
                                {currentCity.name}의 회화 정보를 준비 중입니다.
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="links" className="space-y-4 mt-4">
                    {travelInfo.links && travelInfo.links.items.length > 0 ? (
                        <>
                            {getPaginatedItems(travelInfo.links.items, "links").map((item, pageIndex) => {
                                const originalIndex = (currentPages.links - 1) * ITEMS_PER_PAGE + pageIndex;
                                return (
                                    <Card key={originalIndex}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <item.icon className="w-5 h-5 text-indigo-500" />
                                                    <h3 className="font-semibold text-lg">{item.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit("links", originalIndex)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => handleDelete("links", originalIndex)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {item.links.map((link, i) => (
                                                    <a
                                                        key={i}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group"
                                                    >
                                                        <div className="flex-1">
                                                            <span className="text-sm font-medium text-foreground group-hover:text-primary">
                                                                {link.name}
                                                            </span>
                                                            {link.note && (
                                                                <span className="text-xs text-muted-foreground ml-2">
                                                                    ({link.note})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                                    </a>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            {getTotalPages(travelInfo.links.items) > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange("links", currentPages.links - 1)}
                                        disabled={currentPages.links === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        {currentPages.links} / {getTotalPages(travelInfo.links.items)}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange("links", currentPages.links + 1)}
                                        disabled={currentPages.links >= getTotalPages(travelInfo.links.items)}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <Card>
                            <CardContent className="p-4 text-center text-muted-foreground">
                                {currentCity.name}의 링크 정보를 준비 중입니다.
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* 수정 다이얼로그 */}
            <Dialog open={editingItem !== null} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>항목 수정</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">제목</Label>
                            <Input
                                id="edit-title"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            />
                        </div>
                        {editingItem?.section === "festivals" && (
                            <div className="space-y-2">
                                <Label htmlFor="edit-date">날짜</Label>
                                <Input
                                    id="edit-date"
                                    value={editForm.date}
                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                    placeholder="예: 1월 8일 (목) ~ 1월 25일 (일)"
                                />
                            </div>
                        )}
                        {editingItem?.section === "links" ? (
                            <div className="space-y-4">
                                <Label>링크 목록</Label>
                                {editForm.links.map((link, index) => (
                                    <div key={index} className="space-y-2 p-3 border rounded-md">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">링크 {index + 1}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive"
                                                onClick={() => {
                                                    const newLinks = editForm.links.filter((_, i) => i !== index);
                                                    setEditForm({ ...editForm, links: newLinks });
                                                }}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <Input
                                            placeholder="링크 이름"
                                            value={link.name}
                                            onChange={(e) => {
                                                const newLinks = [...editForm.links];
                                                newLinks[index] = { ...newLinks[index], name: e.target.value };
                                                setEditForm({ ...editForm, links: newLinks });
                                            }}
                                        />
                                        <Input
                                            placeholder="URL"
                                            value={link.url}
                                            onChange={(e) => {
                                                const newLinks = [...editForm.links];
                                                newLinks[index] = { ...newLinks[index], url: e.target.value };
                                                setEditForm({ ...editForm, links: newLinks });
                                            }}
                                        />
                                        <Input
                                            placeholder="참고사항 (선택)"
                                            value={link.note || ""}
                                            onChange={(e) => {
                                                const newLinks = [...editForm.links];
                                                newLinks[index] = { ...newLinks[index], note: e.target.value };
                                                setEditForm({ ...editForm, links: newLinks });
                                            }}
                                        />
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditForm({
                                            ...editForm,
                                            links: [...editForm.links, { name: "", url: "" }],
                                        });
                                    }}
                                >
                                    링크 추가
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="edit-content">내용 (한 줄에 하나씩 입력)</Label>
                                <Textarea
                                    id="edit-content"
                                    value={editForm.content.join("\n")}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            content: e.target.value.split("\n").filter((line) => line.trim()),
                                        })
                                    }
                                    rows={10}
                                    placeholder="각 항목을 한 줄씩 입력하세요"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingItem(null)}>
                            취소
                        </Button>
                        <Button onClick={handleSave}>저장</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
