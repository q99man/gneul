import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { Plus, X, GripVertical } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import { createHostSpace, updateHostSpace, getHostSpaceDetail } from "../api/space";
import type { SpaceFormDto, SpaceCategory, SpaceImageMetaDto, SpaceImgDto } from "../api/types";
import { getMypage } from "../api/member";
import { ApiError } from "../api/ApiError";
import { AppSidebar } from "../components/ui/AppSidebar";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CATEGORIES: { value: SpaceCategory; label: string }[] = [
  { value: "MEETING_ROOM", label: "회의실" },
  { value: "STUDY_ROOM", label: "스터디룸" },
  { value: "PARTY_ROOM", label: "파티룸" },
  { value: "STUDIO", label: "촬영 스튜디오" },
  { value: "PRACTICE_ROOM", label: "연습실" },
  { value: "SEMINAR_ROOM", label: "세미나실" },
  { value: "KITCHEN", label: "공유주방" },
  { value: "WORKROOM", label: "작업실" },
];

const initialForm: SpaceFormDto = {
  id: null,
  spaceName: "",
  price: 0,
  spaceDetail: "",
  spaceStatus: "AVAILABLE",
  category: "MEETING_ROOM",
  address: "",
  detailAddress: "",
  maxCapacity: 1,
  contactPhone: "",
  openTime: "09:00",
  closeTime: "22:00",
  notice: "",
  refundPolicy: "",
  parkingAvailable: false,
  wifiAvailable: false,
  spaceImgIds: [],
};

type SpaceImageItem = {
  clientId: string;
  id?: number;
  file?: File;
  previewUrl: string;
  imageUrl?: string;
  isNew: boolean;
  isRepresentative: boolean;
  sortOrder: number;
  deleted: boolean;
};

type SortableImageCardProps = {
  item: SpaceImageItem;
  isActivePreview: boolean;
  onPreview: () => void;
  onSelectRepresentative: () => void;
  onToggleRemove: () => void;
};

function SortableImageCard({
  item,
  isActivePreview,
  onPreview,
  onSelectRepresentative,
  onToggleRemove,
}: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: item.clientId,
    disabled: item.deleted,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${item.deleted ? "" : "cursor-grab active:cursor-grabbing"
        } ${isDragging ? "scale-[1.02] shadow-2xl ring-2 ring-black/10 brightness-110" : "scale-100 shadow-sm hover:shadow-md"}`}
    >
      {/* 1. [통합] 대표 설정 및 표시 섹션 (좌측 상단) */}
      {!item.deleted && (
        <div className="absolute left-2.5 top-2.5 z-30">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectRepresentative();
            }}
            className="relative flex items-center justify-center transition-all duration-300 active:scale-90"
          >
            {item.isRepresentative ? (
              // 선택된 상태: 에메랄드 포인트가 들어간 블랙 배지
              <motion.div
                layoutId={`rep-badge-${item.clientId}`}
                className="flex h-7 items-center rounded-full bg-black px-3 text-[10px] font-bold tracking-tight text-white shadow-lg ring-1 ring-white/20"
              >
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                대표
              </motion.div>
            ) : (
              // 미선택 상태: 흰색 배경에서도 잘 보이도록 보강된 디자인
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-white/40 backdrop-blur-md shadow-[0_2px_4px_rgba(0,0,0,0.15)] ring-1 ring-black/10 transition-all hover:bg-white hover:ring-black/20 hover:scale-110">
                {/* 안쪽의 작은 원: 에메랄드 톤을 살짝 섞어 테두리와 통일감 부여 */}
                <div className="h-3 w-3 rounded-full border-[1.5px] border-emerald-500/50 bg-white/80 shadow-inner" />
              </div>
            )}
          </button>
        </div>
      )}

      {/* 2. 신규 알림 */}
      {item.isNew && !item.deleted && (
        <div className="absolute right-2.5 top-2.5 z-10 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-md group-hover:opacity-0 transition-opacity">
          NEW
        </div>
      )}

      {/* 이미지 영역 - 테두리 로직 개선 */}
      <div
        className={`relative aspect-square w-full overflow-hidden transition-all duration-300 ${isActivePreview
            ? "ring-[3px] ring-emerald-400 ring-inset"
            : "ring-1 ring-black/5 ring-inset"
          } ${item.deleted ? "opacity-30" : "opacity-100"}`}
        onClick={() => !isDragging && onPreview()}
      >
        <img
          src={item.previewUrl}
          alt="공간"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          draggable={false}
        />

        {/* 호버 시 은은한 오버레이 (선택 시에는 숨김 처리하여 테두리 강조) */}
        {!item.deleted && !isActivePreview && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        )}

        {/* 선택되었을 때 테두리 안쪽에 미세한 빛 효과 추가 (선택 사항) */}
        {isActivePreview && (
          <div className="absolute inset-0 pointer-events-none ring-1 ring-emerald-400/30 ring-inset" />
        )}
      </div>

      {/* 3. 삭제 버튼 */}
      {!item.deleted && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleRemove();
          }}
          className="absolute bottom-2.5 right-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 opacity-0 shadow-lg transition-all hover:text-red-500 group-hover:opacity-100 active:scale-90 ring-1 ring-black/5"
        >
          <X size={14} />
        </button>
      )}

      {/* 4. 삭제 대기 상태 - 사진이 보이는 반투명 레이아웃 */}
      {item.deleted && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/5 backdrop-blur-[1px]">
          <div className="mb-2 rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            삭제 대기
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleRemove();
            }}
            className="rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-black shadow-2xl hover:bg-gray-100 active:scale-95 transition-transform"
          >
            복구하기
          </button>
        </div>
      )}
    </div>
  );
}

function normalizeTime(v: string | undefined): string {
  if (!v) return "09:00";
  const match = String(v).trim().match(/^(\d{1,2}):(\d{2})/);
  if (match) return `${match[1].padStart(2, "0")}:${match[2]}`;
  return v.length >= 5 ? v.slice(0, 5) : "09:00";
}

function buildExistingClientId(id: number): string {
  return `existing-${id}`;
}

function buildNewClientId(): string {
  return `new-${crypto.randomUUID()}`;
}

function normalizeImageOrder(items: SpaceImageItem[]): SpaceImageItem[] {
  return items.map((img, idx) => ({
    ...img,
    sortOrder: idx,
  }));
}

function validateImageFiles(files: File[], currentVisibleCount: number) {
  const maxCount = 10;
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (currentVisibleCount + files.length > maxCount) {
    throw new Error("이미지는 최대 10장까지 업로드할 수 있습니다.");
  }

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`${file.name} 파일 형식은 지원되지 않습니다. (jpg, png, webp만 가능)`);
    }

    if (file.size > maxSize) {
      throw new Error(`${file.name} 파일은 5MB를 초과할 수 없습니다.`);
    }
  }
}

const HostSpaceForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { spaceId } = useParams<{ spaceId: string }>();
  const isEdit = Boolean(spaceId);
  const from = (location.state as { from?: string } | null)?.from;

  const [loading, setLoading] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [exitTarget, setExitTarget] = useState("/");
  const [exitMenu, setExitMenu] = useState<string | null>(null);
  const [form, setForm] = useState<SpaceFormDto>(initialForm);

  const [images, setImages] = useState<SpaceImageItem[]>([]);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);
  const submitWrapperRef = useRef<HTMLDivElement | null>(null);
  const [submitConfirmRect, setSubmitConfirmRect] = useState<DOMRect | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const previewUrlRegistryRef = useRef<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const visibleImages = useMemo(
    () => images.filter((img) => !img.deleted).sort((a, b) => a.sortOrder - b.sortOrder),
    [images]
  );

  const activePreviewSrc = useMemo(() => {
    if (!activePreviewId) return null;
    return images.find((img) => img.clientId === activePreviewId)?.previewUrl ?? null;
  }, [activePreviewId, images]);

  const ensureRepresentative = useCallback((items: SpaceImageItem[]): SpaceImageItem[] => {
    const visible = items.filter((img) => !img.deleted);

    if (visible.length === 0) {
      return items.map((img) => ({ ...img, isRepresentative: false }));
    }

    const hasRepresentative = visible.some((img) => img.isRepresentative);
    if (hasRepresentative) return items;

    const firstVisibleId = visible[0].clientId;
    return items.map((img) => ({
      ...img,
      isRepresentative: img.clientId === firstVisibleId,
    }));
  }, []);

  const ensureActivePreview = useCallback((items: SpaceImageItem[], currentActiveId: string | null) => {
    const visible = items.filter((img) => !img.deleted).sort((a, b) => a.sortOrder - b.sortOrder);

    if (visible.length === 0) return null;

    const stillExists = currentActiveId && visible.some((img) => img.clientId === currentActiveId);
    if (stillExists) return currentActiveId;

    const representative = visible.find((img) => img.isRepresentative);
    return representative?.clientId ?? visible[0].clientId;
  }, []);

  const syncImages = useCallback(
    (updater: (prev: SpaceImageItem[]) => SpaceImageItem[]) => {
      setImages((prev) => {
        const next = normalizeImageOrder(ensureRepresentative(updater(prev)));
        setActivePreviewId((currentActiveId) => ensureActivePreview(next, currentActiveId));
        return next;
      });
    },
    [ensureActivePreview, ensureRepresentative]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "maxCapacity" ? (parseInt(value, 10) || 0) : value,
    }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectRepresentative = useCallback(
    (clientId: string) => {
      syncImages((prev) =>
        prev.map((img) => ({
          ...img,
          isRepresentative: !img.deleted && img.clientId === clientId,
        }))
      );

      const preview = images.find((img) => img.clientId === clientId)?.previewUrl;
      if (preview) {
        setActivePreviewId(clientId);
      }

      toast.success("대표 사진으로 설정되었습니다.");
    },
    [images, syncImages]
  );

  const handleToggleRemoveImage = useCallback(
    (clientId: string) => {
      const target = images.find((img) => img.clientId === clientId);
      if (!target) return;

      if (target.isNew) {
        syncImages((prev) => {
          const removed = prev.find((img) => img.clientId === clientId);
          if (removed?.previewUrl) {
            URL.revokeObjectURL(removed.previewUrl);
            previewUrlRegistryRef.current.delete(removed.previewUrl);
          }
          return prev.filter((img) => img.clientId !== clientId);
        });

        toast.info("새 이미지가 제거되었습니다.");
        return;
      }

      const willDelete = !target.deleted;

      syncImages((prev) =>
        prev.map((img) =>
          img.clientId === clientId ? { ...img, deleted: willDelete } : img
        )
      );

      toast.info(willDelete ? "이미지가 삭제 대기열에 추가되었습니다." : "삭제가 취소되었습니다.");
    },
    [images, syncImages]
  );

  const handleAddNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    try {
      validateImageFiles(files, visibleImages.length);

      const newItems: SpaceImageItem[] = files.map((file, index) => {
        const previewUrl = URL.createObjectURL(file);
        previewUrlRegistryRef.current.add(previewUrl);

        return {
          clientId: buildNewClientId(),
          file,
          previewUrl,
          imageUrl: undefined,
          isNew: true,
          isRepresentative: false,
          sortOrder: visibleImages.length + index,
          deleted: false,
        };
      });

      syncImages((prev) => [...prev, ...newItems]);

      setActivePreviewId((current) => current ?? newItems[0]?.clientId ?? null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
    } finally {
      e.currentTarget.value = "";
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const visibleIds = visibleImages.map((img) => img.clientId);
    const oldIndex = visibleIds.findIndex((id) => id === active.id);
    const newIndex = visibleIds.findIndex((id) => id === over.id);

    if (oldIndex < 0 || newIndex < 0) return;

    const reorderedVisible = arrayMove(visibleImages, oldIndex, newIndex);

    syncImages((prev) => {
      const deletedItems = prev.filter((img) => img.deleted);
      return [...reorderedVisible, ...deletedItems];
    });
  };

  const clearAllNewPreviewUrls = useCallback(() => {
    setImages((prev) => {
      prev.forEach((item) => {
        if (item.isNew) {
          URL.revokeObjectURL(item.previewUrl);
          previewUrlRegistryRef.current.delete(item.previewUrl);
        }
      });
      return prev.filter((item) => !item.isNew);
    });
  }, []);

  const loadSpace = useCallback(
    async (id: string) => {
      try {
        const data = await getHostSpaceDetail(Number(id));

        clearAllNewPreviewUrls();

        const mappedImages: SpaceImageItem[] = Array.isArray(data.spaceImgDtoList)
          ? data.spaceImgDtoList.map((img: SpaceImgDto, idx: number) => ({
            clientId: buildExistingClientId(img.id),
            id: img.id,
            file: undefined,
            previewUrl: img.imgUrl,
            imageUrl: img.imgUrl,
            isNew: false,
            isRepresentative: img.repImgYn === "Y",
            sortOrder: img.sortOrder ?? idx,
            deleted: false,
          }))
          : [];

        const normalizedImages = normalizeImageOrder(
          ensureRepresentative(mappedImages)
        );

        const representative = normalizedImages.find((img) => img.isRepresentative);
        const firstVisible = normalizedImages.find((img) => !img.deleted);

        setForm({
          ...data,
          id: data.id ?? null,
          openTime: normalizeTime(data.openTime),
          closeTime: normalizeTime(data.closeTime),
          spaceImgIds: data.spaceImgIds ?? [],
        });

        setImages(normalizedImages);
        setActivePreviewId(representative?.clientId ?? firstVisible?.clientId ?? null);
      } catch {
        toast.error("공간 정보를 불러오지 못했습니다.");
        navigate("/mypage/host/spaces", { replace: true });
      }
    },
    [clearAllNewPreviewUrls, ensureRepresentative, isEdit, navigate]
  );

  useEffect(() => {
    if (spaceId) {
      void loadSpace(spaceId);
    }
  }, [spaceId, loadSpace]);

  useEffect(() => {
    return () => {
      previewUrlRegistryRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      previewUrlRegistryRef.current.clear();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getMypage();
        if (cancelled) return;

        const normalizedRole = (data.role ?? "").toUpperCase();
        const isHost =
          normalizedRole === "HOST" ||
          normalizedRole === "ROLE_HOST" ||
          normalizedRole === "ADMIN" ||
          normalizedRole === "ROLE_ADMIN";

        if (!isHost) {
          toast.error("호스트 권한이 필요합니다.");
          navigate("/", { replace: true });
          return;
        }

        setCheckingRole(false);
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError && err.status === 401) {
          toast.error("로그인이 필요합니다.");
          navigate("/login", { replace: true });
          return;
        }

        toast.error("권한 확인 중 오류가 발생했습니다.");
        navigate("/", { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const performSubmit = async () => {
    const remainingExistingIds = visibleImages
      .filter((img) => !img.isNew && img.id != null)
      .map((img) => img.id as number);

    const newImagesToUpload = visibleImages
      .filter((img) => img.isNew && img.file)
      .map((img) => img.file as File);

    if (visibleImages.length === 0) {
      toast.error("최소 1장 이상의 이미지를 유지해야 합니다.");
      return;
    }

    if (!isEdit && newImagesToUpload.length === 0) {
      toast.error("최소 한 개의 이미지는 필수입니다.");
      return;
    }

    const updatedForm: SpaceFormDto = {
      ...form,
      spaceImgIds: remainingExistingIds,
    };

    const imageMetaList: SpaceImageMetaDto[] = images
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({
        clientId: img.clientId,
        imageId: img.id ?? null,
        isNew: img.isNew,
        deleted: img.deleted,
        representative: img.isRepresentative && !img.deleted,
        sortOrder: img.sortOrder,
        originalFileName: img.file?.name,
      }));

    try {
      setLoading(true);

      /**
       * 현재 API 계약 기준으로는:
       * - 유지할 기존 이미지 id 목록
       * - 업로드할 신규 이미지 files
       * - 대표 이미지 key
       * 정도만 보냅니다.
       *
       * 만약 "기존 + 신규 전체 순서 저장", "기존 이미지 삭제 목록", "대표 신규 이미지의 정확한 서버 매핑"까지
       * 완전히 처리하려면 백엔드에서 imageMetaList 같은 구조를 받도록 확장하는 게 가장 안전합니다.
       */
      if (isEdit && form.id) {
        await updateHostSpace(form.id, {
          space: updatedForm,
          imageMetaList,
          images: newImagesToUpload,
        });
        toast.success("공간이 수정되었습니다.");
      } else {
        await createHostSpace({
          space: updatedForm,
          imageMetaList,
          images: newImagesToUpload,
        });
        toast.success("공간이 등록되었습니다.");
      }
      // 호스트 등록/수정 완료 후에는 항상 호스트 공간 리스트로 복귀
      navigate("/mypage/host/spaces");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || (isEdit ? "공간 수정 실패" : "공간 등록 실패"));
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(isEdit ? "공간 수정 실패" : "공간 등록 실패");
      }
    } finally {
      setLoading(false);
    }
  };

  const openSubmitConfirm = () => {
    if (!submitWrapperRef.current) return;
    setSubmitConfirmRect(submitWrapperRef.current.getBoundingClientRect());
    setShowSubmitConfirm(true);
  };

  const requestClose = (path?: string) => {
    // 호스트 수정/등록 화면에서의 모든 종료 동선은 항상 리스트로 복귀
    const target = path ?? "/mypage/host/spaces";
    setExitTarget(target);
    setExitMenu(null);
    setIsExiting(true);
  };

  if (checkingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f2f8fc] via-white to-[#f0f9f6] flex items-center justify-center">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-gray-500">권한을 확인하는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onAnimationComplete={() => {
        if (isExiting) {
          navigate(exitTarget, exitMenu ? { state: { menu: exitMenu } } : undefined);
        }
      }}
      className="fixed inset-0 z-[60] flex flex-col bg-gradient-to-b from-[#f2f8fc] via-white to-[#f0f9f6] font-sans text-gray-900 md:flex-row"
    >
      <div className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="flex flex-col gap-6 xl:col-span-4 min-w-0">
                <Card className="p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">이미지 등록</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      첫 번째 이미지가 대표 사진으로 설정됩니다. (최대 10장)
                    </p>
                  </div>

                  {/* 메인 미리보기 영역 */}
                  <div className="mb-4 overflow-hidden rounded-xl border bg-gray-50 aspect-[4/5] flex items-center justify-center">
                    {activePreviewSrc ? (
                      <img src={activePreviewSrc} alt="미리보기" className="h-full w-full object-cover" />
                    ) : (
                      <p className="text-sm text-muted-foreground">이미지를 업로드 해주세요.</p>
                    )}
                  </div>

                  {/* 드래그 앤 드롭 썸네일 영역 */}
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={visibleImages.map((item) => item.clientId)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-4 gap-2">
                        {images
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((item) => (
                            <SortableImageCard
                              key={item.clientId}
                              item={item}
                              isActivePreview={activePreviewId === item.clientId}
                              onPreview={() => setActivePreviewId(item.clientId)}
                              onSelectRepresentative={() => handleSelectRepresentative(item.clientId)}
                              onToggleRemove={() => handleToggleRemoveImage(item.clientId)}
                            />
                          ))}
                        <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 hover:bg-gray-50 transition-colors">
                          <input type="file" multiple accept="image/*" onChange={handleAddNewImages} className="hidden" />
                          <Plus className="text-gray-400" size={20} />
                        </label>
                      </div>
                    </SortableContext>
                  </DndContext>
                </Card>
              </div>

              {/* 2열: 정보 요약 (기본, 위치, 이용 정보) */}
              <div className="flex flex-col gap-6 xl:col-span-4 min-w-0">
                {/* 기본 정보 */}
                <Card className="p-6">
                  <h2 className="mb-4 text-lg font-semibold border-b pb-2 text-blue-700">기본 정보</h2>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="spaceName">공간명</Label>
                      <Input id="spaceName" name="spaceName" value={form.spaceName} onChange={handleChange} placeholder="공간명을 입력하세요" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">가격 (시간당)</Label>
                        <Input id="price" name="price" type="number" value={form.price ?? ""} onChange={handleChange} placeholder="0" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="maxCapacity">최대 인원</Label>
                        <Input id="maxCapacity" name="maxCapacity" type="number" value={form.maxCapacity ?? ""} onChange={handleChange} placeholder="1" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category">카테고리</Label>
                        <select id="category" name="category" value={form.category} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                          {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="spaceStatus">운영 상태</Label>
                        <select id="spaceStatus" name="spaceStatus" value={form.spaceStatus} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                          <option value="AVAILABLE">이용 가능</option>
                          <option value="UNAVAILABLE">이용 불가</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="mb-4 text-lg font-semibold">위치 정보</h2>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="address">주소</Label>
                      <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="기본 주소" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="detailAddress">상세 주소</Label>
                      <Input id="detailAddress" name="detailAddress" value={form.detailAddress ?? ""} onChange={handleChange} placeholder="나머지 상세 주소" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contactPhone">연락처</Label>
                      <Input id="contactPhone" name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="예: 010-1234-5678" required />
                    </div>
                  </div>
                </Card>

                {/* 이용 정보 */}
                <Card className="p-6">
                  <h2 className="mb-4 text-lg font-semibold border-b pb-2 text-amber-700">운영 설정</h2>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="openTime">오픈 시간</Label>
                        <Input id="openTime" name="openTime" type="time" value={form.openTime} onChange={handleChange} required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="closeTime">마감 시간</Label>
                        <Input id="closeTime" name="closeTime" type="time" value={form.closeTime} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="flex gap-6 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="parkingAvailable" checked={form.parkingAvailable} onChange={handleCheckbox} className="h-4 w-4 rounded" />
                        <span className="text-sm font-medium">주차 가능 여부</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="wifiAvailable" checked={form.wifiAvailable} onChange={handleCheckbox} className="h-4 w-4 rounded" />
                        <span className="text-sm font-medium">와이파이 제공</span>
                      </label>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 3열: 상세 내용 입력 (공간 설명, 공지, 환불 정책) */}
              <div className="flex flex-col gap-6 xl:col-span-4 min-w-0">
                <Card className="p-6 flex-1">
                  <h2 className="mb-4 text-lg font-semibold border-b pb-2 text-purple-700">상세 설명</h2>
                  <div className="grid gap-2">
                    <Label htmlFor="spaceDetail">공간 소개</Label>
                    <Textarea
                      id="spaceDetail"
                      name="spaceDetail"
                      placeholder="게스트에게 공간의 매력을 상세히 설명해주세요."
                      className="min-h-[300px] leading-6"
                      value={form.spaceDetail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="mb-4 text-lg font-semibold border-b pb-2">기타 정책</h2>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="notice" className="text-xs text-gray-500">공지사항</Label>
                      <Textarea id="notice" name="notice" placeholder="필독 주의사항" className="min-h-[100px] text-sm" value={form.notice ?? ""} onChange={handleChange} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="refundPolicy" className="text-xs text-gray-500">환불 정책</Label>
                      <Textarea id="refundPolicy" name="refundPolicy" placeholder="환불 규정" className="min-h-[100px] text-sm" value={form.refundPolicy ?? ""} onChange={handleChange} />
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* 하단 플로팅 액션 바 (우측 하단 정렬) */}
            <div className="flex justify-end gap-3 mt-4 border-t pt-6" ref={submitWrapperRef}>
              <Button type="button" variant="outline" className="px-8 h-11" onClick={() => requestClose()}>
                취소
              </Button>
              <Button
                type="button"
                className="px-8 h-11 bg-black text-white hover:bg-gray-800"
                disabled={loading}
                onClick={() => {
                  if (!formRef.current) return;
                  const isValid = formRef.current.reportValidity();
                  if (!isValid) {
                    const firstInvalid = formRef.current.querySelector<HTMLElement>(":invalid");
                    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
                    firstInvalid?.focus();
                    return;
                  }
                  openSubmitConfirm();
                }}
              >
                {loading ? "처리 중..." : isEdit ? "수정하기" : "등록하기"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden min-h-0 md:flex">
        <AppSidebar onClose={requestClose} isInline closeOnly />
      </div>

      {typeof document !== "undefined" &&
        showSubmitConfirm &&
        submitConfirmRect &&
        createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[90] cursor-default bg-black/30"
              aria-label="등록/수정 확인 닫기"
              onClick={() => setShowSubmitConfirm(false)}
            />

            <div
              className="fixed z-[91] w-[min(360px,calc(100vw-24px))] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl"
              style={{
                top: Math.min(submitConfirmRect.top - 12, window.innerHeight - 220),
                left: Math.min(
                  Math.max(12, submitConfirmRect.left + submitConfirmRect.width - 360),
                  window.innerWidth - 372
                ),
              }}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {isEdit ? "공간 정보를 수정할까요?" : "공간을 등록할까요?"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    확인을 누르면 저장이 진행됩니다.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSubmitConfirm(false)}
                  disabled={loading}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  className="bg-black text-white hover:bg-gray-800"
                  disabled={loading}
                  onClick={async () => {
                    setShowSubmitConfirm(false);
                    await performSubmit();
                  }}
                >
                  {loading ? "처리 중..." : "확인"}
                </Button>
              </div>
            </div>
          </>,
          document.body
        )}
    </motion.div>
  );
};

export default HostSpaceForm;