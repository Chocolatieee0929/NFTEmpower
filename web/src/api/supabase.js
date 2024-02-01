import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabase = createClient(
  'https://utpucjjautnqdhxwiupe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0cHVjamphdXRucWRoeHdpdXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYzNDc4MTYsImV4cCI6MjAyMTkyMzgxNn0.ND-VbcH-IDKEYOF8VRv49LRaQJpuEKLuoT4mjGf16vQ'
);

export default supabase;
