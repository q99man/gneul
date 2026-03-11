const TOKEN_KEY = 'token';
const USER_NAME_KEY = 'userName';

/**
 * localStorage의 JWT에서 subject(이메일)를 꺼냅니다.
 * 토큰이 없거나 파싱 실패 시 null.
 */
export function getUserEmailFromToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    const json = atob(base64);
    const data = JSON.parse(json) as { sub?: string };
    return typeof data.sub === 'string' ? data.sub : null;
  } catch {
    return null;
  }
}

/**
 * 헤더 환영 문구용 표시 이름.
 * 일반 로그인 시 저장된 이름 → 없으면 이메일 @ 앞부분 사용.
 */
export function getDisplayName(): string | null {
  const stored = localStorage.getItem(USER_NAME_KEY);
  if (stored) return stored;
  const email = getUserEmailFromToken();
  if (!email) return null;
  const at = email.indexOf('@');
  return at > 0 ? email.slice(0, at) : email;
}

export function setUserName(name: string): void {
  localStorage.setItem(USER_NAME_KEY, name);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_NAME_KEY);
}
