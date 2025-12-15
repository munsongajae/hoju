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

                        <TabsContent value="festivals" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg flex items-center gap-2">🎆 새해 전야 불꽃놀이</h3>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                    <p>• <strong>12월 31일</strong> 하버브릿지와 오페라하우스 주변에서 열리는 세계적인 축제입니다.</p>
                                    <p>• 명당 자리는 아침 일찍부터 맡아야 하며, 일부 유료 구역은 예매가 필요합니다.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg flex items-center gap-2">💡 비비드 시드니 (Vivid Sydney)</h3>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                    <p>• 보통 <strong>5월 말 ~ 6월 중순</strong>에 열리는 빛과 음악의 축제입니다.</p>
                                    <p>• 오페라하우스 조명쇼가 하이라이트입니다.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg flex items-center gap-2">🥊 박싱 데이 (Boxing Day)</h3>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md space-y-2">
                                    <p>• <strong>12월 26일</strong>은 호주 최대의 쇼핑 할인 시즌입니다.</p>
                                    <p>• 백화점과 쇼핑몰에서 큰 폭의 할인을 진행합니다.</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    );
}
