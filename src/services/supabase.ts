import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

if (isDemoMode) {
  console.warn(
    '[FORGA] Mode démo activé — Supabase non configuré. ' +
    'Les données sont stockées localement uniquement.'
  );
}

// En mode démo, on crée un client avec une URL factice
// Les appels échoueront silencieusement, les stores locaux prennent le relais
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: !isDemoMode,
      persistSession: !isDemoMode,
      detectSessionInUrl: false,
    },
  },
);

export default supabase;
