import { api } from '@/lib/api';

export const AUTH_TOKEN_KEY = "ssc_token";

export function isAuthedClient(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(AUTH_TOKEN_KEY));
}

function parseJwt(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getUserRole(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;

  // Support real JWT tokens
  const jwtPayload = parseJwt(token);
  if (jwtPayload && jwtPayload.role) {
    return jwtPayload.role;
  }

  // Fallback: support old mock tokens during transition (mock_userId_role)
  const parts = token.split('_');
  if (parts.length >= 3 && parts[0] === 'mock') {
    return parts.slice(2).join('_');
  }

  return null;
}

export async function loginClient(email: string, password: string) {
  if (typeof window === "undefined") return;
  console.log('LOGIN START api.post to /auth/login', { email });
  try {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;
    console.log('LOGIN SUCCESS, token:', data.data?.token ? 'received' : 'missing');
    window.localStorage.setItem(AUTH_TOKEN_KEY, data.data?.token);
  } catch (error: any) {
    console.error('LOGIN FAILED:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response - network error');
    } else {
      console.error('Request setup error:', error.config);
    }
    throw error;
  }
}

export function logoutClient() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

