export interface IPayment {
  paymentId: string;
  transactionId: string;
  customerName: string;
  customerEmailId?: string;
  bookingId: string;
  amount: number;
  paymentStatus: string;
  updatedAtStr: string;
}
