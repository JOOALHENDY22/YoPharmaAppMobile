import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Polyfill WebSocket for Node.js versions below 22 required by @supabase/supabase-js
if (typeof global.WebSocket === 'undefined') {
  try {
    const ws = require('ws');
    (global as any).WebSocket = ws;
  } catch (e) {
    console.error("Could not load ws module for Supabase WebSocket polyfill:", e);
  }
}

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn("Supabase credentials missing in .env. Caching layer is disabled.");
}
