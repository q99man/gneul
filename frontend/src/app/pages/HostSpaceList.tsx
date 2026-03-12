import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { getMySpaces, deleteHostSpace, toggleSpaceStatus } from '../api/space';
import type { SpaceDto } from '../api/types';
import { ApiError } from '../api/ApiError';
import { toast } from 'sonner';

type HostSpaceListContentProps = {
  embedded?: boolean;
};

type HostSpaceRouteFrom = 'mypage-host-spaces' | 'host-spaces-page';

export const HostSpaceListContent: React.FC<HostSpaceListContentProps> = ({ embedded = false }) => {
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState<SpaceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ id: number; name: string; rect: DOMRect } | null>(null);

  const routeFrom: HostSpaceRouteFrom = useMemo(
    () => (embedded ? 'mypage-host-spaces' : 'host-spaces-page'),
    [embedded]
  );

  const loadSpaces = useCallback(
    async (signal?: { cancelled: boolean }) => {
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
    },
    [navigate]
  );

  useEffect(() => {
    const signal = { cancelled: false };
    void loadSpaces(signal);

    return () => {
      signal.cancelled = true;
    };
  }, [loadSpaces]);

  const handleCreate = useCallback(() => {
    navigate('/mypage/host/spaces/new', {
      state: { from: routeFrom },
    });
  }, [navigate, routeFrom]);

  const handleDetail = useCallback(
    (id: number) => {
      navigate(`/mypage/host/spaces/${id}`, {
        state: { from: routeFrom },
      });
    },
    [navigate, routeFrom]
  );

  const handleEdit = useCallback(
    (id: number) => {
      navigate(`/mypage/host/spaces/${id}/edit`, {
        state: { from: routeFrom },
      });
    },
    [navigate, routeFrom]
  );

  const handleDeleteClick = useCallback(
    (id: number, name: string, button: HTMLButtonElement | null) => {
      if (deletingId === id) return;
      if (!button) return;
      setConfirmTarget({ id, name, rect: button.getBoundingClientRect() });
    },
    [deletingId]
  );

  const handleDeleteConfirmed = useCallback(
    async (id: number) => {
      setConfirmTarget(null);

      try {
        setDeletingId(id);
        await deleteHostSpace(id);
        toast.success('공간이 삭제되었습니다.');
        setSpaces((prev) => prev.filter((space) => space.id !== id));
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          navigate('/login', { replace: true });
          return;
        }

        toast.error(err instanceof Error ? err.message : '공간 삭제 중 오류가 발생했습니다.');
      } finally {
        setDeletingId(null);
      }
    },
    [navigate]
  );

  const handleToggleStatus = useCallback(
    async (id: number) => {
      try {
        setTogglingId(id);
        const updatedStatus = await toggleSpaceStatus(id);

        setSpaces((prev) =>
          prev.map((space) =>
            space.id === id
              ? {
                ...space,
                spaceStatus: updatedStatus,
              }
              : space
          )
        );

        toast.success('공간 상태가 변경되었습니다.');
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          navigate('/login', { replace: true });
          return;
        }

        toast.error(error instanceof Error ? error.message : '상태 변경 실패');
      } finally {
        setTogglingId(null);
      }
    },
    [navigate]
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
            const isDeleting = deletingId === space.id;
            const isToggling = togglingId === space.id;
            const isBusy = isDeleting || isToggling;

            return (
              <Card
                key={space.id}
                className="overflow-hidden border border-gray-200/80 p-0 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => handleDetail(space.id)}
                  className="flex h-32 w-full border-b border-gray-200 bg-gray-50 text-left"
                >
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
                      <p className="mt-1 text-xs">
                        <span
                          className={
                            space.spaceStatus === 'AVAILABLE'
                              ? 'font-medium text-green-600'
                              : 'font-medium text-gray-500'
                          }
                        >
                          {space.spaceStatus === 'AVAILABLE' ? '이용 가능' : '이용 불가'}
                        </span>
                      </p>
                    </div>
                  </div>
                </button>

                <div className="grid grid-cols-3 gap-2 border-t border-gray-200/80 bg-gray-50 p-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-[13px]"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEdit(space.id);
                    }}
                    disabled={isBusy}
                  >
                    수정하기
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-red-200 text-[13px] text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteClick(space.id, safeName, e.currentTarget);
                    }}
                    disabled={isBusy}
                  >
                    {isDeleting ? '삭제 중...' : '삭제하기'}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    className={`w-full text-[13px] ${space.spaceStatus === 'AVAILABLE'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void handleToggleStatus(space.id);
                    }}
                    disabled={isBusy}
                  >
                    {isToggling
                      ? '변경 중...'
                      : space.spaceStatus === 'AVAILABLE'
                        ? '이용중'
                        : '이용중지'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {typeof document !== 'undefined' &&
        confirmTarget &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[95]"
              aria-hidden
              onClick={() => setConfirmTarget(null)}
            />
            <div
              className="fixed z-[96] min-w-[200px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
              style={{
                top: confirmTarget.rect.top,
                left: (() => {
                  const viewW = window.innerWidth;
                  const approximateWidth = 240;
                  const center =
                    confirmTarget.rect.left +
                    confirmTarget.rect.width / 2 -
                    approximateWidth / 2;
                  const padding = 12;
                  const maxLeft = viewW - approximateWidth - padding;
                  return Math.max(padding, Math.min(center, maxLeft));
                })(),
                transform: 'translateY(-100%)',
                maxWidth: window.innerWidth - 32,
              }}
            >
              <p className="mb-3 text-center text-[13px] font-medium text-gray-800">
                &quot;{confirmTarget.name}&quot; 공간을 삭제하시겠습니까?
                <br />
                <span className="text-gray-500">삭제 후 복구할 수 없습니다.</span>
              </p>

              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  className="cursor-pointer rounded-lg bg-black px-4 py-2 text-[13px] font-medium text-white hover:bg-gray-800"
                  onClick={() => handleDeleteConfirmed(confirmTarget.id)}
                >
                  확인
                </button>
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setConfirmTarget(null)}
                >
                  취소
                </button>
              </div>
            </div>
          </>,
          document.body
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
