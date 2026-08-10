import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type BirthChart = {
  id: string;
  person_name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  ascendant: string;
  moon_sign: string;
  sun_sign: string;
  planet_positions: any[];
  created_at: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};
