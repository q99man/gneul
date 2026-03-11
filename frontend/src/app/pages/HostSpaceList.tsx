import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { getMySpaces } from '../api/space';
import type { SpaceDto } from '../api/types';
import { ApiError } from '../api/ApiError';

type HostSpaceListContentProps = {
  embedded?: boolean;
};

type HostSpaceRouteFrom = 'mypage-host-spaces' | 'host-spaces-page';

export const HostSpaceListContent: React.FC<HostSpaceListContentProps> = ({ embedded = false }) => {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState<SpaceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const routeFrom: HostSpaceRouteFrom = useMemo(
    () => (embedded ? 'mypage-host-spaces' : 'host-spaces-page'),
    [embedded]
  );

  const loadSpaces = useCallback(async (signal?: { cancelled: boolean }) => {
    try {
      setLoading(true);
      setError('');

      const data = await getMySpaces();
      if (signal?.cancelled) return;

      setSpaces(Array.isArray(data) ? data : []);
    } catch (error) {
      if (signal?.cancelled) return;

      if (error instanceof ApiError && error.status === 401) {
        navigate('/login', { replace: true });
        return;
      }

      setError(error instanceof Error ? error.message : '공간 목록을 불러오지 못했습니다.');
      setSpaces([]);
    } finally {
      if (!signal?.cancelled) {
        setLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const signal = { cancelled: false };
    void loadSpaces(signal);

    return () => {
      signal.cancelled = true;
    };
  }, [loadSpaces]);

  const handleCreate = useCallback(() => {
    navigate('/space/new', {
      state: { from: routeFrom },
    });
  }, [navigate, routeFrom]);

  const handleEdit = useCallback(
    (id: number) => {
      navigate(`/space/${id}/edit`, {
        state: { from: routeFrom },
      });
    },
    [navigate, routeFrom]
  );

  const content = (
    <div className="flex flex-col gap-6 p-0 md:p-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className={embedded ? 'text-[15px] font-semibold text-gray-800' : 'text-2xl font-bold'}>
          내 공간 관리
        </h2>

        <Button size={embedded ? 'sm' : 'default'} onClick={handleCreate}>
          새 그늘 등록
        </Button>
      </div>

      {loading ? (
        <div className="py-10 text-center font-sans text-gray-500">
          공간 목록을 불러오는 중입니다.
        </div>
      ) : error ? (
        <div className="rounded-xl border border-gray-200 bg-white/70 px-5 py-8">
          <p className="mb-4 font-sans text-gray-700">{error}</p>
          <button
            type="button"
            onClick={() => void loadSpaces()}
            className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-gray-800"
          >
            다시 시도
          </button>
        </div>
      ) : spaces.length === 0 ? (
        <div className="col-span-full rounded-lg border-2 border-dashed py-20 text-center text-gray-500">
          등록된 공간이 없습니다. 첫 번째 그늘을 만들어보세요!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => {
            const safePrice = Number(space.price ?? 0);
            const safeName = space.spaceName?.trim() || '이름 없는 공간';

            return (
              <Card
                key={space.id}
                className="overflow-hidden border border-gray-200/80 p-0 shadow-sm"
              >
                <div className="flex h-32 border-b border-gray-200 bg-gray-50">
                  <div className="h-full w-32 flex-shrink-0 overflow-hidden bg-gray-200">
                    {space.imgUrl ? (
                      <img
                        src={space.imgUrl}
                        alt={safeName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] text-gray-400">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 px-4 py-2">
                    <div className="flex h-full flex-col justify-center">
                      <h3 className="truncate text-[14px] font-semibold text-gray-900">
                        {safeName}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {safePrice.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end bg-gray-50 p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[13px]"
                    onClick={() => handleEdit(space.id)}
                  >
                    수정하기
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 md:py-8">
      <Card className="p-4 md:p-6">{content}</Card>
    </div>
  );
};