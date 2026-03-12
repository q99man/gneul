import { request, type SpringPage } from './http';
import type {
  MainSpaceDto,
  SpaceDto,
  SpaceFormDto,
  SpaceImageMetaDto,
  SpaceStatus,
} from './types';
import { getToken } from '../utils/auth';

function requireAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function buildSpaceFormData(
  space: SpaceFormDto,
  imageMetaList: SpaceImageMetaDto[],
  images: File[]
): FormData {
  const formData = new FormData();

  formData.append('space', new Blob([JSON.stringify(space)], { type: 'application/json' }));
  formData.append(
    'imageMetaList',
    new Blob([JSON.stringify(imageMetaList)], { type: 'application/json' })
  );

  images.forEach((file) => {
    formData.append('spaceImgFile', file, file.name);
  });

  return formData;
}

export async function createHostSpace(params: {
  space: SpaceFormDto;
  imageMetaList: SpaceImageMetaDto[];
  images: File[];
}): Promise<void> {
  const formData = buildSpaceFormData(params.space, params.imageMetaList, params.images);

  await request<void>('/api/host/space/new', {
    method: 'POST',
    body: formData,
    headers: requireAuthHeaders(),
  });
}

export async function updateHostSpace(
  spaceId: number,
  params: { space: SpaceFormDto; imageMetaList: SpaceImageMetaDto[]; images: File[] }
): Promise<void> {
  const formData = buildSpaceFormData(params.space, params.imageMetaList, params.images);

  await request<void>(`/api/host/space/${spaceId}`, {
    method: 'POST',
    body: formData,
    headers: requireAuthHeaders(),
  });
}

export async function getHostSpaceDetail(spaceId: number): Promise<SpaceFormDto> {
  return await request<SpaceFormDto>(`/api/host/space/${spaceId}`, {
    method: 'GET',
    headers: requireAuthHeaders(),
  });
}

export async function getMySpaces(): Promise<SpaceDto[]> {
  return await request<SpaceDto[]>('/api/host/spaces', {
    method: 'GET',
    headers: requireAuthHeaders(),
  });
}

export async function deleteHostSpace(spaceId: number): Promise<void> {
  await request<void>(`/api/host/space/${spaceId}`, {
    method: 'DELETE',
    headers: requireAuthHeaders(),
  });
}

export async function toggleSpaceStatus(spaceId: number): Promise<SpaceStatus> {
  return await request<SpaceStatus>(`/api/host/space/${spaceId}/status`, {
    method: 'PATCH',
    headers: requireAuthHeaders(),
  });
}

/** 고객용 공간 상세 조회 (인증 불필요) */
export async function getSpaceDetail(spaceId: number): Promise<SpaceFormDto> {
  return await request<SpaceFormDto>(`/api/space/${spaceId}`, {
    method: 'GET',
  });
}

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
