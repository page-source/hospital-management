import { IAddress } from "./common.interface";

export interface ICustomer {
  customerId: string;
  firstName: string;
  lastName: string;
  emailId: string;
  phoneNumber: string;
  customerAddress: IAddress;
  dob: string;
  gender: string;
  fieldEZCustomerId: string;
  familyMembers: IFamilyMember[];
  status: string;
  createdAt: number;
  createdAtStr: string;
}

export interface IFamilyMember {
  memberId: string;
  firstName: string;
  lastName: string;
  relation: string;
  gender: string;
  phoneNumber: string;
  dob: string;
  fieldEZCustomerId: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}
