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
  sortOrder?: number;
};

export type HostSpaceDetailDto = {
  id: number;
  spaceName: string;
  category: SpaceCategory;
  price: number;
  spaceDetail: string;
  spaceStatus: SpaceStatus;
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
  spaceImgDtoList: SpaceImgDto[];
};

export type SpaceImageMetaDto = {
  clientId: string;
  imageId?: number | null;
  isNew: boolean;
  deleted: boolean;
  representative: boolean;
  sortOrder: number;
  originalFileName?: string;
};

export type SpaceFormDto = {
  id: number | null;
  spaceName: string;
  price: number;
  spaceDetail: string;
  spaceStatus: 'AVAILABLE' | 'UNAVAILABLE';
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
  spaceImgIds: number[];
  spaceImgDtoList?: SpaceImgDto[];
};

export type MainSpaceDto = {
  id: number;
  spaceName: string;
  spaceDetail: string;
  imgUrl: string;
  price: number;
  category: SpaceCategory;
  address: string;
  maxCapacity: number;
};

export type SpaceDto = {
  id: number;
  spaceName: string;
  price: number;
  imgUrl?: string;
  spaceStatus: SpaceStatus;
  category?: SpaceCategory;
  address?: string;
  maxCapacity?: number;
  parkingAvailable?: boolean;
  wifiAvailable?: boolean;
  hostName?: string;
};

export type CartItemDto = {
  spaceId: number;
  count: number;
};

export type ReservationDto = {
  spaceId: number;
  checkInTime: string;
  checkOutTime: string;
};

export type ReservationItemDto = {
  spaceName: string;
  count: number;
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
  totalPrice: number;
};

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

export type ReservationConfirmDto = {
  phoneNumber: string;
  address: string;
  orderDtoList: Array<{ spaceId: number; count: number }>;
};

export type ReservationSuccessDto = {
  reservationId: number;
  spaceName: string;
  totalPrice: number;
  reservationDate: string;
};

export type MypageDto = {
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role?: 'USER' | 'ADMIN' | 'HOST' | 'GUEST';
  recentReservations?: Array<ReservationHistDto>;
};
