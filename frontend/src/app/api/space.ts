import { request, type SpringPage } from './http';
import type { MainSpaceDto, SpaceFormDto, SpaceDto } from './types';
import { getToken } from '../utils/auth';

/** 1. 공통 인증 헤더 생성 */
function requireAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${token}` };
}

/** 2. FormData 빌더: @RequestPart 구조에 맞게 JSON Blob과 파일을 조합 */
function buildSpaceFormData(space: SpaceFormDto, images: File[]): FormData {
  const formData = new FormData();
  
  // 텍스트 데이터를 JSON Blob으로 변환하여 'space' 파트에 추가
  formData.append(
    'space',
    new Blob([JSON.stringify(space)], { type: 'application/json' })
  );
  
  // 이미지 파일들을 'spaceImgFile' 파트에 추가
  images.forEach((file) => formData.append('spaceImgFile', file, file.name));
  
  return formData;
}

/** 3. 호스트용 공간 등록 (첫 번째 이미지 필수) */
export async function createHostSpace(params: { space: SpaceFormDto; images: File[] }): Promise<void> {
  // 프론트엔드 자체 검증: 대표 이미지가 반드시 있어야 함
  if (!params.images || params.images.length === 0) {
    throw new Error('대표 이미지(첫 번째 이미지)는 필수입니다.');
  }

  const formData = buildSpaceFormData(params.space, params.images);
  
  await request<void>('/api/host/space/new', {
    method: 'POST',
    body: formData,
    headers: requireAuthHeaders(),
  });
}

/** 4. 호스트용 공간 수정 (이미지는 선택 사항) */
export async function updateHostSpace(spaceId: number, params: { space: SpaceFormDto; images: File[] }): Promise<void> {
  const formData = buildSpaceFormData(params.space, params.images);
  
  await request<void>(`/api/host/space/${spaceId}`, {
    method: 'POST',
    body: formData,
    headers: requireAuthHeaders(),
  });
}

/** 5. 호스트용 공간 상세 조회 */
export async function getHostSpaceDetail(spaceId: number): Promise<SpaceFormDto> {
  return await request<SpaceFormDto>(`/api/host/space/${spaceId}`, {
    method: 'GET',
    headers: requireAuthHeaders(),
  });
}

/** 6. 호스트 자신의 공간 목록 조회 */
export async function getMySpaces(): Promise<SpaceDto[]> {
  return await request<SpaceDto[]>('/api/host/spaces', {
    method: 'GET',
    headers: requireAuthHeaders(),
  });
}

/** 7. 메인 화면용 공간 목록 조회 (누구나 접근 가능) */
export async function getMainSpaces(params?: {
  page?: number;
  size?: number;
}): Promise<SpringPage<MainSpaceDto>> {
  const page = params?.page ?? 0;
  const size = params?.size ?? 20;
  
  return await request<SpringPage<MainSpaceDto>>('/api/space/main', {
    method: 'GET',
    query: { page, size },
  });
}