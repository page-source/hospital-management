export interface IPagination {
  current: number;
  pageSize: number;
  total: number;
}

export interface IAddress {
  addressId: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  state: string;
  pinCode: string;
}

export interface IRating {
  ratingId: string;
  ratingComment: string;
  ratingValue: number;
  customerId: string;
  customerName: string;
  customerEmailId: string;
  ratingResource: "CAREGIVER";
  resourceId: string;
  createdAt: number;
}
