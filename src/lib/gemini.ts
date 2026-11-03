// ── Supabase 프록시 설정 (개발자 API 키 보관) ────────────────────────────────
const SUPABASE_PROXY_URL =
    "https://xkssxcrcndghqysjjbql.supabase.co/functions/v1/gemini-proxy";
const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_7OOImWENlOd8GvYaYLuIgA_AqVPcuml";

// ── 사용자 직접 API 키 (설정에서 입력 시 프록시 대신 사용) ───────────────────
const GEMINI_API_KEY_STORAGE = "hoju_gemini_api_key";
const GEMINI_MODEL_STORAGE   = "hoju_gemini_model";

// ── 모델 폴백 체인 ────────────────────────────────────────────────────────────
// 모델별 쿼터 (유료 1등급, 2026-04)
// gemini-3.1-flash-lite-preview :  4K RPM,   4M TPM, 150K RPD  ← 1순위 (주력)
// gemini-2.5-flash-lite         : 10 RPM, 250K TPM,   20 RPD  ← 2순위 (보조)
// gemini-2.5-flash              :  5 RPM, 250K TPM,   20 RPD  ← 3순위 (보조)
export const GEMINI_MODELS = [
    { value: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite (권장 · 150K RPD)" },
    { value: "gemini-2.5-flash-lite",         label: "Gemini 2.5 Flash Lite" },
    { value: "gemini-2.5-flash",              label: "Gemini 2.5 Flash" },
] as const;

export type GeminiModelValue = (typeof GEMINI_MODELS)[number]["value"];

// 폴백 순서 — 쿼터가 많은 모델부터
const MODEL_FALLBACK_CHAIN: GeminiModelValue[] = [
    "gemini-3.1-flash-lite-preview",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
];

// ── 소진된 모델 추적 (자정에 자동 초기화) ────────────────────────────────────
const EXHAUSTED_KEY = "hoju_exhausted_models";

function getTodayKey() {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function getExhaustedModels(): Set<GeminiModelValue> {
    if (typeof window === "undefined") return new Set();
    try {
        const raw = localStorage.getItem(EXHAUSTED_KEY);
        if (!raw) return new Set();
        const { date, models } = JSON.parse(raw);
        if (date !== getTodayKey()) return new Set(); // 날짜 바뀌면 초기화
        return new Set(models as GeminiModelValue[]);
    } catch {
        return new Set();
    }
}

function markModelExhausted(model: GeminiModelValue): void {
    if (typeof window === "undefined") return;
    const exhausted = getExhaustedModels();
    exhausted.add(model);
    localStorage.setItem(EXHAUSTED_KEY, JSON.stringify({
        date: getTodayKey(),
        models: Array.from(exhausted),
    }));
    console.info(`[Gemini] 모델 한도 소진: ${model} → 다음 모델로 전환`);
}

function getNextAvailableModel(): GeminiModelValue | null {
    const exhausted = getExhaustedModels();
    return MODEL_FALLBACK_CHAIN.find((m) => !exhausted.has(m)) ?? null;
}

// ── 공개 유틸 ────────────────────────────────────────────────────────────────
const DEFAULT_MODEL: GeminiModelValue = "gemini-3.1-flash-lite-preview";

export function getGeminiModel(): GeminiModelValue {
    if (typeof window === "undefined") return DEFAULT_MODEL;
    const saved = localStorage.getItem(GEMINI_MODEL_STORAGE);
    const valid = GEMINI_MODELS.map((m) => m.value);
    return (valid.includes(saved as GeminiModelValue) ? saved : DEFAULT_MODEL) as GeminiModelValue;
}

export function saveGeminiModel(model: GeminiModelValue): void {
    localStorage.setItem(GEMINI_MODEL_STORAGE, model);
}

export function getGeminiApiKey(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(GEMINI_API_KEY_STORAGE) || null;
}

export function saveGeminiApiKey(key: string): void {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
}

export function clearGeminiApiKey(): void {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE);
}

// ── 타임아웃 / 취소 ───────────────────────────────────────────────────────────
/** Gemini 호출 한 번당 타임아웃 (네트워크가 느릴 때 무한 대기 방지) */
const GEMINI_TIMEOUT_MS = 30_000;

/**
 * 외부 AbortSignal과 타임아웃을 합쳐 단일 signal로 만든다.
 * `AbortSignal.any` / `AbortSignal.timeout` 미지원 환경(구형 WebView)에서도
 * 동작하도록 직접 구현했다. 호출 후 반드시 cleanup을 호출해 setTimeout/리스너를 해제한다.
 */
function withTimeoutSignal(
    external: AbortSignal | undefined,
    timeoutMs: number,
): { signal: AbortSignal; cleanup: () => void } {
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
        ctrl.abort(new DOMException("Gemini request timed out", "TimeoutError"));
    }, timeoutMs);

    let onExternalAbort: (() => void) | null = null;
    if (external) {
        if (external.aborted) {
            ctrl.abort(external.reason);
        } else {
            onExternalAbort = () => ctrl.abort(external.reason);
            external.addEventListener("abort", onExternalAbort);
        }
    }

    return {
        signal: ctrl.signal,
        cleanup: () => {
            clearTimeout(timer);
            if (external && onExternalAbort) {
                external.removeEventListener("abort", onExternalAbort);
            }
        },
    };
}

// ── 에러 클래스 ───────────────────────────────────────────────────────────────
/** 모델별 RPD 한도 초과 (폴백 대상) */
export class GeminiQuotaError extends Error {
    constructor() {
        super("QUOTA_EXCEEDED");
        this.name = "GeminiQuotaError";
    }
}

/** 프록시의 일일 IP 한도 초과 (내일까지 대기 또는 사용자 키 입력 필요) */
export class GeminiDailyLimitError extends Error {
    public readonly dailyLimit?: number;
    constructor(dailyLimit?: number) {
        super("DAILY_LIMIT_REACHED");
        this.name = "GeminiDailyLimitError";
        this.dailyLimit = dailyLimit;
    }
}

/** 네트워크 타임아웃 또는 사용자 취소 */
export class GeminiTimeoutError extends Error {
    constructor() {
        super("REQUEST_TIMEOUT");
        this.name = "GeminiTimeoutError";
    }
}

const QUOTA_KEYWORDS = ["quota", "rate limit", "resource_exhausted", "429", "too many requests", "exceeded"];
const isQuotaError = (msg: string) =>
    QUOTA_KEYWORDS.some((kw) => msg.toLowerCase().includes(kw));

function isAbortLikeError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    return err.name === "AbortError" || err.name === "TimeoutError";
}

// ── 통합 호출 함수 ────────────────────────────────────────────────────────────
export interface GenerateOptions {
    /** 호출 측에서 전달하는 외부 abort signal (예: 컴포넌트 언마운트 시 취소) */
    signal?: AbortSignal;
}

// 우선순위: 사용자 직접 API 키 → Supabase 프록시 (모델 자동 폴백 포함)
export async function generateWithGemini(
    prompt: string,
    options: GenerateOptions = {},
): Promise<string> {
    const userApiKey = getGeminiApiKey();
    return userApiKey
        ? callGeminiDirect(prompt, userApiKey, options)
        : callGeminiProxyWithFallback(prompt, options);
}

// ── 프록시 호출 + 모델 자동 폴백 ─────────────────────────────────────────────
async function callGeminiProxyWithFallback(
    prompt: string,
    options: GenerateOptions,
): Promise<string> {
    const model = getNextAvailableModel();
    if (!model) throw new GeminiQuotaError();

    try {
        return await callGeminiProxy(prompt, model, options);
    } catch (err) {
        if (err instanceof GeminiDailyLimitError) throw err;
        if (err instanceof GeminiTimeoutError) throw err;
        if (err instanceof GeminiQuotaError) {
            markModelExhausted(model);
            const nextModel = getNextAvailableModel();
            if (!nextModel) throw new GeminiQuotaError();
            console.info(`[Gemini] ${model} 소진 → ${nextModel} 으로 재시도`);
            return callGeminiProxy(prompt, nextModel, options);
        }
        throw err;
    }
}

// 사용자 직접 키로 Gemini API 호출 (설정된 모델 단일 사용)
async function callGeminiDirect(
    prompt: string,
    apiKey: string,
    options: GenerateOptions,
): Promise<string> {
    const model = getGeminiModel();
    const { signal, cleanup } = withTimeoutSignal(options.signal, GEMINI_TIMEOUT_MS);

    let response: Response;
    try {
        response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, topK: 40, topP: 0.95 },
                }),
                signal,
            },
        );
    } catch (err) {
        if (isAbortLikeError(err)) throw new GeminiTimeoutError();
        throw err;
    } finally {
        cleanup();
    }

    if (!response.ok) {
        let errorMessage = `Gemini API 오류 (${response.status})`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || errorMessage;
        } catch { /* ignore */ }
        if (response.status === 429 || isQuotaError(errorMessage)) throw new GeminiQuotaError();
        throw new Error(errorMessage);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini 응답이 비어 있습니다. 다시 시도해주세요.");
    return text as string;
}

// 지정 모델로 Supabase 프록시 호출
async function callGeminiProxy(
    prompt: string,
    model: GeminiModelValue,
    options: GenerateOptions,
): Promise<string> {
    const { signal, cleanup } = withTimeoutSignal(options.signal, GEMINI_TIMEOUT_MS);

    let response: Response;
    try {
        response = await fetch(SUPABASE_PROXY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
                "apikey": SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ prompt, model }),
            signal,
        });
    } catch (err) {
        if (isAbortLikeError(err)) throw new GeminiTimeoutError();
        throw err;
    } finally {
        cleanup();
    }

    if (!response.ok) {
        // 신규 서버 응답: { code, error, message, dailyLimit? }
        // 구버전 호환: { error: "..." } 또는 평문 텍스트
        let errorCode: string | undefined;
        let errorMessage = `AI 서버 오류 (${response.status})`;
        let dailyLimit: number | undefined;
        try {
            const errorData = await response.json();
            if (typeof errorData === "object" && errorData) {
                errorCode = typeof errorData.code === "string" ? errorData.code : undefined;
                errorMessage =
                    errorData.message ||
                    errorData.error ||
                    JSON.stringify(errorData) ||
                    errorMessage;
                if (typeof errorData.dailyLimit === "number") dailyLimit = errorData.dailyLimit;
            }
        } catch {
            try { errorMessage = (await response.text()) || errorMessage; } catch { /* ignore */ }
        }
        console.error(`[Gemini Proxy][${model}] 오류:`, errorCode, errorMessage);

        // 1) 머신 리더블 코드 우선
        if (errorCode === "DAILY_LIMIT_REACHED") throw new GeminiDailyLimitError(dailyLimit);
        if (errorCode === "MODEL_QUOTA_EXCEEDED") throw new GeminiQuotaError();

        // 2) 구버전 응답 호환 폴백
        if (errorMessage.includes("DAILY_LIMIT_REACHED")) throw new GeminiDailyLimitError(dailyLimit);
        if (response.status === 429 || isQuotaError(errorMessage)) throw new GeminiQuotaError();

        throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.text) throw new Error("AI 응답이 비어 있습니다. 다시 시도해주세요.");
    return data.text as string;
}
