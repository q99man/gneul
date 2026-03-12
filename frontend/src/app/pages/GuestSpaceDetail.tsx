import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { getSpaceDetail } from '../api/space';
import { ApiError } from '../api/ApiError';
import SpaceDetail from '../components/space/SpaceDetail';
import { Button } from '../components/ui/button';
import type { SpaceFormDto } from '../api/types';
import type { GuestSpaceCardDest } from './GuestSpaceCard';

type ExitRect = { left: number; top: number; width: number; height: number };

type ModalProps = {
  selectedDest: GuestSpaceCardDest | null;
  cardRect: DOMRect | null;
  exitRect: ExitRect | null;
  onClose: () => void;
};

export function GuestSpaceDetail({ selectedDest, cardRect, exitRect, onClose }: ModalProps) {
  const [space, setSpace] = useState<SpaceFormDto | null>(null);
  const [loading, setLoading] = useState(false);

  const spaceId = useMemo(() => {
    const raw = selectedDest?.id;
    if (!raw) return null;
    const id = Number(raw);
    return Number.isNaN(id) ? null : id;
  }, [selectedDest?.id]);

  useEffect(() => {
    if (!selectedDest) return;
    setSpace(null);
  }, [selectedDest]);

  useEffect(() => {
    if (!spaceId) return;
    let cancelled = false;
    setLoading(true);
    getSpaceDetail(spaceId)
      .then((data) => {
        if (cancelled) return;
        setSpace(data);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof ApiError) toast.error(error.message || '공간 정보를 불러오지 못했습니다.');
        else toast.error('공간 정보를 불러오지 못했습니다.');
        onClose();
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [spaceId, onClose]);

  useEffect(() => {
    if (!selectedDest) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedDest]);

  useEffect(() => {
    if (!selectedDest) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedDest, onClose]);

  const initialStyle =
    cardRect != null
      ? {
          top: cardRect.top,
          left: cardRect.left,
          width: cardRect.width,
          height: cardRect.height,
        }
      : { top: 80, left: '50%', width: 'min(1100px, calc(100vw - 32px))', height: 'min(92vh, calc(100vh - 80px))' };

  const exitStyle =
    exitRect != null
      ? {
          top: exitRect.top,
          left: exitRect.left,
          width: exitRect.width,
          height: exitRect.height,
        }
      : { opacity: 0, scale: 0.98 };

  return (
    <AnimatePresence>
      {selectedDest && (
        <motion.div
          className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="닫기"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="absolute overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
            style={initialStyle as any}
            initial={{
              borderRadius: 18,
              opacity: 1,
            }}
            animate={{
              top: 64,
              left: '50%',
              x: '-50%',
              width: 'min(1100px, calc(100vw - 32px))',
              height: 'min(92vh, calc(100vh - 80px))',
              borderRadius: 18,
            }}
            exit={{
              ...(exitStyle as any),
              borderRadius: 18,
              transition: { duration: 0.25, ease: 'easeOut' },
            }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{selectedDest.title}</p>
                <p className="truncate text-xs text-gray-500">{selectedDest.category}</p>
              </div>
              <Button variant="ghost" onClick={onClose}>
                닫기
              </Button>
            </div>

            <div className="h-[calc(100%-52px)] overflow-auto">
              {loading && (
                <div className="flex min-h-[40vh] items-center justify-center">
                  <p className="text-sm text-gray-500">공간 정보를 불러오는 중입니다...</p>
                </div>
              )}
              {!loading && !space && (
                <div className="flex min-h-[40vh] items-center justify-center">
                  <p className="text-sm text-gray-500">공간 정보를 찾을 수 없습니다.</p>
                </div>
              )}
              {space && <SpaceDetail space={space} embedded />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function GuestSpaceDetailRoute() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const [space, setSpace] = useState<SpaceFormDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId) return;

    const id = Number(spaceId);
    if (Number.isNaN(id)) {
      toast.error('잘못된 공간 정보입니다.');
      navigate('/', { replace: true });
      return;
    }

    setLoading(true);
    getSpaceDetail(id)
      .then((data) => setSpace(data))
      .catch((error) => {
        if (error instanceof ApiError) {
          toast.error(error.message || '공간 정보를 불러오지 못했습니다.');
        } else {
          toast.error('공간 정보를 불러오지 못했습니다.');
        }
        navigate('/', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [spaceId, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">공간 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">공간 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return <SpaceDetail space={space} />;
}
