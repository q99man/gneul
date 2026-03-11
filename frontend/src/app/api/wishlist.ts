import { request } from './http';
import { getToken } from '../utils/auth';
import type { WishlistDetailDto } from './types';

function asId(spaceId: number | string): number {
  if (typeof spaceId === 'number') return spaceId;
  const n = parseInt(spaceId, 10);
  if (Number.isNaN(n)) throw new Error('spaceId가 올바르지 않습니다.');
  return n;
}

export async function getWishlistStatus(spaceId: number | string): Promise<boolean> {
  const token = getToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  return await request<boolean>(`/api/wishlist/status/${asId(spaceId)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function toggleWishlist(spaceId: number | string): Promise<boolean> {
  const token = getToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  return await request<boolean>(`/api/wishlist/toggle/${asId(spaceId)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getWishlistList(): Promise<WishlistDetailDto[]> {
  const token = getToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  const res = await request<unknown>('/api/wishlist/list', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (Array.isArray(res)) return res as WishlistDetailDto[];
  // 백엔드/프록시에서 객체로 감싸 내려오는 경우 대비
  const maybe = res as { content?: unknown; data?: unknown; wishlist?: unknown; wishlistDetailDtoList?: unknown };
  const candidates = [
    maybe?.content,
    maybe?.data,
    maybe?.wishlist,
    maybe?.wishlistDetailDtoList,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c as WishlistDetailDto[];
  }
  return [];
}

