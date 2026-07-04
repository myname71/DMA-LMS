import { supabase } from './supabase';

const SESSION_KEY = 'dma_auth_session';

export function getSessionToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.token || null;
  } catch { return null; }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getSessionToken();
  if (!token) return {};
  return { 'Authorization': `Bearer ${token}` };
}

export async function getSupabaseAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return getAuthHeaders();
  return { 'Authorization': `Bearer ${token}` };
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function saveSession(userId: string, token: string, remember: boolean) {
  const payload = JSON.stringify({ userId, token });
  if (remember) {
    localStorage.setItem(SESSION_KEY, payload);
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, payload);
    localStorage.removeItem(SESSION_KEY);
  }
}
