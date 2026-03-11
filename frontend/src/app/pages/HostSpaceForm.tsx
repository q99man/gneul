import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { Plus, X } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import { createHostSpace, updateHostSpace, getHostSpaceDetail } from "../api/space";
import type { SpaceFormDto, SpaceCategory, SpaceImgDto } from "../api/types";
import { getMypage } from "../api/member";
import { ApiError } from "../api/ApiError";
import { AppSidebar } from "../components/ui/AppSidebar";

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

function normalizeTime(v: string | undefined): string {
  if (!v) return "09:00";
  const match = String(v).trim().match(/^(\d{1,2}):(\d{2})/);
  if (match) return `${match[1].padStart(2, "0")}:${match[2]}`;
  return v.length >= 5 ? v.slice(0, 5) : "09:00";
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
  // 이미지 고급화: 기존 이미지 유지/삭제 + 새 이미지 추가
  const [existingImages, setExistingImages] = useState<SpaceImgDto[]>([]);
  const [removedExistingIds, setRemovedExistingIds] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [activePreviewSrc, setActivePreviewSrc] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitWrapperRef = useRef<HTMLDivElement | null>(null);
  const [submitConfirmRect, setSubmitConfirmRect] = useState<DOMRect | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleRemoveExisting = (imgId: number) => {
    setRemovedExistingIds((prev) => (prev.includes(imgId) ? prev : [...prev, imgId]));
    toast.info("이미지가 삭제 대기열에 추가되었습니다.");
  };

  const handleUndoRemoveExisting = (imgId: number) => {
    setRemovedExistingIds((prev) => prev.filter((id) => id !== imgId));
  };

  const handleAddNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setNewImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...previews]);

    if (!activePreviewSrc && previews[0]) {
      setActivePreviewSrc(previews[0]);
    }
    // 같은 파일 다시 선택 가능하도록 초기화
    e.currentTarget.value = "";
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed);
      const next = prev.filter((_, i) => i !== index);
      // active가 지워졌다면 남아있는 걸로 이동
      if (activePreviewSrc === removed) {
        setActivePreviewSrc(next[0] ?? null);
      }
      return next;
    });
  };

  const loadSpace = useCallback(async (id: string) => {
    try {
      const data = await getHostSpaceDetail(Number(id));
      setForm({
        ...data,
        id: data.id ?? null,
        openTime: normalizeTime(data.openTime),
        closeTime: normalizeTime(data.closeTime),
        spaceImgIds: data.spaceImgIds ?? [],
      });
      setExistingImages(Array.isArray(data.spaceImgDtoList) ? data.spaceImgDtoList : []);
      setRemovedExistingIds([]);
      // 새로 추가하려던 이미지/미리보기 초기화
      setNewImages([]);
      setNewImagePreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      const firstExisting = data.spaceImgDtoList?.[0]?.imgUrl ?? null;
      setActivePreviewSrc(firstExisting);
    } catch (err) {
      toast.error("공간 정보를 불러오지 못했습니다.");
      navigate(isEdit ? "/mypage" : "/", { replace: true });
    }
  }, [isEdit, navigate]);

  useEffect(() => {
    if (spaceId) loadSpace(spaceId);
  }, [spaceId, loadSpace]);

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
    const remainingIds = existingImages
      .filter((img) => !removedExistingIds.includes(img.id))
      .map((img) => img.id);

    const updatedForm: SpaceFormDto = {
      ...form,
      spaceImgIds: remainingIds,
    };

    const hasAnyImageForCreate = newImages.length > 0;
    if (!isEdit && !hasAnyImageForCreate) {
      toast.error("최소 한 개의 이미지는 필수입니다.");
      return;
    }

    try {
      setLoading(true);
      if (isEdit && form.id) {
        await updateHostSpace(form.id, { space: updatedForm, images: newImages });
        toast.success("공간이 수정되었습니다.");
      } else {
        await createHostSpace({ space: updatedForm, images: newImages });
        toast.success("공간이 등록되었습니다.");
      }
      // 성공 후에는 진입 경로에 따라 적절한 공간 관리 화면으로 복귀
      if (from === "host-spaces-page") {
        navigate("/mypage/host/spaces");
      } else if (from === "mypage-host-spaces") {
        navigate("/mypage", { state: { menu: "host_spaces" } });
      } else {
        navigate("/mypage");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (isEdit ? "공간 수정 실패" : "공간 등록 실패"));
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
    let target = path;
    if (!target) {
      // 수정/등록 진입 경로에 따라 기본 복귀 경로 설정
      if (from === "host-spaces-page") {
        target = "/mypage/host/spaces";
      } else {
        target = "/mypage";
      }
    }
    setExitTarget(target);
    // 마이페이지 내 "내 공간 관리"에서 왔다면 돌아갈 때 해당 탭을 다시 선택
    if (!path && from === "mypage-host-spaces") {
      setExitMenu("host_spaces");
    } else {
      setExitMenu(null);
    }
    setIsExiting(true);
  };

  // 퇴장 애니메이션 콜백 누락 대비
  useEffect(() => {
    if (!isExiting) return;
    const t = setTimeout(() => {
      navigate(exitTarget, exitMenu ? { state: { menu: exitMenu } } : undefined);
    }, 450);
    return () => clearTimeout(t);
  }, [isExiting, exitTarget, exitMenu, navigate]);

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
      className="fixed inset-0 flex flex-col md:flex-row bg-gradient-to-b from-[#f2f8fc] via-white to-[#f0f9f6] text-gray-900 font-sans z-[60]"
    >
      {/* 본문 영역 */}
      <div className="flex-1 min-w-0 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <form
            ref={formRef}
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-6"
          >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* 좌측 컬럼: 기본 정보 + 위치 정보 */}
            <div className="flex flex-col gap-6">
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold">기본 정보</h2>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="spaceName">공간명</Label>
                    <Input
                      id="spaceName"
                      name="spaceName"
                      placeholder="공간명"
                      value={form.spaceName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">가격 (원)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={form.price ?? ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">카테고리</Label>
                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      required
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxCapacity">최대 인원</Label>
                    <Input
                      id="maxCapacity"
                      name="maxCapacity"
                      type="number"
                      min={1}
                      value={form.maxCapacity ?? ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="spaceStatus">공간 상태</Label>
                    <select
                      id="spaceStatus"
                      name="spaceStatus"
                      value={form.spaceStatus}
                      onChange={handleChange}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="AVAILABLE">이용 가능</option>
                      <option value="UNAVAILABLE">이용 불가</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold">위치 정보</h2>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address">주소</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="주소"
                      value={form.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="detailAddress">상세 주소</Label>
                    <Input
                      id="detailAddress"
                      name="detailAddress"
                      placeholder="상세 주소"
                      value={form.detailAddress ?? ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contactPhone">연락처</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      placeholder="연락처"
                      value={form.contactPhone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* 가운데 컬럼: 이용 정보 + 상세 설명 */}
            <div className="flex flex-col gap-6">
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold">이용 정보</h2>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="openTime">오픈 시간</Label>
                      <Input
                        id="openTime"
                        name="openTime"
                        type="time"
                        value={form.openTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="closeTime">마감 시간</Label>
                      <Input
                        id="closeTime"
                        name="closeTime"
                        type="time"
                        value={form.closeTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="parkingAvailable"
                        checked={form.parkingAvailable}
                        onChange={handleCheckbox}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-sm">주차 가능</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="wifiAvailable"
                        checked={form.wifiAvailable}
                        onChange={handleCheckbox}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-sm">와이파이</span>
                    </label>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold">상세 설명</h2>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="spaceDetail">공간 상세 설명</Label>
                    <Textarea
                      id="spaceDetail"
                      name="spaceDetail"
                      placeholder="공간에 대한 설명을 입력하세요"
                      className="min-h-[160px]"
                      value={form.spaceDetail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notice">공지사항</Label>
                    <Textarea
                      id="notice"
                      name="notice"
                      placeholder="공지사항 (선택)"
                      className="min-h-[90px]"
                      value={form.notice ?? ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="refundPolicy">환불 정책</Label>
                    <Textarea
                      id="refundPolicy"
                      name="refundPolicy"
                      placeholder="환불 정책 (선택)"
                      className="min-h-[90px]"
                      value={form.refundPolicy ?? ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* 우측 컬럼: 이미지 업로드 + 큰 미리보기 */}
            <div className="flex flex-col gap-6">
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold">이미지</h2>
                <div className="grid gap-3">
                  <Label>기존 이미지 / 새 이미지 추가</Label>

                  {/* 썸네일 그리드: 기존 + 새 이미지 추가 */}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {existingImages.map((img) => {
                      const isRemoved = removedExistingIds.includes(img.id);
                      return (
                        <div key={img.id} className="relative group aspect-square">
                          <button
                            type="button"
                            onClick={() => setActivePreviewSrc(img.imgUrl)}
                            className={`h-full w-full overflow-hidden rounded-lg border bg-gray-100 ${
                              activePreviewSrc === img.imgUrl ? "ring-2 ring-black" : ""
                            } ${isRemoved ? "opacity-35" : ""}`}
                            title="미리보기로 보기"
                          >
                            <img
                              src={img.imgUrl}
                              alt="기존 이미지"
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                            {isRemoved && (
                              <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-red-600">
                                삭제 예정
                              </span>
                            )}
                          </button>

                          {!isRemoved ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveExisting(img.id)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                              aria-label="기존 이미지 삭제 예약"
                            >
                              <X size={16} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUndoRemoveExisting(img.id)}
                              className="absolute top-1 right-1 bg-white text-gray-800 rounded-full px-2 py-1 text-[11px] font-semibold border opacity-0 group-hover:opacity-100 transition"
                              aria-label="삭제 취소"
                            >
                              취소
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {newImagePreviews.map((src, idx) => (
                      <div key={src} className="relative group aspect-square">
                        <button
                          type="button"
                          onClick={() => setActivePreviewSrc(src)}
                          className={`h-full w-full overflow-hidden rounded-lg border bg-gray-100 ${
                            activePreviewSrc === src ? "ring-2 ring-black" : ""
                          }`}
                          title="미리보기로 보기"
                        >
                          <img
                            src={src}
                            alt={`새 이미지 ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(idx)}
                          className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          aria-label="새 이미지 제거"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}

                    <label className="border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 aspect-square">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleAddNewImages}
                        className="hidden"
                      />
                      <Plus className="text-gray-400" />
                    </label>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {isEdit
                      ? "기존 이미지는 삭제 예약/취소가 가능하고, 새 이미지는 여러 번 추가할 수 있습니다."
                      : "첫 번째 등록 시 최소 1장 이상 업로드가 필요합니다."}
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold">이미지 미리보기</h2>
                {!activePreviewSrc ? (
                  <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed bg-muted/30">
                    <p className="text-sm text-muted-foreground">선택된 이미지가 없습니다.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="relative w-full overflow-hidden rounded-lg border bg-gray-100">
                      <div className="aspect-[4/5] w-full">
                        <img
                          src={activePreviewSrc}
                          alt="이미지 미리보기"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-3" ref={submitWrapperRef}>
            <Button
              type="button"
              variant="outline"
              className="px-6"
              onClick={() => requestClose()}
            >
              취소
            </Button>
            <Button
              type="button"
              className="px-6"
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
              {loading ? (isEdit ? "수정 중..." : "등록 중...") : isEdit ? "수정하기" : "등록하기"}
            </Button>
          </div>
          </form>
        </div>
      </div>

      {/* 우측 사이드 메뉴 (마이페이지와 동일: 데스크톱 인라인 표시) */}
      <div className="hidden md:flex min-h-0">
        <AppSidebar onClose={requestClose} isInline closeOnly />
      </div>

      {/* 제출 확인 팝업: 로그아웃 말풍선과 동일한 스타일 */}
      {typeof document !== "undefined" &&
        showSubmitConfirm &&
        submitConfirmRect &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[95]"
              aria-hidden
              onClick={() => setShowSubmitConfirm(false)}
            />
            <div
              className="fixed z-[200] p-3 rounded-xl bg-white border border-gray-200 shadow-lg min-w-[200px]"
              style={{
                top: submitConfirmRect.top,
                left: (() => {
                  const viewW = window.innerWidth;
                  const approximateWidth = 220;
                  const padding = 12;
                  const maxLeft = viewW - approximateWidth - padding;
                  const rightAligned = submitConfirmRect.right - approximateWidth;
                  return Math.max(padding, Math.min(rightAligned, maxLeft));
                })(),
                maxWidth: window.innerWidth - 32,
                transform: "translateY(-100%)",
              }}
            >
              <p className="text-[13px] text-gray-800 font-medium mb-3 text-center">
                공간을 {isEdit ? "수정" : "등록"}하시겠습니까?
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    void performSubmit();
                    setShowSubmitConfirm(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-black text-white text-[13px] font-medium cursor-pointer hover:bg-gray-800"
                >
                  확인
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] font-medium cursor-pointer hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </motion.div>
  );
};

export default HostSpaceForm;
