"use client";

import { Capacitor } from "@capacitor/core";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AI_MODE_STORAGE_KEY, AiMode, DEFAULT_AI_MODE, getSavedAiMode } from "@/lib/aiMode";

type AiModeContextValue = {
  aiMode: AiMode;
  setAiMode: (mode: AiMode) => void;
  isAutoModeSupported: boolean;
  isCheckingSupport: boolean;
  deviceSignature: string;
};

const AiModeContext = createContext<AiModeContextValue | undefined>(undefined);

const NANO_DEVICE_PATTERNS: RegExp[] = [
  // Samsung Galaxy S24/S25 series
  /sm-s92[0-9]/,
  /galaxy\s*s2[45]/,
  // Samsung Fold/Flip 6/7
  /sm-f9[45][0-9]/,
  /z\s*fold\s*[67]/,
  /z\s*flip\s*[67]/,
  // Samsung Tab S10 series
  /tab\s*s10/,
  /sm-x9[0-9][0-9]/,
  // Pixel 8/9 series
  /pixel\s*8/,
  /pixel\s*9/,
  // Other devices explicitly requested
  /xiaomi\s*1[45]/,
  /edge\s*50\s*ultra/,
  /razr\s*50\s*ultra/,
  // Chipset family hints
  /snapdragon\s*8\s*gen\s*[34]/,
  /snapdragon\s*8\s*elite/,
  /dimensity\s*93|dimensity\s*94/,
];

function matchesNanoCandidate(signature: string) {
  return NANO_DEVICE_PATTERNS.some((pattern) => pattern.test(signature));
}

async function detectAICoreSupport(): Promise<{ supported: boolean; signature: string }> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
    return { supported: false, signature: "non-android" };
  }

  try {
    // Prefer native ML Kit status when plugin is available.
    const { OnDeviceAi } = await import("@/lib/onDeviceAi");
    const status = await OnDeviceAi.getStatus();
    if (status.statusName !== "UNAVAILABLE") {
      return { supported: true, signature: `native-${status.statusName.toLowerCase()}` };
    }
  } catch (err) {
    console.warn("네이티브 AICore 상태 확인 실패, 디바이스 시그니처 추론으로 대체:", err);
  }

  try {
    const { Device } = await import("@capacitor/device");
    const info = await Device.getInfo();
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const signature = `${info.manufacturer ?? ""} ${info.model ?? ""} ${info.name ?? ""} ${ua}`
      .trim()
      .toLowerCase();

    return {
      supported: matchesNanoCandidate(signature),
      signature,
    };
  } catch (err) {
    console.error("AICore 지원 확인 실패:", err);
    return { supported: false, signature: "check-failed" };
  }
}

export function AiModeProvider({ children }: { children: React.ReactNode }) {
  const [aiMode, setAiModeState] = useState<AiMode>("manual");
  const [isAutoModeSupported, setIsAutoModeSupported] = useState(false);
  const [isCheckingSupport, setIsCheckingSupport] = useState(false);
  const [deviceSignature, setDeviceSignature] = useState("auto-mode-disabled-temporarily");

  useEffect(() => {
    // 현재 버전에서는 온디바이스 자동 모드를 전역적으로 비활성화한다.
    // 저장된 값이 'auto'여도 항상 'manual'로 강제한다.
    const savedMode = getSavedAiMode();
    setAiModeState(savedMode === "manual" ? "manual" : "manual");
    setIsAutoModeSupported(false);
    setIsCheckingSupport(false);
  }, []);

  const setAiMode = useCallback(
    (nextMode: AiMode) => {
      if (nextMode === "auto" && !isAutoModeSupported) {
        setAiModeState("manual");
        return;
      }
      setAiModeState(nextMode);
    },
    [isAutoModeSupported]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(AI_MODE_STORAGE_KEY, aiMode);
  }, [aiMode]);

  const value = useMemo<AiModeContextValue>(
    () => ({
      aiMode,
      setAiMode,
      isAutoModeSupported,
      isCheckingSupport,
      deviceSignature,
    }),
    [aiMode, setAiMode, isAutoModeSupported, isCheckingSupport, deviceSignature]
  );

  return <AiModeContext.Provider value={value}>{children}</AiModeContext.Provider>;
}

export function useAiMode() {
  const context = useContext(AiModeContext);
  if (!context) {
    throw new Error("useAiMode must be used within AiModeProvider");
  }
  return context;
}
