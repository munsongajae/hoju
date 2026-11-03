"use client";

import { useEffect, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { getGeminiApiKey } from "@/lib/gemini";

const USE_TEST_ADS = process.env.NEXT_PUBLIC_ADMOB_USE_TEST_IDS !== "false";

const TEST_AD_UNIT_IDS = {
    android: "ca-app-pub-3940256099942544/1033173712",
    ios: "ca-app-pub-3940256099942544/4411468910",
};

const PROD_AD_UNIT_IDS = {
    android: process.env.NEXT_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID ?? "",
    ios: process.env.NEXT_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID ?? "",
};

function getInterstitialConfig(platform: "android" | "ios") {
    const prodId = PROD_AD_UNIT_IDS[platform].trim();
    const usingTestId = USE_TEST_ADS || !prodId;
    return {
        adId: usingTestId ? TEST_AD_UNIT_IDS[platform] : prodId,
        isTesting: usingTestId,
    };
}

/**
 * AdMob 전면 광고(Interstitial) 훅.
 *
 * 사용법:
 *   const { showWithAd } = useInterstitialAd();
 *   <Button onClick={() => showWithAd(handleGenerate)}>AI 생성</Button>
 *
 * - 네이티브 앱: 광고를 보여준 뒤 dismiss 시 callback 실행
 * - 웹(개발): 광고 없이 즉시 callback 실행
 * - 광고 로드/표시 실패: 광고 건너뛰고 callback 바로 실행
 */
export function useInterstitialAd() {
    const adReadyRef = useRef(false);
    const adMobRef = useRef<any>(null);
    const dismissListenerRef = useRef<{ remove: () => void } | null>(null);
    const failedListenerRef = useRef<{ remove: () => void } | null>(null);
    const pendingCallbackRef = useRef<(() => void) | null>(null);

    const removeListeners = () => {
        dismissListenerRef.current?.remove();
        dismissListenerRef.current = null;
        failedListenerRef.current?.remove();
        failedListenerRef.current = null;
    };

    const shouldSkipInterstitialForUserApiKey = () => {
        const userApiKey = getGeminiApiKey();
        return Boolean(userApiKey?.trim());
    };

    const prepareAd = useCallback(async () => {
        if (!Capacitor.isNativePlatform()) return;
        try {
            const { AdMob } = await import("@capacitor-community/admob");
            adMobRef.current = AdMob;

            // 배너가 이미 초기화했더라도 중복 호출은 무시되므로 안전
            await AdMob.initialize({
                testingDevices: [],
                initializeForTesting: USE_TEST_ADS,
            });

            const platform = Capacitor.getPlatform() as "android" | "ios";
            const { adId, isTesting } = getInterstitialConfig(platform);

            await AdMob.prepareInterstitial({ adId, isTesting });
            adReadyRef.current = true;
            console.log("[InterstitialAd] 광고 로드 완료:", adId);
        } catch (err) {
            console.warn("[InterstitialAd] 광고 사전 로드 실패:", err);
            adReadyRef.current = false;
        }
    }, []);

    useEffect(() => {
        prepareAd();
        return () => {
            removeListeners();
        };
    }, [prepareAd]);

    const runCallbackAndReload = useCallback((callback: (() => void) | null) => {
        removeListeners();
        adReadyRef.current = false;
        pendingCallbackRef.current = null;
        callback?.();
        prepareAd();
    }, [prepareAd]);

    /**
     * 전면 광고를 보여주고, 닫힌 뒤 callback을 실행합니다.
     * 광고가 준비되지 않았거나 웹 환경이면 즉시 callback을 실행합니다.
     */
    const showWithAd = useCallback(async (callback: () => void) => {
        if (shouldSkipInterstitialForUserApiKey()) {
            callback();
            return;
        }

        if (!Capacitor.isNativePlatform() || !adReadyRef.current || !adMobRef.current) {
            callback();
            return;
        }

        try {
            const { InterstitialAdPluginEvents } = await import("@capacitor-community/admob");

            pendingCallbackRef.current = callback;
            removeListeners();

            // 광고 닫힘 → callback 실행 후 다음 광고 미리 로드
            dismissListenerRef.current = await adMobRef.current.addListener(
                InterstitialAdPluginEvents.Dismissed,
                () => runCallbackAndReload(pendingCallbackRef.current)
            );

            // showInterstitial() 실패 → callback 바로 실행
            failedListenerRef.current = await adMobRef.current.addListener(
                InterstitialAdPluginEvents.FailedToShow,
                () => {
                    console.warn("[InterstitialAd] 광고 표시 실패, 바로 실행");
                    runCallbackAndReload(pendingCallbackRef.current);
                }
            );

            await adMobRef.current.showInterstitial();
        } catch (err) {
            console.warn("[InterstitialAd] showInterstitial 예외, 바로 실행:", err);
            runCallbackAndReload(pendingCallbackRef.current);
        }
    }, [runCallbackAndReload]);

    return { showWithAd };
}
