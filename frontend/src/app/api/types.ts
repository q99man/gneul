export type SpaceStatus = 'AVAILABLE' | 'UNAVAILABLE';

export type SpaceCategory =
  | 'MEETING_ROOM'
  | 'STUDY_ROOM'
  | 'PARTY_ROOM'
  | 'STUDIO'
  | 'PRACTICE_ROOM'
  | 'SEMINAR_ROOM'
  | 'KITCHEN'
  | 'WORKROOM';

export type ReservationStatus = 'RESERVED' | 'CANCELLED';

export type SpaceImgDto = {
  id: number;
  imgName: string;
  oriImgName: string;
  imgUrl: string;
  repImgYn: string;
};

export type SpaceFormDto = {
  id?: number | null;
  spaceName: string;
  price: number;
  spaceDetail: string;
  spaceStatus: SpaceStatus;
  category: SpaceCategory;
  address: string;
  detailAddress?: string;
  maxCapacity: number;
  contactPhone: string;
  openTime: string;
  closeTime: string;
  notice?: string;
  refundPolicy?: string;
  parkingAvailable: boolean;
  wifiAvailable: boolean;
  spaceImgDtoList?: SpaceImgDto[];
  spaceImgIds?: number[];
};

export type MainSpaceDto = {
  id: number;
  spaceName: string;
  spaceDetail: string;
  imgUrl: string;
  price: number;
  category: SpaceCategory; // 추가
  address: string;         // 추가
  maxCapacity: number;     // 추가
};

export type SpaceDto = {
  id: number;
  spaceName: string;
  price: number;
  /** 호스트 센터 목록 썸네일용 이미지 URL (없을 수 있음) */
  imgUrl?: string;
  hostName?: string;
};

export type CartItemDto = {
  spaceId: number;
  count: number;
};

export type ReservationDto = {
  spaceId: number;
  checkInTime: string;  // 변경: ISO String 형식 기대
  checkOutTime: string; // 변경
  occupants: number;    // 변경: count 대신 occupants
};

export type ReservationItemDto = {
  spaceName: string;
  count: number; // occupants와 매핑됨
  reservationPrice: number;
  imgUrl: string;
  checkInTime: string;
  checkOutTime: string;
  totalPrice: number;
};

export type WishlistDetailDto = {
  wishlistId: number;
  spaceId: number;
  spaceName: string;
  price: number;
  imgUrl: string;
};

export type ReservationHistDto = {
  reservationId: number;
  reservationDate: string;
  reservationStatus: ReservationStatus;
  reservationItemDtoList: ReservationItemDto[];
  totalPrice: number; // 추가
};

/** 주문서 폼 GET 응답 (ReservationService 기반으로 재정의 필요할 수 있음) */
export type OrderFormDto = {
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  orderItems: Array<{
    spaceId: number;
    spaceName: string;
    count: number;
    reservationPrice: number;
    imgUrl: string;
  }>;
  totalPrice: number;
};

/** 예약 확정 POST 요청 */
export type ReservationConfirmDto = {
  phoneNumber: string;
  address: string;
  orderDtoList: Array<{ spaceId: number; count: number }>;
};

/** 예약 확인(성공) 페이지 GET 응답 */
export type ReservationSuccessDto = {
  reservationId: number;
  spaceName: string;
  totalPrice: number;
  reservationDate: string; // 추가
};

/** 마이페이지 GET 응답 */
export type MypageDto = {
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  /** 사용자 권한 */
  role?: 'USER' | 'ADMIN' | 'HOST' | 'GUEST'; // GUEST 추가
  /** 백엔드에서 없을 수 있음 */
  recentReservations?: Array<ReservationHistDto>;
};
