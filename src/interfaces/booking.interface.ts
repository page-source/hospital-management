import { IFamilyMember } from "./customer.interface";

interface IBookingAssignee {
  staffId: number;
  emailId: string;
  name: string;
}

export interface IBookingPayment {
  amount: number;
  paymentStatus: string;
  paymentId: string;
  paymentChannel: string;
  transactionId: string;
}

export interface IBooking {
  bookingId: string;
  fieldEZTicketNumber: string;
  isRead: boolean;
  customerName: string;
  customerEmailId?: string;
  customerId: string;
  serviceName: string;
  serviceId: string;
  bookingAssigneeDetails: IBookingAssignee;
  payment: IBookingPayment;
  prescriptionBase64: string;
  prescriptionFilePaths: string[];
  updatedAtStr: string;
  createdAtStr: string;
  bookingStatus: string;
  bookingStatusStr: string;
  bookingInvitations: IBookingInvitation[];
  totalInvitationsSent?: number;
  totalInvitationsAccepted?: number;
  slotDate?: string;
  slotTime?: string;
  questionAnswerList?: IQuestionAnswer[];
  bookingForMember: IFamilyMember;
}

interface IQuestionAnswer {
  questionId: string;
  questionType: "FREE_TEXT" | "SINGLE_CHOICE";
  questionContent: string;
  answer: string;
  // possibleAnswers:
}

export interface IBookingInvitation {
  bookingId: string;
  bookingInvitationStatus: string;
  staffEmail: string;
  staffId: string;
  staffName: string;
  staffMobileNumber: string;
  createdAt: number;
  createdAtStr: string;
  serviceName: string;
  updatedAt: number;
  updatedAtStr: string;
}
