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
    Globe
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function HelpPage() {
    return (
        <div className="p-4 pb-24 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">도움말</h1>
            </div>

            {/* 앱 소개 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        J여관 소개
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                        J여관은 가족 여행을 체계적으로 관리할 수 있는 올인원 여행 관리 앱입니다.
                    </p>
                    <p>
                        일정, 지출, 장소, 일기, 메모를 한 곳에서 관리하고, 여러 여행을 동시에 관리할 수 있습니다.
                    </p>
                </CardContent>
            </Card>

            {/* 주요 기능 */}
            <Card>
                <CardHeader>
                    <CardTitle>주요 기능</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* 일정 관리 */}
                    <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <span className="font-semibold">일정 관리</span>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 px-3 pb-3 space-y-2 text-sm text-muted-foreground">
                            <p>• 날짜별로 여행 일정을 추가하고 관리할 수 있습니다</p>
                            <p>• 일정 유형: 관광, 식사, 이동, 휴식, 쇼핑, 키즈</p>
                            <p>• 일정에서 바로 지출을 추가할 수 있습니다</p>
                            <p>• 연동된 지출 목록을 확인할 수 있습니다</p>
                            <p>• 장소를 일정에 연결할 수 있습니다</p>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* 지출 관리 */}
                    <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                <span className="font-semibold">지출 관리</span>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 px-3 pb-3 space-y-2 text-sm text-muted-foreground">
                            <p>• 일일 지출을 기록하고 관리할 수 있습니다</p>
                            <p>• 여러 통화 지원: AUD, USD, VND, KRW</p>
                            <p>• 카테고리별 지출 분류: 식사, 교통, 숙박, 활동, 쇼핑, 기타</p>
                            <p>• 예산 설정 및 예산 대비 지출 현황 확인</p>
                            <p>• 지출 통계 및 분석 기능</p>
                            <p>• 일정과 연동하여 지출 추적</p>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* 장소 관리 */}
                    <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-red-500" />
                                <span className="font-semibold">장소 관리</span>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 px-3 pb-3 space-y-2 text-sm text-muted-foreground">
                            <p>• 방문하고 싶은 장소를 미리 저장할 수 있습니다</p>
                            <p>• 카테고리: 관광, 맛집, 쇼핑, 놀이터/키즈, 전시, 병원/약국, 시장</p>
                            <p>• 장소 상세 정보: 주소, 운영시간, 연락처, 웹사이트, 구글맵 링크</p>
                            <p>• 별점 및 아이 동반 추천 기능</p>
                            <p>• 장소를 일정에 바로 추가할 수 있습니다</p>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* 일기 관리 */}
                    <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-purple-500" />
                                <span className="font-semibold">일기 관리</span>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 px-3 pb-3 space-y-2 text-sm text-muted-foreground">
                            <p>• 여행 중 하루하루를 기록할 수 있습니다</p>
                            <p>• 기분 태그: 행복, 신남, 편안, 피곤, 아픔, 보통</p>
                            <p>• 하이라이트 기능으로 특별한 순간 강조</p>
                            <p>• <Badge variant="outline" className="ml-1">NEW</Badge> 사진 첨부 기능으로 추억을 더 풍부하게</p>
                            <p>• 날짜별, 기분별 필터링 기능</p>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* 메모 관리 */}
                    <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-orange-500" />
                                <span className="font-semibold">메모 관리</span>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 px-3 pb-3 space-y-2 text-sm text-muted-foreground">
                            <p>• 여행 중 필요한 정보를 메모로 저장할 수 있습니다</p>
                            <p>• 제목과 내용으로 구성된 메모 작성</p>
                            <p>• 제목만 표시되고 클릭 시 본문을 펼쳐볼 수 있습니다</p>
                            <p>• 여러 메모를 작성하고 관리할 수 있습니다</p>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* 체크리스트 */}
                    <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                            <div className="flex items-center gap-3">
                                <CheckSquare className="w-5 h-5 text-teal-500" />
                                <span className="font-semibold">체크리스트</span>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 px-3 pb-3 space-y-2 text-sm text-muted-foreground">
                            <p>• 여행 준비물과 할 일을 체크리스트로 관리</p>
                            <p>• 완료된 항목은 체크하여 진행 상황을 추적</p>
                            <p>• 여행별로 독립적인 체크리스트 관리</p>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* 설정 */}
                    <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                            <div className="flex items-center gap-3">
                                <Settings className="w-5 h-5 text-zinc-500" />
                                <span className="font-semibold">설정</span>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 px-3 pb-3 space-y-2 text-sm text-muted-foreground">
                            <p>• 여러 여행을 생성하고 관리할 수 있습니다</p>
                            <p>• 여행 정보: 제목, 시작일, 종료일, 여행 구성원, 방문 도시</p>
                            <p>• 환율 설정: AUD, USD, VND 지원</p>
                            <p>• 데이터 내보내기/가져오기 기능</p>
                            <p>• 여행 통계 확인</p>
                        </CollapsibleContent>
                    </Collapsible>
                </CardContent>
            </Card>

            {/* 연동 기능 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" />
                        데이터 연동 기능
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="space-y-2">
                        <p className="font-semibold text-foreground">일정 ↔ 지출</p>
                        <p>• 일정에서 바로 지출을 추가할 수 있습니다</p>
                        <p>• 지출 목록에서 연동된 일정을 확인할 수 있습니다</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-foreground">장소 → 일정</p>
                        <p>• 장소 상세에서 "일정에 추가" 버튼으로 일정을 빠르게 생성</p>
                        <p>• 장소 정보가 일정에 자동으로 입력됩니다</p>
                    </div>
                </CardContent>
            </Card>

            {/* 사용 팁 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        사용 팁
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">여행 전환</p>
                        <p>설정 페이지에서 여행 카드를 클릭하여 다른 여행으로 전환할 수 있습니다.</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">환율 설정</p>
                        <p>여행 전에 환율을 미리 설정해두면 예산 관리가 더욱 편리합니다.</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">데이터 백업</p>
                        <p>설정 페이지에서 데이터를 내보내어 정기적으로 백업하는 것을 권장합니다.</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">일기 사진</p>
                        <p>여행 중 소중한 순간을 사진과 함께 기록하여 더 풍부한 추억을 남길 수 있습니다.</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">Dialog 스크롤</p>
                        <p>모든 Dialog에서 내용이 많아도 스크롤로 전체 내용을 확인할 수 있습니다.</p>
                    </div>
                </CardContent>
            </Card>

            {/* 빠른 링크 */}
            <Card>
                <CardHeader>
                    <CardTitle>빠른 링크</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/schedule" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors text-center">
                            <Calendar className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                            <span className="text-sm font-medium">일정</span>
                        </Link>
                        <Link href="/expenses" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors text-center">
                            <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-500" />
                            <span className="text-sm font-medium">지출</span>
                        </Link>
                        <Link href="/places" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors text-center">
                            <MapPin className="w-6 h-6 mx-auto mb-1 text-red-500" />
                            <span className="text-sm font-medium">장소</span>
                        </Link>
                        <Link href="/diary" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors text-center">
                            <BookOpen className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                            <span className="text-sm font-medium">일기</span>
                        </Link>
                        <Link href="/memo" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors text-center">
                            <FileText className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                            <span className="text-sm font-medium">메모</span>
                        </Link>
                        <Link href="/checklist" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-transparent hover:border-primary/20 transition-colors text-center">
                            <CheckSquare className="w-6 h-6 mx-auto mb-1 text-teal-500" />
                            <span className="text-sm font-medium">체크리스트</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* 버전 정보 */}
            <Card>
                <CardHeader>
                    <CardTitle>앱 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>J여관 v1.0</p>
                    <p>여행을 더 체계적으로, 더 즐겁게</p>
                </CardContent>
            </Card>
        </div>
    );
}
