import Dexie, { type EntityTable } from 'dexie';

export interface Trip {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  family_count?: number;
  cities?: string;
  created_at?: string;
}

export interface Schedule {
  id: string;
  trip_id: string;
  title: string;
  day_number: number;
  date?: string;
  start_time?: string;
  end_time?: string;
  memo?: string;
  place_id?: string;
  display_order?: number;
  created_at?: string;
  is_completed?: boolean;
  type?: string;
  city?: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  schedule_id?: string;
  date: string;
  amount: number;
  title: string;
  category: string;
  city?: string;
  currency?: string;
  created_at?: string;
}

export interface Place {
  id: string;
  trip_id: string;
  day_number?: number;
  order_index?: number;
  name: string; // db에서 name을 사용
  category: string;
  city?: string;
  rating?: number;
  is_kid_friendly?: boolean;
  notes?: string;
  google_map_url?: string;
  is_favorite?: boolean;
  operating_hours?: string;
  contact_phone?: string;
  website_url?: string;
  address?: string;
  visit_count?: number;
  lat?: number;
  lng?: number;
  schedule_id?: string;
  memo?: string;
  images?: string[];
  created_at?: string;
}

export interface Checklist {
  id: string;
  trip_id: string;
  title: string;
  is_completed: boolean;
  category?: string;
  created_at?: string;
}

export interface TripSetting {
  id: string;
  trip_id: string;
  family_count?: number;
  created_at?: string;
}

export interface TripBudget {
  id: string;
  trip_id: string;
  total_budget_krw?: number;
  created_at?: string;
}

export interface Diary {
  id: string;
  trip_id: string;
  date: string;
  title: string;
  content: string;
  images?: string[]; // base64 strings or URLs
  created_at?: string;
}

export interface Memo {
  id: string;
  trip_id: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface GoogleMapLink {
  id: string;
  trip_id: string;
  title: string;
  url: string;
  city?: string;
  created_at?: string;
}

export interface TravelInfo {
  id: string;
  country_code: string;
  city_code: string;
  section: string;
  item_index: number;
  title: string;
  date?: string | null;
  content?: any;
  icon?: string;
  created_at?: string;
}

export class AppDatabase extends Dexie {
  trips!: EntityTable<Trip, 'id'>;
  schedules!: EntityTable<Schedule, 'id'>;
  expenses!: EntityTable<Expense, 'id'>;
  places!: EntityTable<Place, 'id'>;
  checklists!: EntityTable<Checklist, 'id'>;
  trip_settings!: EntityTable<TripSetting, 'id'>;
  trip_budgets!: EntityTable<TripBudget, 'id'>;
  diaries!: EntityTable<Diary, 'id'>;
  memos!: EntityTable<Memo, 'id'>;
  google_map_links!: EntityTable<GoogleMapLink, 'id'>;
  travel_info!: EntityTable<TravelInfo, 'id'>;

  constructor() {
    super('HojuAppDatabase');
    
    // Schema definition
    // Only index fields you intend to query on (e.g., using where())
    this.version(1).stores({
      trips: 'id, start_date, created_at',
      schedules: 'id, trip_id, day_number, date',
      expenses: 'id, trip_id, date, category, schedule_id',
      places: 'id, trip_id, day_number, schedule_id',
      checklists: 'id, trip_id, category, is_completed',
      trip_settings: 'id, trip_id',
      trip_budgets: 'id, trip_id',
      diaries: 'id, trip_id, date',
      memos: 'id, trip_id',
      google_map_links: 'id, trip_id',
      travel_info: 'id, [country_code+city_code]'
    });
  }
}

export const db = new AppDatabase();

// Helper to generate UUIDs
export function generateId(): string {
  return crypto.randomUUID();
}
