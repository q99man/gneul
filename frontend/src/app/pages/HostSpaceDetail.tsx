import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { getHostSpaceDetail } from "../api/space";
import type { SpaceFormDto, SpaceCategory } from "../api/types";
import { HostSpaceShell } from "./HostSpaceShell";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

/** 상대 경로 이미지 URL을 요청 가능한 절대 경로로 변환 */
function resolveImageUrl(imgUrl: string): string {
  if (!imgUrl || typeof imgUrl !== "string") return "";
  const trimmed = imgUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `${window.location.protocol}${trimmed}`;
  if (trimmed.startsWith("/")) return `${API_BASE || window.location.origin}${trimmed}`;
  return `${API_BASE || window.location.origin}/${trimmed}`;
}

const CATEGORY_LABELS: Record<SpaceCategory, string> = {
  MEETING_ROOM: "회의실",
  STUDY_ROOM: "스터디룸",
  PARTY_ROOM: "파티룸",
  STUDIO: "촬영 스튜디오",
  PRACTICE_ROOM: "연습실",
  SEMINAR_ROOM: "세미나실",
  KITCHEN: "공유주방",
  WORKROOM: "작업실",
};

export default function HostSpaceDetailPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const [space, setSpace] = useState<SpaceFormDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!spaceId) {
      setLoading(false);
      setError("공간 ID가 없습니다.");
      return;
    }
    const id = Number(spaceId);
    if (Number.isNaN(id)) {
      setLoading(false);
      setError("잘못된 공간 ID입니다.");
      return;
    }
    setLoading(true);
    setError(null);
    getHostSpaceDetail(id)
      .then((data) => setSpace(data))
      .catch((err) => setError(err?.message ?? "공간 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [spaceId]);

  if (loading) {
    return (
      <HostSpaceShell onClose={() => navigate("/mypage/host/spaces")}>
        <div className="flex min-h-[420px] items-center justify-center px-4 py-8">
          <p className="text-muted-foreground">불러오는 중...</p>
        </div>
      </HostSpaceShell>
    );
  }
  if (error || !space) {
    return (
      <HostSpaceShell onClose={() => navigate("/mypage/host/spaces")}>
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 px-4 py-8">
          <p className="text-destructive">{error ?? "공간 정보를 찾을 수 없습니다."}</p>
          <Button variant="outline" onClick={() => navigate("/mypage/host/spaces")}>
            목록으로
          </Button>
        </div>
      </HostSpaceShell>
    );
  }

  return (
    <HostSpaceShell onClose={() => navigate("/mypage/host/spaces")}>
      <HostSpaceDetailContent space={space} />
    </HostSpaceShell>
  );
}

type Props = { space: SpaceFormDto };

function HostSpaceDetailContent({ space }: Props) {
  const navigate = useNavigate();

  const sortedImages = useMemo(() => {
    const list = space.spaceImgDtoList ?? [];
    return list
      .filter((img) => img?.imgUrl != null && String(img.imgUrl).trim() !== "")
      .map((img) => ({ ...img, imgUrl: resolveImageUrl(img.imgUrl) }));
  }, [space.spaceImgDtoList]);

  const initialImage =
    sortedImages.find((img) => img.repImgYn === "Y")?.imgUrl ??
    sortedImages[0]?.imgUrl ??
    null;

  const [activeImage, setActiveImage] = useState<string | null>(initialImage);

  useEffect(() => {
    setActiveImage(initialImage);
  }, [initialImage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-6 md:px-6 md:py-8"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
        {/* 헤더 섹션 */}
        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {CATEGORY_LABELS[space.category]}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              space.spaceStatus === "AVAILABLE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {space.spaceStatus === "AVAILABLE" ? "이용 가능" : "이용 불가"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{space.spaceName}</h1>
        </div>

        {/* 3열 그리드 시작 */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          
          {/* 1열: 이미지 정보 */}
          <div className="flex flex-col gap-4">
            <Card className="overflow-hidden p-3">
              <h2 className="mb-3 text-lg font-semibold">이미지</h2>
              <div className="overflow-hidden rounded-xl border bg-gray-50">
                <div className="aspect-[4/5] w-full">
                  {activeImage ? (
                    <img src={activeImage} alt="공간 이미지" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">이미지 없음</div>
                  )}
                </div>
              </div>
              {/* 썸네일 그리드 */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                {sortedImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.imgUrl)}
                    className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                      activeImage === img.imgUrl ? "border-black" : "border-transparent opacity-60"
                    }`}
                  >
                    <img src={img.imgUrl} alt="썸네일" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* 2열: 기본정보, 위치정보, 이용정보 */}
          <div className="flex flex-col gap-6">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold border-b pb-2">기본 정보</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">가격</span><span className="font-semibold">{space.price.toLocaleString()}원</span></div>
                <div className="flex justify-between"><span className="text-gray-500">최대 인원</span><span>{space.maxCapacity}명</span></div>
                <div className="flex justify-between"><span className="text-gray-500">연락처</span><span>{space.contactPhone}</span></div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold border-b pb-2">위치 정보</h2>
              <div className="text-sm space-y-1">
                <p className="font-medium text-gray-900">{space.address}</p>
                <p className="text-gray-500">{space.detailAddress}</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold border-b pb-2">이용 정보</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">운영 시간</span><span>{space.openTime} ~ {space.closeTime}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">주차 가능</span><span>{space.parkingAvailable ? "예" : "아니오"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">와이파이</span><span>{space.wifiAvailable ? "제공" : "미제공"}</span></div>
              </div>
            </Card>
          </div>

          {/* 3열: 상세설명, 공지사항, 환불정책 */}
          <div className="flex flex-col gap-6">
            <Card className="flex-1 p-6">
              <h2 className="mb-4 text-lg font-semibold border-b pb-2">상세 설명</h2>
              <div className="max-h-[300px] overflow-y-auto text-sm leading-6 text-gray-700 whitespace-pre-line">
                {space.spaceDetail || "설명이 없습니다."}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-3 text-md font-semibold text-gray-900">공지사항</h2>
              <p className="text-xs leading-5 text-gray-600 whitespace-pre-line border-l-2 border-gray-200 pl-3">
                {space.notice || "공지사항이 없습니다."}
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="mb-3 text-md font-semibold text-gray-900">환불 정책</h2>
              <p className="text-xs leading-5 text-gray-600 whitespace-pre-line border-l-2 border-gray-200 pl-3">
                {space.refundPolicy || "환불 정책이 없습니다."}
              </p>
            </Card>
          </div>
        </div>

        {/* 하단 버튼 섹션 */}
        <div className="mt-8 flex justify-end gap-3 border-t pt-6">
          <Button type="button" variant="outline" className="w-32" onClick={() => navigate("/mypage/host/spaces")}>
            목록으로
          </Button>
          <Button
            type="button"
            className="w-32 bg-black text-white hover:bg-gray-800"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/mypage/host/spaces/${space.id}/edit`);
            }}
          >
            수정하기
          </Button>
        </div>
      </div>
    </motion.div>
  );
}