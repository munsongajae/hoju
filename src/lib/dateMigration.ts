import { db } from "./db";
import { formatLocalDateYYYYMMDD, parseStoredDateToLocal } from "./localDate";

const MIGRATION_KEY = "hoju-date-normalization-v1";
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function needsNormalization(value: unknown): value is string {
    return typeof value === "string" && value.length > 0 && !DATE_ONLY_REGEX.test(value);
}

function normalize(value: string): string {
    return formatLocalDateYYYYMMDD(parseStoredDateToLocal(value));
}

/**
 * 옛 코드가 datetime ISO 문자열로 저장한 날짜 필드를 "YYYY-MM-DD"로 정규화한다.
 * - 변환 기준: UTC 캘린더 날짜를 "사용자가 의도한 날짜"로 가정 (parseStoredDateToLocal과 일치)
 * - 한 기기에서 단 1회만 실행 (localStorage 플래그)
 */
export async function runDateNormalizationMigration(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
        if (localStorage.getItem(MIGRATION_KEY) === "done") return;

        let updated = 0;

        const expenses = await db.expenses.toArray();
        for (const e of expenses) {
            if (needsNormalization(e.date)) {
                await db.expenses.update(e.id, { date: normalize(e.date) });
                updated++;
            }
        }

        const diaries = await db.diaries.toArray();
        for (const d of diaries) {
            if (needsNormalization(d.date)) {
                await db.diaries.update(d.id, { date: normalize(d.date) });
                updated++;
            }
        }

        const trips = await db.trips.toArray();
        for (const t of trips) {
            const patch: Partial<typeof t> = {};
            if (needsNormalization(t.start_date)) patch.start_date = normalize(t.start_date);
            if (needsNormalization(t.end_date)) patch.end_date = normalize(t.end_date);
            if (Object.keys(patch).length > 0) {
                await db.trips.update(t.id, patch);
                updated++;
            }
        }

        const schedules = await db.schedules.toArray();
        for (const s of schedules) {
            if (s.date && needsNormalization(s.date)) {
                await db.schedules.update(s.id, { date: normalize(s.date) });
                updated++;
            }
        }

        localStorage.setItem(MIGRATION_KEY, "done");
        if (updated > 0) {
            console.info(`[date-migration] normalized ${updated} record(s) to YYYY-MM-DD`);
        }
    } catch (err) {
        console.error("[date-migration] failed", err);
    }
}
