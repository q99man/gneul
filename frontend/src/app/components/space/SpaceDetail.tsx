import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import type { SpaceCategory, SpaceFormDto } from '../../api/types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

function resolveImageUrl(imgUrl: string): string {
  if (!imgUrl || typeof imgUrl !== 'string') return '';
  const trimmed = imgUrl.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `${window.location.protocol}${trimmed}`;
  if (trimmed.startsWith('/')) return `${API_BASE || window.location.origin}${trimmed}`;
  return `${API_BASE || window.location.origin}/${trimmed}`;
}

const CATEGORY_LABELS: Record<SpaceCategory, string> = {
  MEETING_ROOM: '회의실',
  STUDY_ROOM: '스터디룸',
  PARTY_ROOM: '파티룸',
  STUDIO: '촬영 스튜디오',
  PRACTICE_ROOM: '연습실',
  SEMINAR_ROOM: '세미나실',
  KITCHEN: '공유주방',
  WORKROOM: '작업실',
};

type Props = {
  space: SpaceFormDto;
  /** 모달/임베드에서 외부 레이아웃을 이미 가진 경우 */
  embedded?: boolean;
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5 last:border-b-0">
      <span className="shrink-0 text-sm font-medium text-gray-900">{label}</span>
      <span className="text-right text-sm text-gray-700">{value}</span>
    </div>
  );
}

export default function SpaceDetail({ space, embedded = false }: Props) {
  const navigate = useNavigate();

  const sortedImages = useMemo(() => {
    const list = space.spaceImgDtoList ?? [];
    return list
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .filter((img) => img?.imgUrl && String(img.imgUrl).trim() !== '')
      .map((img) => ({
        ...img,
        imgUrl: resolveImageUrl(img.imgUrl),
      }));
  }, [space.spaceImgDtoList]);

  const representativeImage =
    sortedImages.find((img) => img.repImgYn === 'Y')?.imgUrl ??
    sortedImages[0]?.imgUrl ??
    null;

  const [activeImage, setActiveImage] = useState<string | null>(representativeImage);

  useEffect(() => {
    setActiveImage(representativeImage);
  }, [representativeImage]);

  const price = Number(space.price ?? 0);

  return (
    <div
      className={
        embedded
          ? 'w-full'
          : 'min-h-screen bg-gradient-to-b from-[#f2f8fc] via-white to-[#f0f9f6] px-4 py-6 md:px-6 md:py-8'
      }
    >
      <div className={embedded ? 'grid w-full grid-cols-1 gap-6 xl:grid-cols-12' : 'mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 xl:grid-cols-12'}>
        <div className="flex flex-col gap-6 xl:col-span-8">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {CATEGORY_LABELS[space.category] ?? space.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{space.spaceName}</h1>
            <p className="mt-2 text-xl font-semibold text-gray-900">
              {price.toLocaleString()}원 <span className="text-sm font-normal text-gray-500">/ 시간</span>
            </p>
          </div>

          <Card className="overflow-hidden p-0">
            {!activeImage ? (
              <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-dashed bg-muted/30">
                <p className="text-sm text-muted-foreground">등록된 이미지가 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl bg-gray-100">
                <div className="aspect-[4/3] w-full">
                  <img
                    src={activeImage}
                    alt="공간 대표 이미지"
                    className="h-full w-full object-cover"
                    onError={() => setActiveImage(null)}
                  />
                </div>
              </div>
            )}

            {sortedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3 p-4 pt-0 md:grid-cols-5">
                {sortedImages.map((img) => {
                  const isActive = activeImage === img.imgUrl;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImage(img.imgUrl)}
                      className={`relative overflow-hidden rounded-lg border-2 bg-gray-100 transition-colors ${
                        isActive ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' : 'border-transparent'
                      }`}
                    >
                      <div className="aspect-square w-full">
                        <img
                          src={img.imgUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">공간 소개</h2>
            <p className="whitespace-pre-line text-sm leading-7 text-gray-700">
              {space.spaceDetail || '등록된 설명이 없습니다.'}
            </p>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">공지사항</h2>
              <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                {space.notice || '등록된 공지사항이 없습니다.'}
              </p>
            </Card>
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">환불 정책</h2>
              <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                {space.refundPolicy || '등록된 환불 정책이 없습니다.'}
              </p>
            </Card>
          </div>
        </div>

        <div className="xl:col-span-4">
          <Card className="sticky top-24 p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">예약 정보</h2>
            <div className="space-y-1">
              <InfoRow label="가격" value={<span className="font-semibold">{price.toLocaleString()}원 / 시간</span>} />
              <InfoRow label="최대 인원" value={`${space.maxCapacity}명`} />
              <InfoRow label="운영 시간" value={`${space.openTime} ~ ${space.closeTime}`} />
              <InfoRow label="주소" value={space.address || '-'} />
              <InfoRow label="주차" value={space.parkingAvailable ? '가능' : '불가'} />
              <InfoRow label="와이파이" value={space.wifiAvailable ? '제공' : '없음'} />
            </div>

            <Button
              className="mt-6 w-full py-6 text-base font-semibold"
              size="lg"
              onClick={() => navigate(`/order?spaceId=${space.id ?? 0}`)}
            >
              예약하기
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
