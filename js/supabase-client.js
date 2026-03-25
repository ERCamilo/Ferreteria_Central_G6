/**
 * Supabase Config — Central de Conexión
 * Ferretería Central - Grupo 6
 */

const SUPABASE_URL = 'https://dhhunkyzgwxmnedpuiag.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaHVua3l6Z3d4bW5lZHB1aWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTk1NjIsImV4cCI6MjA4OTk3NTU2Mn0.EVJBtjjMD5dg2ikugxK6TnwWe_ldsxJutUDEIGK5o6k';

// Inicializar el cliente global
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase Client Initialized');
