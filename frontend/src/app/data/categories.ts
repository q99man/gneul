/**
 * 홈 카테고리 카드용 고정 10개 카테고리 (이름 + 대표 이미지)
 * 이미지: Unsplash (images.unsplash.com) - 카테고리별 맞춤, 고품질
 */
export type CategoryItem = {
  name: string;
  image: string;
};

/** Unsplash 고품질 이미지 URL (선명도·해상도 보정) */
const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=85&auto=format&fit=crop`;

export const CATEGORIES: CategoryItem[] = [
  { name: '전체', image: U('1759691555285-74005fcf3ddf') },           // 넓은 인테리어/통합 공간
  { name: 'New', image: U('1497366216548-37526070297c') },            // 모던 오피스/새 공간
  { name: '인기장소', image: U('1511795409834-ef04bbd61622') },        // 카페/트렌디 스페이스
  { name: '스튜디오', image: U('1545235617-9465d2a55698') },          // 촬영 스튜디오
  { name: '파티룸', image: U('1514525253161-7a46d19cd819') },         // 파티/이벤트 공간
  { name: '연습실', image: U('1511671782779-c97d3d27a1d4') },          // 음악/연습실
  { name: '캠핑/글램핑', image: U('1504280390367-361c6d9f38f4') },     // 캠핑/글램핑
  { name: '회의실', image: U('1572025442811-aa5146a780fb') },         // 회의실
  { name: '공유주방', image: U('1729764335239-17aa9f2e2d27') },        // 공유/커머셜 주방
  { name: '가정집', image: U('1768488674723-2bf98b0a0515') },         // 아늑한 홈/게스트하우스
];
