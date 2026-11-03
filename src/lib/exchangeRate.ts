/**
 * 환율 조회 유틸리티 (클라이언트 사이드)
 * Capacitor 정적 export 환경에서 API Route 없이 직접 환율을 가져옵니다.
 */

const CURRENCY_PAIRS: Record<string, string> = {
    AUD: "AUDKRW=X",
    USD: "USDKRW=X",
    VND: "VNDKRW=X",
    JPY: "JPYKRW=X",
    EUR: "EURKRW=X",
    CNY: "CNYKRW=X",
    HKD: "HKDKRW=X",
    TWD: "TWDKRW=X",
    SGD: "SGDKRW=X",
    THB: "THBKRW=X",
    IDR: "IDRKRW=X",
    PHP: "PHPKRW=X",
    MYR: "MYRKRW=X",
    INR: "INRKRW=X",
    PKR: "PKRKRW=X",
    BDT: "BDTKRW=X",
    AED: "AEDKRW=X",
    SAR: "SARKRW=X",
    QAR: "QARKRW=X",
    KWD: "KWDKRW=X",
    IRR: "IRRKRW=X",
    ILS: "ILSKRW=X",
    TRY: "TRYKRW=X",
    GBP: "GBPKRW=X",
    CHF: "CHFKRW=X",
    SEK: "SEKKRW=X",
    NOK: "NOKKRW=X",
    DKK: "DKKKRW=X",
    PLN: "PLNKRW=X",
    CZK: "CZKRW=X",
    HUF: "HUFKRW=X",
    RUB: "RUBKRW=X",
    RON: "RONKRW=X",
    BGN: "BGNKRW=X",
    CAD: "CADKRW=X",
    MXN: "MXNKRW=X",
    CUP: "CUPKRW=X",
    BRL: "BRLKRW=X",
    ARS: "ARSKRW=X",
    CLP: "CLPKRW=X",
    COP: "COPKRW=X",
    PEN: "PENKRW=X",
    VES: "VESKRW=X",
    ZAR: "ZARKRW=X",
    EGP: "EGPKRW=X",
    NGN: "NGNKRW=X",
    KES: "KESKRW=X",
    MAD: "MADKRW=X",
    GHS: "GHSKRW=X",
    NZD: "NZDKRW=X",
};

const CACHE_KEY_PREFIX = "cachedExchangeRate_";
const CACHE_TIME_PREFIX = "cachedExchangeRateTime_";
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1시간

export interface ExchangeRateResult {
    rate: number;
    currency: string;
    timestamp: string;
    source: "api" | "cache" | "custom";
    isStale?: boolean;
}

/**
 * 특정 통화의 원화(KRW) 환율을 가져옵니다.
 * 1. 사용자 지정 환율 우선 사용
 * 2. 캐시된 환율 즉시 반환 (1시간 이내)
 * 3. Open Exchange Rates API 직접 호출 (CORS 허용됨, 더 안정적)
 * 4. API 실패 시 기존 프록시 방식 폴백 및 stale 캐시 반환
 */
export async function fetchExchangeRate(currency: string = "AUD"): Promise<ExchangeRateResult | null> {
    const upperCurrency = currency.toUpperCase();

    // 1. 사용자 지정 환율 확인
    const useCustom = localStorage.getItem(`useCustomExchangeRate_${upperCurrency}`) === "true";
    if (useCustom) {
        const customRate = localStorage.getItem(`customExchangeRate_${upperCurrency}`);
        if (customRate) {
            return {
                rate: parseFloat(customRate),
                currency: upperCurrency,
                timestamp: new Date().toISOString(),
                source: "custom",
            };
        }
    }

    // 2. 캐시 확인 (1시간 이내)
    const cachedRate = localStorage.getItem(`${CACHE_KEY_PREFIX}${upperCurrency}`);
    const cachedTime = localStorage.getItem(`${CACHE_TIME_PREFIX}${upperCurrency}`);
    const isCacheValid = cachedTime && Date.now() - parseInt(cachedTime) < CACHE_DURATION_MS;

    if (cachedRate && isCacheValid) {
        return {
            rate: parseFloat(cachedRate),
            currency: upperCurrency,
            timestamp: new Date(parseInt(cachedTime!)).toISOString(),
            source: "cache",
        };
    }

    // 3. 오프라인이면 stale 캐시 반환
    if (!navigator.onLine) {
        if (cachedRate) {
            return {
                rate: parseFloat(cachedRate),
                currency: upperCurrency,
                timestamp: cachedTime ? new Date(parseInt(cachedTime)).toISOString() : new Date().toISOString(),
                source: "cache",
                isStale: true,
            };
        }
        return null;
    }

    // 4. API 호출 - 전용 환율 API (open.er-api.com) 시도
    // 이 API는 CORS를 허용하며 별도 키 없이 무료로 사용 가능합니다.
    try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${upperCurrency}`, { signal: AbortSignal.timeout(5000) });
        if (response.ok) {
            const data = await response.json() as { rates: Record<string, number>, result: string };
            const rate = data.rates?.KRW;

            if (rate && !isNaN(rate)) {
                // 캐시 저장
                localStorage.setItem(`${CACHE_KEY_PREFIX}${upperCurrency}`, rate.toString());
                localStorage.setItem(`${CACHE_TIME_PREFIX}${upperCurrency}`, Date.now().toString());

                return {
                    rate,
                    currency: upperCurrency,
                    timestamp: new Date().toISOString(),
                    source: "api",
                };
            }
        }
    } catch (err) {
        console.warn(`전용 환율 API 호출 실패 (${upperCurrency}):`, err instanceof Error ? err.message : err);
    }

    // 5. 폴백 - Yahoo Finance via Proxies (기존 방식)
    const pair = CURRENCY_PAIRS[upperCurrency] || null;
    if (pair) {
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${pair}`;
        const proxies = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(yahooUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(yahooUrl)}`,
        ];

        for (const proxyUrl of proxies) {
            try {
                const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
                if (!response.ok) continue;

                let data: Record<string, unknown>;
                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const json = await response.json() as Record<string, unknown>;
                    if (typeof json.contents === 'string') {
                        data = JSON.parse(json.contents) as Record<string, unknown>;
                    } else {
                        data = json;
                    }
                } else {
                    continue;
                }

                const result = data as { chart?: { result?: Array<{ meta?: { regularMarketPrice?: number } }> } };
                const rate = result?.chart?.result?.[0]?.meta?.regularMarketPrice;

                if (rate && !isNaN(rate)) {
                    localStorage.setItem(`${CACHE_KEY_PREFIX}${upperCurrency}`, rate.toString());
                    localStorage.setItem(`${CACHE_TIME_PREFIX}${upperCurrency}`, Date.now().toString());

                    return {
                        rate,
                        currency: upperCurrency,
                        timestamp: new Date().toISOString(),
                        source: "api",
                    };
                }
            } catch (err) {
                continue;
            }
        }
    }

    // 모든 시도 실패 시 stale 캐시 폴백
    if (cachedRate) {
        return {
            rate: parseFloat(cachedRate),
            currency: upperCurrency,
            timestamp: cachedTime ? new Date(parseInt(cachedTime)).toISOString() : new Date().toISOString(),
            source: "cache",
            isStale: true,
        };
    }
    return null;
}

/**
 * 여러 통화의 환율을 한번에 가져옵니다.
 */
export async function fetchMultipleRates(currencies: string[]): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    await Promise.allSettled(
        currencies.map(async (currency) => {
            const result = await fetchExchangeRate(currency);
            if (result) results[currency] = result.rate;
        })
    );
    return results;
}

/**
 * 지출 항목에서 사용된 비-KRW 통화 목록(대문자, 중복 제거)을 반환합니다.
 * 환율 fetch 대상 산정에 사용합니다.
 */
export function getUniqueExpenseCurrencies(
    expenses: { currency?: string }[],
): string[] {
    const set = new Set<string>();
    for (const e of expenses) {
        const cur = (e.currency || "AUD").toUpperCase();
        if (cur !== "KRW") set.add(cur);
    }
    return Array.from(set);
}

/**
 * 단일 금액을 KRW로 환산합니다.
 * - KRW => 그대로 반환
 * - 환율을 못 가져온 통화 => null (호출 측에서 "환산 불가"로 처리)
 *
 * 임의의 폴백 상수(예: 900, 1) 사용을 금지합니다. 잘못된 합계로 사용자를 혼동시키기 때문입니다.
 */
export function convertAmountToKRW(
    amount: number,
    currency: string | undefined,
    rates: Record<string, number>,
): number | null {
    const cur = (currency || "AUD").toUpperCase();
    if (cur === "KRW") return amount;
    const rate = rates[cur];
    if (!rate || !Number.isFinite(rate) || rate <= 0) return null;
    return amount * rate;
}

export interface KrwSumResult {
    /** 환산 가능한 항목들만 합산한 원화 합계 */
    totalKrw: number;
    /** 통화별 원본 금액 합계 (환산 가능 여부와 무관) */
    byCurrency: Record<string, number>;
    /** 환율을 가져오지 못해 합계에서 제외된 통화 코드 목록 */
    missingCurrencies: string[];
    /** 환산 가능한 항목 수 / 전체 항목 수 */
    convertedCount: number;
    totalCount: number;
}

/**
 * 지출 목록을 KRW로 합산합니다. 환율을 알 수 없는 통화는 합계에서 **제외**하고
 * `missingCurrencies`로 알려 줍니다. 호출 측은 이를 UI에 노출해야 합니다.
 */
export function sumExpensesInKRW(
    expenses: { amount: number; currency?: string }[],
    rates: Record<string, number>,
): KrwSumResult {
    let totalKrw = 0;
    let convertedCount = 0;
    const byCurrency: Record<string, number> = {};
    const missing = new Set<string>();

    for (const e of expenses) {
        const cur = (e.currency || "AUD").toUpperCase();
        byCurrency[cur] = (byCurrency[cur] || 0) + e.amount;

        const krw = convertAmountToKRW(e.amount, cur, rates);
        if (krw == null) {
            missing.add(cur);
        } else {
            totalKrw += krw;
            convertedCount++;
        }
    }

    return {
        totalKrw,
        byCurrency,
        missingCurrencies: Array.from(missing),
        convertedCount,
        totalCount: expenses.length,
    };
}
