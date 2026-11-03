import { db, Trip, Schedule, Expense, Place, Checklist, TripBudget, Memo, Diary } from './db';
import sampleData from './defaultSampleData.json';

/**
 * 앱 실행 시 또는 데이터가 없을 때 기본 샘플 여행 데이터를 Dexie DB에 초기화합니다.
 * @param force 강제로 샘플 데이터를 덮어쓸지 여부 (기본값: false)
 */
export async function ensureDefaultSampleData(force: boolean = false): Promise<boolean> {
  try {
    const tripCount = await db.trips.count();
    const diaryCount = await db.diaries.count();

    // force가 아니면서 trips와 diaries가 모두 이미 존재하면 건너뜁니다.
    if (!force && tripCount > 0 && diaryCount > 0) {
      return false;
    }

    const trips: Trip[] = (sampleData.trips || []) as Trip[];
    if (trips.length === 0) return false;

    const primaryTrip = trips[0];
    const primaryTripId = primaryTrip.id;

    // 일정 날짜 정규화 (start_date + day_number 기반 날짜 보완)
    const tripStartDateStr = primaryTrip.start_date;
    const tripStartDate = tripStartDateStr ? new Date(tripStartDateStr) : null;

    const schedules: Schedule[] = (sampleData.schedules || []).map((s: any) => {
      let date = s.date;
      if (!date && tripStartDate && s.day_number) {
        const d = new Date(tripStartDate);
        d.setDate(d.getDate() + (s.day_number - 1));
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        date = `${year}-${month}-${day}`;
      }
      return {
        ...s,
        date: date || undefined
      } as Schedule;
    });

    const expenses: Expense[] = (sampleData.expenses || []) as Expense[];
    const places: Place[] = (sampleData.places || []) as Place[];

    // 체크리스트 정규화 (label -> title, is_checked -> is_completed)
    const checklists: Checklist[] = (sampleData.checklists || []).map((c: any) => ({
      id: c.id,
      trip_id: c.trip_id,
      category: c.category || '기타',
      title: c.title || c.label || '',
      is_completed: Boolean(c.is_completed ?? c.is_checked ?? false),
      created_at: c.created_at
    }));

    // 예산 정규화 (id 보장)
    const trip_budgets: TripBudget[] = (sampleData.budgets || []).map((b: any) => ({
      id: b.id || b.trip_id,
      trip_id: b.trip_id,
      total_budget_krw: b.total_budget_krw,
      created_at: b.created_at
    }));

    const memos: Memo[] = (sampleData.memos || []) as Memo[];
    const diaries: Diary[] = ((sampleData as any).diaries || []) as Diary[];

    await db.transaction('rw', [
      db.trips,
      db.schedules,
      db.expenses,
      db.places,
      db.checklists,
      db.trip_budgets,
      db.memos,
      db.diaries
    ], async () => {
      if (force && primaryTripId) {
        await db.trips.where('id').equals(primaryTripId).delete();
        await db.schedules.where('trip_id').equals(primaryTripId).delete();
        await db.expenses.where('trip_id').equals(primaryTripId).delete();
        await db.places.where('trip_id').equals(primaryTripId).delete();
        await db.checklists.where('trip_id').equals(primaryTripId).delete();
        await db.trip_budgets.where('trip_id').equals(primaryTripId).delete();
        await db.memos.where('trip_id').equals(primaryTripId).delete();
        await db.diaries.where('trip_id').equals(primaryTripId).delete();
      }

      if (trips.length > 0) await db.trips.bulkPut(trips);
      if (schedules.length > 0) await db.schedules.bulkPut(schedules);
      if (expenses.length > 0) await db.expenses.bulkPut(expenses);
      if (places.length > 0) await db.places.bulkPut(places);
      if (checklists.length > 0) await db.checklists.bulkPut(checklists);
      if (trip_budgets.length > 0) await db.trip_budgets.bulkPut(trip_budgets);
      if (memos.length > 0) await db.memos.bulkPut(memos);
      if (diaries.length > 0) await db.diaries.bulkPut(diaries);
    });

    if (primaryTripId && typeof window !== 'undefined') {
      const currentSelected = localStorage.getItem('hoju_selected_trip_id');
      if (!currentSelected) {
        localStorage.setItem('hoju_selected_trip_id', primaryTripId);
      }
    }

    console.log(`[seedData] 샘플 데이터 초기화 완료 (${trips.length} trips, ${schedules.length} schedules, ${expenses.length} expenses, ${places.length} places, ${diaries.length} diaries)`);
    return true;
  } catch (error) {
    console.error('[seedData] 샘플 데이터 초기화 실패:', error);
    return false;
  }
}
