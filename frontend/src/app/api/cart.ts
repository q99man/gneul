import { request } from './http';
import type { CartItemDto } from './types';

export async function addToCart(body: CartItemDto): Promise<number> {
  return await request<number>('/api/cart', { method: 'POST', body });
}

