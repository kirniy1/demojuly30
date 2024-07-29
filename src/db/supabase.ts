import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://koophtqyywofqkaqozjw.supabase.co'; // Ввести Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvb3BodHF5eXdvZnFrYXFvemp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIyNzkxOTAsImV4cCI6MjAzNzg1NTE5MH0.kxaeb2G4_W3MPtuG-Vb0hsnl1fS3OEjzoFCC8HNYTKI'; // Ввести Supabase Anon Key

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
