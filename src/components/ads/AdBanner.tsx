"use client";

import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";

const USE_TEST_ADS = process.env.NEXT_PUBLIC_ADMOB_USE_TEST_IDS !== "false";
const SHOW_AD_DEBUG_PLACEHOLDER =
    process.env.NEXT_PUBLIC_ADMOB_SHOW_DEBUG_PLACEHOLDER === "true";

// 네이티브 AdMob 배너는 BOTTOM_CENTER로 기기 최하단에 고정.
// MobileNav가 배너 위에 위치하도록 layout.tsx에서 패딩으로 공간을 확보한다.
const NATIVE_BANNER_BOTTOM_MARGIN = 0;

const TEST_AD_UNIT_IDS = {
    android: {
        banner: "ca-app-pub-3940256099942544/6300978111",
    },
    ios: {
        banner: "ca-app-pub-3940256099942544/2934735716",
    },
};

const PROD_AD_UNIT_IDS = {
    android: {
        banner: process.env.NEXT_PUBLIC_ADMOB_ANDROID_BANNER_ID ?? "",
    },
    ios: {
        banner: process.env.NEXT_PUBLIC_ADMOB_IOS_BANNER_ID ?? "",
    },
};

interface AdBannerProps {
    position?: "bottom" | "top";
    className?: string;
}

function getBannerAdUnitId(platform: "android" | "ios") {
    if (USE_TEST_ADS) return TEST_AD_UNIT_IDS[platform].banner;

    const productionAdUnitId = PROD_AD_UNIT_IDS[platform].banner.trim();
    if (productionAdUnitId) return productionAdUnitId;

    console.warn(
        `[AdMob] ${platform} 배너 광고 ID가 비어 있어 테스트 ID를 사용합니다.`
    );
    return TEST_AD_UNIT_IDS[platform].banner;
}

export function AdBanner({ position = "bottom", className = "" }: AdBannerProps) {
    const [adError, setAdError] = useState(false);
    const [adLoaded, setAdLoaded] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [isAppActive, setIsAppActive] = useState(true);
    const adMobRef = useRef<any>(null);
    const bannerOptionsRef = useRef<any>(null);
    const bannerVisibleRef = useRef(false);
    const desiredBannerVisibleRef = useRef(true);
    const operationInFlightRef = useRef(false);
    const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const resumeVerifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const watchdogTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearRetryTimer = () => {
        if (!retryTimerRef.current) return;
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
    };
    const clearResumeTimers = () => {
        if (resumeTimerRef.current) {
            clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = null;
        }
        if (resumeVerifyTimerRef.current) {
            clearTimeout(resumeVerifyTimerRef.current);
            resumeVerifyTimerRef.current = null;
        }
    };
    const clearWatchdog = () => {
        if (!watchdogTimerRef.current) return;
        clearInterval(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
    };
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const removeBannerSafely = async () => {
        if (!adMobRef.current) return;
        try {
            if (typeof adMobRef.current.removeBanner === "function") {
                await adMobRef.current.removeBanner();
            } else {
                await adMobRef.current.hideBanner();
            }
        } catch (err: any) {
            console.error("배너 제거/숨김 실패:", err);
        } finally {
            bannerVisibleRef.current = false;
        }
    };

    const recreateBanner = async (delayMs = 280) => {
        if (!adMobRef.current || !bannerOptionsRef.current) return;
        await removeBannerSafely();
        await sleep(delayMs); // 레이아웃 안정화 대기
        await adMobRef.current.showBanner(bannerOptionsRef.current);
        bannerVisibleRef.current = true;
        desiredBannerVisibleRef.current = true;
    };

    const syncBannerVisibility = async (shouldShow: boolean, force = false) => {
        desiredBannerVisibleRef.current = shouldShow;
        if (!adMobRef.current || !bannerOptionsRef.current) return;
        if (operationInFlightRef.current) return;
        if (!force && bannerVisibleRef.current === shouldShow) return;

        operationInFlightRef.current = true;
        clearRetryTimer();

        try {
            if (shouldShow) {
                if (force) {
                    await recreateBanner(280);
                } else {
                    await adMobRef.current.showBanner(bannerOptionsRef.current);
                    bannerVisibleRef.current = true;
                }
            } else {
                await removeBannerSafely();
            }
        } catch (err: any) {
            console.error(`배너 ${shouldShow ? "표시" : "숨김"} 실패:`, err);
            // 일시 실패 시 자동 복구 재시도
            retryTimerRef.current = setTimeout(() => {
                syncBannerVisibility(desiredBannerVisibleRef.current, true).catch((retryErr) => {
                    console.error("배너 재시도 실패:", retryErr);
                });
            }, 800);
        } finally {
            operationInFlightRef.current = false;
            // 동기화 중 상태가 바뀐 경우 즉시 한 번 더 반영
            if (bannerVisibleRef.current !== desiredBannerVisibleRef.current) {
                syncBannerVisibility(desiredBannerVisibleRef.current, true).catch((err) => {
                    console.error("배너 상태 재동기화 실패:", err);
                });
            }
        }
    };

    const resumeBanner = async () => {
        if (!adMobRef.current || !bannerOptionsRef.current) return;
        await recreateBanner(300);
        console.log("Banner Resumed");

        // 안전장치: resume 이후에도 표시 상태가 아니면 강제로 재호출
        resumeVerifyTimerRef.current = setTimeout(async () => {
            if (bannerVisibleRef.current) return;
            try {
                await recreateBanner(220);
                console.log("Banner Resumed (fallback showBanner)");
            } catch (err: any) {
                console.error("배너 복원 fallback 실패:", err);
            }
        }, 200);
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        // 웹 환경(개발 중)에서는 AdMob 미사용 — 플레이스홀더만 표시
        if (!Capacitor.isNativePlatform()) {
            setAdLoaded(true);
            return;
        }

        const initAdMob = async () => {
            try {
                const { AdMob, BannerAdSize, BannerAdPosition } = await import(
                    "@capacitor-community/admob"
                );
                adMobRef.current = AdMob;

                await AdMob.initialize({
                    testingDevices: [],
                    initializeForTesting: USE_TEST_ADS,
                });

                const platform = Capacitor.getPlatform() as "android" | "ios";
                const adUnitId = getBannerAdUnitId(platform);

                const bannerOptions = {
                    adId: adUnitId,
                    adSize: BannerAdSize.ADAPTIVE_BANNER,
                    position: position === "bottom"
                        ? BannerAdPosition.BOTTOM_CENTER
                        : BannerAdPosition.TOP_CENTER,
                    margin: NATIVE_BANNER_BOTTOM_MARGIN,
                    isTesting: USE_TEST_ADS,
                };

                bannerOptionsRef.current = bannerOptions;

                await AdMob.showBanner(bannerOptions);
                bannerVisibleRef.current = true;
                desiredBannerVisibleRef.current = true;

                setAdLoaded(true);
                setAdError(false);
            } catch (err) {
                console.error("AdMob 초기화 실패:", err);
                setAdError(true);
            }
        };

        initAdMob();

        return () => {
            clearRetryTimer();
            clearResumeTimers();
            clearWatchdog();
            // 컴포넌트 언마운트 시 배너 숨기기
            if (adMobRef.current && Capacitor.isNativePlatform()) {
                adMobRef.current.hideBanner().catch(console.error);
                bannerVisibleRef.current = false;
                desiredBannerVisibleRef.current = false;
            }
        };
    }, [isMounted, position]);

    useEffect(() => {
        if (!isMounted || !Capacitor.isNativePlatform()) return;

        let removeAppStateChange: { remove: () => void } | null = null;
        let removePause: { remove: () => void } | null = null;
        let removeResume: { remove: () => void } | null = null;
        let removeWillShow: { remove: () => void } | null = null;
        let removeDidShow: { remove: () => void } | null = null;
        let removeDidHide: { remove: () => void } | null = null;
        let removeBannerAdLoaded: { remove: () => void } | null = null;

        const registerListeners = async () => {
            const { App } = await import("@capacitor/app");
            const { Keyboard } = await import("@capacitor/keyboard");
            const { AdMob } = await import("@capacitor-community/admob");

            removeAppStateChange = await App.addListener("appStateChange", ({ isActive }) => {
                setIsAppActive(isActive);
                if (!isActive) {
                    // 백그라운드 복귀 케이스에서 배너 상태를 재동기화하기 위해 플래그 초기화
                    bannerVisibleRef.current = false;
                } else {
                    // 복귀 시 keyboard hide 이벤트가 누락되는 케이스 대응
                    setIsKeyboardVisible(false);
                }
            });
            removePause = await App.addListener("pause", () => {
                setIsAppActive(false);
                bannerVisibleRef.current = false;
            });
            removeResume = await App.addListener("resume", () => {
                setIsAppActive(true);
                setIsKeyboardVisible(false);
            });

            removeWillShow = await Keyboard.addListener("keyboardWillShow", () => {
                setIsKeyboardVisible(true);
            });
            removeDidShow = await Keyboard.addListener("keyboardDidShow", () => {
                setIsKeyboardVisible(true);
            });
            removeDidHide = await Keyboard.addListener("keyboardDidHide", () => {
                setIsKeyboardVisible(false);
                clearResumeTimers();
                // keyboardDidHide 이후 레이아웃 안정화 지연
                resumeTimerRef.current = setTimeout(() => {
                    resumeBanner().catch((err) => {
                        console.error("keyboardDidHide 이후 배너 복원 실패:", err);
                    });
                }, 100);
            });

            removeBannerAdLoaded = await (AdMob as any).addListener("bannerAdLoaded", () => {
                bannerVisibleRef.current = true;
            });
        };

        registerListeners().catch((err) => {
            console.error("Keyboard listener 등록 실패:", err);
        });

        return () => {
            removeAppStateChange?.remove();
            removePause?.remove();
            removeResume?.remove();
            removeWillShow?.remove();
            removeDidShow?.remove();
            removeDidHide?.remove();
            removeBannerAdLoaded?.remove();
            clearResumeTimers();
        };
    }, [isMounted]);

    useEffect(() => {
        if (!isMounted || !Capacitor.isNativePlatform()) return;
        if (!adLoaded || adError || !adMobRef.current || !bannerOptionsRef.current) return;

        const shouldShow = isAppActive && !isKeyboardVisible;

        if (!isAppActive) {
            syncBannerVisibility(false).catch((err: any) => {
                console.error("백그라운드 전환 시 배너 숨김 실패:", err);
            });
            return;
        }

        syncBannerVisibility(shouldShow).catch((err: any) => {
            console.error("키보드/앱 상태 변경 시 배너 동기화 실패:", err);
        });
    }, [isKeyboardVisible, isAppActive, adLoaded, adError, isMounted]);

    useEffect(() => {
        if (!isMounted || !Capacitor.isNativePlatform()) return;
        if (!adLoaded || adError) return;

        clearWatchdog();
        watchdogTimerRef.current = setInterval(() => {
            const shouldShow = isAppActive && !isKeyboardVisible;
            if (!shouldShow) return;
            if (bannerVisibleRef.current) return;

            console.log("Banner watchdog retry");
            resumeBanner().catch((err) => {
                console.error("배너 워치독 복원 실패:", err);
            });
        }, 1500);

        return () => {
            clearWatchdog();
        };
    }, [isMounted, adLoaded, adError, isAppActive, isKeyboardVisible]);

    // 서버 사이드 렌더링 시에는 아무것도 렌더링하지 않음
    if (!isMounted) return null;

    // 웹 환경에서는 광고를 표시하지 않음
    if (!Capacitor.isNativePlatform()) {
        return null;
    }

    // 네이티브 앱에서는 AdMob이 네이티브 레이어에서 배너를 띄우므로
    // 기본적으로는 웹 콘텐츠가 배너 높이만큼 밀리도록 스페이서만 렌더링
    // 디버깅이 필요할 때만 상태 플레이스홀더를 보여 준다.
    if (Capacitor.isNativePlatform()) {
        // 네이티브 AdMob은 네이티브 레이어에서 오버레이되므로,
        // 여기(웹 DOM)에서 높이를 예약하면 기기별 실제 높이와 어긋나 가려짐이 더 생깁니다.
        // 대신 fixed 하단바 쪽에서 padding으로 확실히 공간을 확보합니다.
        const spacerHeight = "52px";

        if (SHOW_AD_DEBUG_PLACEHOLDER) {
            const debugText = isKeyboardVisible
                ? "키보드 열림 - 광고 숨김"
                : adError
                ? "광고 로드 실패"
                : adLoaded
                  ? "광고 로드 완료"
                  : "광고 로딩 중";

            return (
                <div
                    className={`w-full flex items-center justify-center text-xs border-t border-dashed border-border bg-muted/30 text-muted-foreground ${className}`}
                    style={{ height: spacerHeight, flexShrink: 0, transition: "height 0.18s ease" }}
                    role="status"
                    aria-live="polite"
                >
                    <span className="opacity-70">📢 {debugText}</span>
                </div>
            );
        }

        return (
            <div
                className={`w-full border-t border-border/50 bg-muted/20 ${className}`}
                style={{ height: spacerHeight, flexShrink: 0, transition: "height 0.18s ease" }}
                aria-hidden="true"
            />
        );
    }

    return null;
}
