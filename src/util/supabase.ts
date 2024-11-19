import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://quality-reindeer-51284.upstash.io";
const supabaseAnonKey = "AchUAAIncDE3YTE2YmY4ZDJhNDQ0Nzk0OThmZGQ2NTBiZDBkZTY3M3AxNTEyODQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
