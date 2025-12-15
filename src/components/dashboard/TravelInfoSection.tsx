"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bus, PartyPopper, Globe, Info } from "lucide-react";

export function TravelInfoSection() {
    const [isOpen, setIsOpen] = useState(false);
    const [defaultTab, setDefaultTab] = useState("transport");

    const openDialog = (tab: string) => {
        setDefaultTab(tab);
        setIsOpen(true);
    };

    return (
        <>
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">호주 여행 정보</h2>
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => openDialog("transport")}>
                        <Info className="w-4 h-4 mr-1" /> 더보기
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Card
                        className="cursor-pointer hover:bg-accent/50 transition-colors border-none shadow-sm bg-blue-50 dark:bg-blue-900/20"
                        onClick={() => openDialog("transport")}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-4 text-center gap-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300">
                                <Bus className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">대중교통</span>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:bg-accent/50 transition-colors border-none shadow-sm bg-orange-50 dark:bg-orange-900/20"
                        onClick={() => openDialog("culture")}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-4 text-center gap-2">
                            <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-full text-orange-600 dark:text-orange-300">
                                <Globe className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">문화/팁</span>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:bg-accent/50 transition-colors border-none shadow-sm bg-purple-50 dark:bg-purple-900/20"
                        onClick={() => openDialog("festivals")}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-4 text-center gap-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full text-purple-600 dark:text-purple-300">
                                <PartyPopper className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">축제</span>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[90vw] md:max-w-md max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>호주 여행 가이드 🇦🇺</DialogTitle>
                        <DialogDescription>
                            여행에 도움이 되는 필수 정보를 모았습니다.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue={defaultTab} className="mt-2">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="transport">대중교통</TabsTrigger>
                            <TabsTrigger value="culture">문화/팁</TabsTrigger>
                            <TabsTrigger value="festivals">축제</TabsTrigger>
                        </TabsList>

                        <TabsContent value="culture" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg flex items-center gap-2">🌞 자외선 주의</h3>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                    <p>• 호주의 자외선은 한국보다 5~6배 강합니다!</p>
                                    <p>• 선크림은 외출 20분 전 필수, 선글라스와 모자도 꼭 챙겨주세요.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg flex items-center gap-2">💧 물과 식당</h3>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                    <p>• 수돗물(Tap Water)은 마셔도 안전합니다. 식당에서 'Tap water please' 하면 무료 물을 줍니다.</p>
                                    <p>• 팁 문화는 필수가 아니지만, 고급 레스토랑이나 좋은 서비스에는 10% 정도 줄 수 있습니다.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg flex items-center gap-2">🔌 전압 (Plug)</h3>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                    <p>• 230V, 50Hz를 사용하며 콘센트 모양이 '삼발이' 형태(Type I)입니다.</p>
                                    <p>• 멀티 어댑터를 꼭 챙겨가세요!</p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="transport" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Bus className="w-5 h-5 text-blue-500" /> 오팔 카드 (Opal Card)
                                </h3>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                    <p>• 시드니의 티머니! 편의점이나 역에서 쉽게 구매/충전 가능합니다.</p>
                                    <p>• <strong>트래블월렛/트래블로그 카드</strong>로도 바로 찍고 탈 수 있어요! (추천 👍)</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg flex items-center gap-2">💰 요금 정보 (Opal Fares)</h3>
                                <div className="border rounded-md overflow-hidden text-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="p-2 font-medium">구분 (Cap)</th>
                                                <th className="p-2 font-medium">어른 (Adult)</th>
                                                <th className="p-2 font-medium">어린이 (Child)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            <tr>
                                                <td className="p-2">일일 한도 (평일)</td>
                                                <td className="p-2">$19.30</td>
                                                <td className="p-2">$9.65</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2">일일 한도 (주말/공휴일)</td>
                                                <td className="p-2 text-green-600 font-bold">$9.65</td>
                                                <td className="p-2 text-green-600 font-bold">$4.80</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2">주간 한도 (Weekly)</td>
                                                <td className="p-2">$50.00</td>
                                                <td className="p-2">$25.00</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className="p-2 bg-muted/50 text-xs text-muted-foreground">
                                        * 만 4세~15세는 어린이 요금 적용 (만 3세 이하 무료)<br />
                                        * 일요일에 <strong>$2.80</strong>(일 요금 한도) 행사는 종료되었습니다.
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg flex items-center gap-2">🚌 버스 & 트램 (Light Rail)</h3>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                    <p>• 승차/하차 시 모두 카드를 태그해야 합니다.</p>
                                    <p>• 버스는 안내 방송이 잘 안 나오므로 구글 맵을 켜고 가는 것이 좋습니다.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg flex items-center gap-2">🚕 우버 (Uber)</h3>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                    <p>• 가족 여행 시 가까운 거리는 우버가 더 저렴하고 편할 수 있습니다.</p>
                                    <p>• 카시트가 필요한 경우 'Uber Family' 옵션을 확인하세요.</p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="festivals" className="space-y-4 mt-4">
                            {/* 기존 축제 섹션 */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-xl flex items-center gap-2 border-b pb-2">🎉 주요 축제</h3>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">🎭 시드니 페스티벌 (Sydney Festival)</h3>
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                        <p>• <strong>1월 8일 ~ 1월 25일</strong></p>
                                        <p>• 도시 전체가 예술 무대로 변신합니다! 오페라하우스와 하이드파크 등에서 연극, 무용, 음악 공연이 열리며 무료 야외 이벤트도 많습니다.</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">🇦🇺 오스트레일리아 데이 (Australia Day)</h3>
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                        <p>• <strong>1월 26일</strong></p>
                                        <p>• 하버 브리지와 오페라하우스 주변에서 하루 종일 축제가 열립니다. 아침 원주민 의식부터 낮에는 선박 경주, 밤에는 불꽃놀이까지!</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">🧧 설날 축제 (Lunar New Year)</h3>
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                        <p>• <strong>2월 초중순 (차이나타운 & 달링하버)</strong></p>
                                        <p>• 아시아 밖에서 가장 큰 설날 축제 중 하나입니다. 거대한 등불 전시와 사자춤, 드래곤 보트 경주(달링하버)를 놓치지 마세요.</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">🏳️‍🌈 마디그라 (Mardi Gras)</h3>
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                        <p>• <strong>2월 15일 ~ 3월 1일</strong></p>
                                        <p>• 세계 최대의 LGBTQIA+ 축제입니다. 2월 중순 'Fair Day'를 시작으로 축제 분위기가 고조되며, 2월 말/3월 초 퍼레이드가 하이라이트입니다.</p>
                                    </div>
                                </div>
                            </div>

                            {/* 새로운 스포츠 & 문화 섹션 */}
                            <div className="space-y-4 pt-4">
                                <h3 className="font-bold text-xl flex items-center gap-2 border-b pb-2">⚽ 스포츠 & 문화 (Sports & Culture)</h3>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">🎾 유나이티드 컵 (United Cup Tennis)</h3>
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                        <p>• <strong>12월 27일 ~ 1월 5일 (Ken Rosewall Arena)</strong></p>
                                        <p>• 호주 오픈의 전초전! 세계적인 테니스 스타들을 가까이서 볼 수 있는 기회입니다.</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">🏏 핑크 테스트 크리켓 (The Pink Test)</h3>
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                        <p>• <strong>1월 초 (Sydney Cricket Ground)</strong></p>
                                        <p>• 호주 대표 스포츠 크리켓! SCG가 핑크색으로 물드는 장관을 볼 수 있습니다.</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">🎼 백 투 더 퓨처 뮤지컬</h3>
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                        <p>• <strong>~ 1월 25일까지 (Sydney Lyric Theatre)</strong></p>
                                        <p>• 전설적인 영화가 무대로! 가족 모두가 즐길 수 있는 신나는 뮤지컬입니다.</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    );
}
