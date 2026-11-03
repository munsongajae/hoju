"use client";

export const FONT_SCALE_STORAGE_KEY = "hoju_font_scale";
const FONT_SCALE_SCHEMA_VERSION_KEY = "hoju_font_scale_schema_version";
const FONT_SCALE_SCHEMA_VERSION = "2";

export const FONT_SCALE_OPTIONS = {
    "1": 0.78,
    "2": 0.83,
    "3": 0.88,
    "4": 0.94,
    "5": 1,
} as const;

export type FontScaleOption = keyof typeof FONT_SCALE_OPTIONS;

export const FONT_SCALE_LEVELS: FontScaleOption[] = ["1", "2", "3", "4", "5"];

const DEFAULT_FONT_SCALE_OPTION: FontScaleOption = "3";

function isFontScaleOption(value: string): value is FontScaleOption {
    return value in FONT_SCALE_OPTIONS;
}

export function getSavedFontScaleOption(): FontScaleOption {
    if (typeof window === "undefined") return DEFAULT_FONT_SCALE_OPTION;

    const saved = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
    const savedSchemaVersion = localStorage.getItem(FONT_SCALE_SCHEMA_VERSION_KEY);
    if (!saved) {
        localStorage.setItem(FONT_SCALE_SCHEMA_VERSION_KEY, FONT_SCALE_SCHEMA_VERSION);
        return DEFAULT_FONT_SCALE_OPTION;
    }

    if (savedSchemaVersion !== FONT_SCALE_SCHEMA_VERSION) {
        const legacyOptionMap: Record<string, FontScaleOption> = {
            // v1(숫자 5단계) → v2 마이그레이션
            "1": "3", // 사용자가 적당하다고 느낀 기존 1단계를 새 기본 3단계로 이동
            "2": "4",
            "3": "5",
            "4": "5",
            "5": "5",
            // 더 오래된 문자열 저장값 대응
            small: "4",
            normal: "5",
            large: "5",
        };
        const migrated = legacyOptionMap[saved] ?? DEFAULT_FONT_SCALE_OPTION;
        localStorage.setItem(FONT_SCALE_STORAGE_KEY, migrated);
        localStorage.setItem(FONT_SCALE_SCHEMA_VERSION_KEY, FONT_SCALE_SCHEMA_VERSION);
        return migrated;
    }

    if (isFontScaleOption(saved)) return saved;
    return DEFAULT_FONT_SCALE_OPTION;
}

export function applyFontScale(option: FontScaleOption) {
    if (typeof document === "undefined") return;

    const scale = FONT_SCALE_OPTIONS[option] ?? FONT_SCALE_OPTIONS["3"];
    document.documentElement.style.setProperty("--app-font-scale", String(scale));
}

export function saveAndApplyFontScale(option: FontScaleOption) {
    if (typeof window !== "undefined") {
        localStorage.setItem(FONT_SCALE_STORAGE_KEY, option);
    }
    applyFontScale(option);
}
