import { request, type SpringPage } from './http';
import type { ReservationDto, ReservationHistDto, OrderFormDto, ReservationConfirmDto, ReservationSuccessDto } from './types';
import { getToken } from '../utils/auth';

export async function reserve(body: ReservationDto): Promise<number> {
  return await request<number>('/api/reservation', { method: 'POST', body });
}

export async function getReservationHistory(params?: { page?: number }): Promise<SpringPage<ReservationHistDto>> {
  const page = params?.page;
  const path = page === undefined ? '/api/reservation/hist' : `/api/reservation/hist/${page}`;
  return await request<SpringPage<ReservationHistDto>>(path, { method: 'GET' });
}

/**
 * 예약 목록 조회 (페이지네이션)
 * 백엔드: GET /api/reservation/list/{page}
 * 토큰 필요.
 */
export async function getReservationList(params?: { page?: number }): Promise<SpringPage<ReservationHistDto>> {
  const token = getToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  const page = params?.page ?? 0;
  return await request<SpringPage<ReservationHistDto>>(`/api/reservation/list/${page}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function cancelReservation(reservationId: number): Promise<number> {
  const token = getToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  return await request<number>(`/api/reservation/${reservationId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** 주문서 폼 조회 (장바구니 아이템 기준) */
export async function getOrderForm(cartItemIds: number[]): Promise<OrderFormDto> {
  const query =
    cartItemIds.length > 0 ? { cartItemIds: cartItemIds.join(',') } : undefined;
  return await request<OrderFormDto>('/api/reservation/form', {
    method: 'GET',
    query: query as Record<string, string> | undefined,
  });
}

/** 예약 확정 */
export async function confirmReservation(body: ReservationConfirmDto): Promise<void> {
  await request('/api/reservation/confirm', { method: 'POST', body });
}

/** 예약 확인(성공) 페이지 조회 */
export async function getReservationSuccess(id: string): Promise<ReservationSuccessDto> {
  return await request<ReservationSuccessDto>(`/api/reservation/success/${id}`, {
    method: 'GET',
  });
}

