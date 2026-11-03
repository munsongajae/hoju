"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    DollarSign,
    MapPin,
    BookOpen,
    Settings,
    CheckSquare,
    FileText,
    Image,
    Link as LinkIcon,
    TrendingUp,
    Globe,
    Sparkles,
    Share2,
    FileSpreadsheet
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";

export default function HelpPage() {
    const { t, i18n } = useTranslation();
    const language = i18n.resolvedLanguage ?? i18n.language ?? "ko";
    const isEn = language.startsWith("en");

    const featureGroups = isEn
        ? [
              {
                  key: "schedule",
                  icon: Calendar,
                  iconClass: "text-blue-500",
                  title: "Schedule Management",
                  items: [
                      "Add and manage travel schedules by day.",
                      "Schedule types: sightseeing, meal, move, rest, shopping, kids.",
                      "Add expenses directly from a schedule.",
                      "Check linked expense list per schedule.",
                      "Link places to your schedule.",
                  ],
              },
              {
                  key: "expenses",
                  icon: DollarSign,
                  iconClass: "text-green-500",
                  title: "Expense Management",
                  items: [
                      "Record and manage daily spending.",
                      "Multi-currency support: AUD, USD, VND, KRW.",
                      "Category classification for clearer tracking.",
                      "Budget setup and usage overview.",
                      "Statistics and trend analysis.",
                      "Track spending connected to schedules.",
                  ],
              },
              {
                  key: "places",
                  icon: MapPin,
                  iconClass: "text-red-500",
                  title: "Place Management",
                  items: [
                      "Save places you want to visit in advance.",
                      "Categories for tourism, food, shopping, kids, and more.",
                      "Store address, opening hours, contact, website, and map link.",
                      "Support rating and kid-friendly tags.",
                      "Add a place directly into schedule.",
                  ],
              },
              {
                  key: "diary",
                  icon: BookOpen,
                  iconClass: "text-purple-500",
                  title: "Diary Management",
                  items: [
                      "Write daily travel diary entries.",
                      "Attach photos to preserve memories.",
                      "Filter entries by date range.",
                  ],
              },
              {
                  key: "memo",
                  icon: FileText,
                  iconClass: "text-orange-500",
                  title: "Memo Management",
                  items: [
                      "Save important notes during travel.",
                      "Create memo with title and body.",
                      "Manage multiple memos by trip.",
                  ],
              },
              {
                  key: "checklist",
                  icon: CheckSquare,
                  iconClass: "text-teal-500",
                  title: "Checklist",
                  items: [
                      "Manage packing and todo items.",
                      "Track progress with completion checks.",
                      "Independent checklist per trip.",
                  ],
              },
              {
                  key: "settings",
                  icon: Settings,
                  iconClass: "text-zinc-500",
                  title: "Settings",
                  items: [
                      "Create and manage multiple trips.",
                      "Set title, date range, members, and cities.",
                      "Configure exchange rate preferences.",
                      "Export/import backup data.",
                  ],
              },
          ]
        : [
              {
                  key: "schedule",
                  icon: Calendar,
                  iconClass: "text-blue-500",
                  title: "일정 관리",
                  items: [
                      "날짜별로 여행 일정을 추가하고 관리할 수 있습니다",
                      "일정 유형: 관광, 식사, 이동, 휴식, 쇼핑, 키즈",
                      "일정에서 바로 지출을 추가할 수 있습니다",
                      "연동된 지출 목록을 확인할 수 있습니다",
                      "장소를 일정에 연결할 수 있습니다",
                  ],
              },
              {
                  key: "expenses",
                  icon: DollarSign,
                  iconClass: "text-green-500",
                  title: "지출 관리",
                  items: [
                      "일일 지출을 기록하고 관리할 수 있습니다",
                      "여러 통화 지원: AUD, USD, VND, KRW",
                      "카테고리별 지출 분류로 관리가 쉽습니다",
                      "예산 설정 및 예산 대비 지출 현황 확인",
                      "지출 통계 및 분석 기능",
                      "일정과 연동하여 지출 추적",
                  ],
              },
              {
                  key: "places",
                  icon: MapPin,
                  iconClass: "text-red-500",
                  title: "장소 관리",
                  items: [
                      "방문하고 싶은 장소를 미리 저장할 수 있습니다",
                      "관광, 맛집, 쇼핑, 키즈 등 카테고리 지원",
                      "주소, 운영시간, 연락처, 웹사이트, 구글맵 링크 저장",
                      "별점 및 아이 동반 추천 기능",
                      "장소를 일정에 바로 추가할 수 있습니다",
                  ],
              },
              {
                  key: "diary",
                  icon: BookOpen,
                  iconClass: "text-purple-500",
                  title: "일기 관리",
                  items: [
                      "여행 중 하루하루를 기록할 수 있습니다",
                      "사진 첨부 기능으로 추억을 더 풍부하게 남길 수 있습니다",
                      "날짜 범위로 필터링할 수 있습니다",
                  ],
              },
              {
                  key: "memo",
                  icon: FileText,
                  iconClass: "text-orange-500",
                  title: "메모 관리",
                  items: [
                      "여행 중 필요한 정보를 메모로 저장할 수 있습니다",
                      "제목과 내용으로 구성된 메모 작성",
                      "여러 메모를 작성하고 관리할 수 있습니다",
                  ],
              },
              {
                  key: "checklist",
                  icon: CheckSquare,
                  iconClass: "text-teal-500",
                  title: "체크리스트",
                  items: [
                      "여행 준비물과 할 일을 체크리스트로 관리",
                      "완료된 항목 체크로 진행 상황 추적",
                      "여행별로 독립적인 체크리스트 관리",
                  ],
              },
              {
                  key: "settings",
                  icon: Settings,
                  iconClass: "text-zinc-500",
                  title: "설정",
                  items: [
                      "여러 여행을 생성하고 관리할 수 있습니다",
                      "여행 정보(제목, 기간, 인원, 도시)를 관리합니다",
                      "환율 설정을 조정할 수 있습니다",
                      "데이터 내보내기/가져오기 기능",
                  ],
              },
          ];

    return (
        <div className="p-4 pb-24 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t("help.title")}</h1>
            </div>

            {/* 앱 소개 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        {t("help.intro.title")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                        {isEn
                            ? "J-inn is a complete travel management solution for people who love planning in detail."
                            : "J여관은 철저한 계획을 사랑하는 사람을 위한 여행 관리 솔루션입니다."}
                    </p>
                    <p>
                        {isEn
                            ? "Manage schedule, expenses, places, diary, and memo in one place so your plan stays organized."
                            : "일정, 지출, 장소, 일기, 메모를 한 곳에서 빈틈없이 관리하세요."}
                    </p>
                </CardContent>
            </Card>

            {/* 핵심 기능 및 도구 */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {t("help.core.title")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex gap-3">
                        <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
                        <div>
                            <p className="font-semibold text-foreground">{isEn ? "Schedule & Expense" : "일정 & 지출 관리"}</p>
                            <p className="text-xs mt-0.5">{isEn ? "Manage daily plans and track spending together." : "날짜별 일정을 관리하고 지출과 연동할 수 있습니다."}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Share2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div>
                            <p className="font-semibold text-foreground">{isEn ? "Share & Export" : "공유 & 내보내기"}</p>
                            <p className="text-xs mt-0.5">{isEn ? "Share as text or export to CSV." : "일정/지출 데이터를 텍스트로 공유하거나 CSV로 내보낼 수 있습니다."}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                            <p className="font-semibold text-foreground">{isEn ? "AI Assistance" : "AI 추천 기능"}</p>
                            <p className="text-xs mt-0.5">{isEn ? "Use AI to speed up planning." : "AI를 활용해 여행 준비를 빠르게 할 수 있습니다."}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-indigo-500 shrink-0" />
                        <div>
                            <p className="font-semibold text-foreground">{isEn ? "Travel Report" : "종합 리포트"}</p>
                            <p className="text-xs mt-0.5">{isEn ? "Generate a report from diary, expenses, and schedules." : "일기, 지출, 일정을 묶어 여행 리포트를 생성할 수 있습니다."}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* AI 추천 기능 사용법 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        {t("help.ai.title")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                        {isEn
                            ? "AI recommendation works with your own AI tools like ChatGPT or Gemini."
                            : "AI 추천은 앱 내부 자동 생성이 아니라, 사용자가 직접 ChatGPT/Gemini를 활용하는 방식입니다."}
                    </p>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">{isEn ? "Available tabs" : "사용 가능한 탭"}</p>
                        <p>{isEn ? "• Schedule: AI schedule generation" : "• 일정 탭: AI 일정 생성"}</p>
                        <p>{isEn ? "• Places: AI place suggestions" : "• 장소 탭: AI 추천 장소 추가"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">{isEn ? "How to use" : "사용 순서"}</p>
                        <p>{isEn ? "1) Copy the prompt from the app." : "1) 앱에서 제공하는 프롬프트를 복사합니다."}</p>
                        <p>{isEn ? "2) Paste it into ChatGPT or Gemini." : "2) ChatGPT 또는 Gemini에 프롬프트를 붙여넣습니다."}</p>
                        <p>{isEn ? "3) Copy JSON response from AI." : "3) AI가 반환한 JSON 결과를 복사합니다."}</p>
                        <p>{isEn ? "4) Paste JSON in app and import." : "4) 앱 입력창에 JSON을 붙여넣고 가져옵니다."}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">{isEn ? "Notes" : "주의 사항"}</p>
                        <p>{isEn ? "• Response must be valid JSON." : "• 반드시 JSON 형식으로만 응답받아야 합니다."}</p>
                        <p>{isEn ? "• Markdown/code fences can break parsing." : "• 코드블록이나 설명 문장이 섞이면 파싱 오류가 날 수 있습니다."}</p>
                    </div>
                </CardContent>
            </Card>

            {/* 주요 기능 */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("help.features.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {featureGroups.map((group) => {
                        const Icon = group.icon;
                        return (
                            <Collapsible key={group.key}>
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 ${group.iconClass}`} />
                                        <span className="font-semibold">{group.title}</span>
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-2 px-3 pb-3 space-y-2 text-sm text-muted-foreground">
                                    {group.items.map((item, idx) => (
                                        <p key={idx}>• {item}</p>
                                    ))}
                                    {group.key === "diary" && (
                                        <p>
                                            • <Badge variant="outline" className="ml-1">NEW</Badge> {isEn ? "Photo attachments" : "사진 첨부 기능"}
                                        </p>
                                    )}
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                </CardContent>
            </Card>

            {/* 연동 기능 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" />
                        {t("help.integration.title")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="space-y-2">
                        <p className="font-semibold text-foreground">{isEn ? "Schedule ↔ Expense" : "일정 ↔ 지출"}</p>
                        <p>{isEn ? "• Add expenses directly from schedule." : "• 일정에서 바로 지출을 추가할 수 있습니다"}</p>
                        <p>{isEn ? "• Check linked schedule from expense list." : "• 지출 목록에서 연동된 일정을 확인할 수 있습니다"}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-foreground">{isEn ? "Place → Schedule" : "장소 → 일정"}</p>
                        <p>{isEn ? "• Quickly create schedule from place detail." : "• 장소 상세에서 \"일정에 추가\" 버튼으로 일정을 빠르게 생성"}</p>
                        <p>{isEn ? "• Place info is auto-filled into schedule." : "• 장소 정보가 일정에 자동으로 입력됩니다"}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-foreground">{isEn ? "Backup ↔ Restore" : "백업 ↔ 복구"}</p>
                        <p>{isEn ? "• You can backup/restore full or section data in Settings." : "• 설정의 데이터 관리에서 전체/섹션별 백업 및 복구가 가능합니다"}</p>
                        <p>{isEn ? "• Import replaces existing section data." : "• 가져오기 시 해당 섹션의 기존 데이터는 교체됩니다"}</p>
                    </div>
                </CardContent>
            </Card>

            {/* 사용 팁 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        {t("help.tips.title")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">{isEn ? "Trip switching" : "여행 전환"}</p>
                        <p>{isEn ? "Switch trips by selecting trip cards in Settings." : "설정 페이지에서 여행 카드를 클릭하여 다른 여행으로 전환할 수 있습니다."}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">{isEn ? "Exchange rate setup" : "환율 설정"}</p>
                        <p>{isEn ? "Set preferred rates in advance for easier budgeting." : "여행 전에 환율을 미리 설정해두면 예산 관리가 더욱 편리합니다."}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">{isEn ? "Data backup" : "데이터 백업"}</p>
                        <p>{isEn ? "Export data regularly from Settings as backup." : "설정 페이지에서 데이터를 내보내어 정기적으로 백업하는 것을 권장합니다."}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">{isEn ? "Diary photos" : "일기 사진"}</p>
                        <p>{isEn ? "Attach photos to keep richer memories." : "여행 중 소중한 순간을 사진과 함께 기록하여 더 풍부한 추억을 남길 수 있습니다."}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">{isEn ? "Dialog scrolling" : "Dialog 스크롤"}</p>
                        <p>{isEn ? "All dialogs support scrolling for long content." : "모든 Dialog에서 내용이 많아도 스크롤로 전체 내용을 확인할 수 있습니다."}</p>
                    </div>
                </CardContent>
            </Card>

            {/* 빠른 링크 */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("help.quickLinks")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/schedule" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors text-center">
                            <Calendar className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                            <span className="text-sm font-medium">{isEn ? "Schedule" : "일정"}</span>
                        </Link>
                        <Link href="/expenses" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors text-center">
                            <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-500" />
                            <span className="text-sm font-medium">{isEn ? "Expenses" : "지출"}</span>
                        </Link>
                        <Link href="/places" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors text-center">
                            <MapPin className="w-6 h-6 mx-auto mb-1 text-red-500" />
                            <span className="text-sm font-medium">{isEn ? "Places" : "장소"}</span>
                        </Link>
                        <Link href="/diary" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors text-center">
                            <BookOpen className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                            <span className="text-sm font-medium">{isEn ? "Diary" : "일기"}</span>
                        </Link>
                        <Link href="/memo" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors text-center">
                            <FileText className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                            <span className="text-sm font-medium">{isEn ? "Memo" : "메모"}</span>
                        </Link>
                        <Link href="/checklist" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors text-center">
                            <CheckSquare className="w-6 h-6 mx-auto mb-1 text-teal-500" />
                            <span className="text-sm font-medium">{isEn ? "Checklist" : "체크리스트"}</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* 버전 정보 */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("help.appInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>J여관 v1.0</p>
                    <p>{isEn ? "Make travel more organized and enjoyable." : "여행을 더 체계적으로, 더 즐겁게"}</p>
                </CardContent>
            </Card>
        </div>
    );
}




