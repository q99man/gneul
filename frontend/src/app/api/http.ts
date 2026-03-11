import { ApiError } from './ApiError';

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

type Primitive = string | number | boolean;

type Query = Record<string, Primitive | null | undefined>;

type RequestOptions = Omit<RequestInit, 'body'> & {
  query?: Query;
  body?: unknown;
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

function withQuery(path: string, query?: Query): string {
  if (!query) return path;
  const pairs: string[] = [];
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  if (pairs.length === 0) return path;
  return path.includes('?') ? `${path}&${pairs.join('&')}` : `${path}?${pairs.join('&')}`;
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  return await res.text();
}

export async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, body: rawBody, ...fetchOptions } = options; // query와 body를 분리
  
  const urlPath = withQuery(path, query);
  const url = isAbsoluteUrl(urlPath) ? urlPath : `${API_BASE}${urlPath}`;

  const headers = new Headers(fetchOptions.headers ?? {});
  headers.set('Accept', headers.get('Accept') ?? 'application/json');

  let body: BodyInit | undefined;
  if (rawBody !== undefined) {
    if (isFormData(rawBody)) {
      body = rawBody; // FormData인 경우 Content-Type을 수동으로 설정하지 않음
    } else if (typeof rawBody === 'string') {
      body = rawBody;
      headers.set('Content-Type', headers.get('Content-Type') ?? 'text/plain;charset=UTF-8');
    } else {
      body = JSON.stringify(rawBody);
      headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');
    }
  }

  const res = await fetch(url, {
    ...fetchOptions, // fetch에 필요한 옵션만 전달
    headers,
    body,
  });

  const data = await parseBody(res);

  if (!res.ok) {
    const message =
      typeof data === 'string'
        ? data || `${res.status} ${res.statusText}`
        : `${res.status} ${res.statusText}`;
    throw new ApiError({ status: res.status, url, message, data });
  }

  return data as T;
}

