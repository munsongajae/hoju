/**
 * AI(Gemini 등) 응답에서 JSON을 안전하게 추출/정규화/파싱하는 유틸.
 *
 * 모델은 코드펜스(```json), BOM, 스마트 따옴표, trailing comma, JSON 외 잡음 텍스트를
 * 종종 포함한다. 컴포넌트마다 다르게 처리하면 한 곳에서만 견고하고 다른 곳에서는
 * 깨지므로, 공통 유틸로 통일한다.
 */

/**
 * 코드펜스/BOM/스마트 따옴표/trailing comma를 제거하고 첫 괄호부터 마지막 닫는 괄호까지 슬라이스한다.
 *
 * - kind: "array"  → `[`/`]`
 * - kind: "object" → `{`/`}`
 */
export function extractAndNormalizeJson(
    raw: string,
    kind: "array" | "object" = "array",
): string {
    const withoutCodeFence = raw
        .replace(/```json\s*/gi, "")
        .replace(/```/g, "")
        .trim();

    const open = kind === "array" ? "[" : "{";
    const close = kind === "array" ? "]" : "}";
    const firstIdx = withoutCodeFence.indexOf(open);
    const lastIdx = withoutCodeFence.lastIndexOf(close);
    const sliced =
        firstIdx >= 0 && lastIdx > firstIdx
            ? withoutCodeFence.slice(firstIdx, lastIdx + 1)
            : withoutCodeFence;

    return sliced
        .replace(/\uFEFF/g, "")
        .replace(/[\u201C\u201D]/g, '"') // “ ”
        .replace(/[\u2018\u2019]/g, "'") // ‘ ’
        .replace(/,\s*([}\]])/g, "$1")
        .trim();
}

/**
 * AI 응답에서 JSON 배열을 파싱한다. 배열이 아니면 명확한 에러를 던진다.
 * 파싱 실패는 호출 측에서 catch하여 사용자에게 안내해야 한다.
 */
export function parseAiJsonArray<T = unknown>(raw: string): T[] {
    const normalized = extractAndNormalizeJson(raw, "array");
    let parsed: unknown;
    try {
        parsed = JSON.parse(normalized);
    } catch (err) {
        throw new Error(
            `AI 응답을 JSON으로 해석할 수 없습니다. ${err instanceof Error ? err.message : ""}`.trim(),
        );
    }
    if (!Array.isArray(parsed)) {
        throw new Error("AI 응답이 JSON 배열 형식이어야 합니다.");
    }
    return parsed as T[];
}

/**
 * AI 응답에서 JSON 객체를 파싱한다. 객체가 아니면 명확한 에러를 던진다.
 */
export function parseAiJsonObject<T = unknown>(raw: string): T {
    const normalized = extractAndNormalizeJson(raw, "object");
    let parsed: unknown;
    try {
        parsed = JSON.parse(normalized);
    } catch (err) {
        throw new Error(
            `AI 응답을 JSON으로 해석할 수 없습니다. ${err instanceof Error ? err.message : ""}`.trim(),
        );
    }
    if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
        throw new Error("AI 응답이 JSON 객체 형식이어야 합니다.");
    }
    return parsed as T;
}
