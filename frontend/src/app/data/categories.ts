/**
 * 홈 카테고리 카드용 고정 10개 카테고리 (이름 + 대표 이미지)
 * 이미지: Unsplash (비슷한 느낌의 공간/장소)
 */
export type CategoryItem = {
  name: string;
  image: string;
};

const U = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

export const CATEGORIES: CategoryItem[] = [
  { name: '전체', image: U('1484154216481-12d8bc4d0dc1') },           // 넓은 인테리어/통합
  { name: 'New', image: U('1497366216548-37526070297c') },             // 모던 오피스
  { name: '인기장소', image: U('1511795409834-ef04bbd61622') },       // 카페/트렌디
  { name: '스튜디오', image: U('1545235617-9465d2a55698') },           // 촬영 스튜디오
  { name: '파티룸', image: U('1514525253161-7a46d19cd819') },         // 파티 분위기
  { name: '연습실', image: U('1511671782779-c97d3d27a1d4') },         // 음악/연습
  { name: '캠핑/글램핑', image: U('1504280390367-361c6d9f38f4') },     // 텐트/캠핑
  { name: '회의실', image: U('1593065036034-6a4608d83a8f') },         // 회의실
  { name: '공유주방', image: U('1556911220-bff31c812dee') },          // 주방
  { name: '가정집', image: U('1586023492125-27b2c045f00f') },         // 아늑한 홈
];
