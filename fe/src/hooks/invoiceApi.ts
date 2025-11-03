import axios from "axios";

const API_BASE = "http://localhost:8090/api/invoice";

export interface BookingPaymentRequestDTO {
  customerId: number;
  flight: any; 
  passengers: any[];
  summary: {
    adultCount: number;
    childCount: number;
    infantCount: number;
    baseAmount: number;
    seatTotal: number;
    totalAmount: number;
    currency: string;
    discountAmount: number;
    autoAssignedSeats: string[];
    autoAssignedCount: number;
  };
  paymentMethod: string;
  transactionId: string;
  status: string;
  promotionId: number;
}

export interface Payment {
  id: number;
  status: string;
  amount: number;
  currency: string;
  transactionId: string;
}

export interface InvoiceSummaryDTO {
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  flightCode: string;
  departureTime: string;
  arrivalTime: string;
  airlineName: string;
  route: string;
  totalAmountCurrency: string;
  status: string;
}
export interface PaymentRes {
  id: number;
  paymentCode: string;
  method: string;
  amount: number;
  currency: string;
  status: string;
  transactionId?: string;
  paymentDate: string;
}
export interface InvoiceBookingData {
  id: string; // mã hóa đơn (invoiceCode)
  transactionId: string;
  createdAt: string; // ngày tạo hóa đơn
  customerId: string | number;
  flight: FlightInfo;
  passengers: PassengerInfo[];
  summary: SummaryInfo;
  customer: customer,
  paymentMethod: 'agency_credit' | 'bank_transfer' | 'credit_card';
  payment: PaymentRes[];
}

export interface FlightInfo {
  id: number;
  code: string;
  airline: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  duration?: string;
  carrierCode?: string;
  aircraftCode?: string;
}

export interface PassengerInfo {
  fullName: string;
  type: 'adult' | 'child' | 'infant';
  passportNo: string;
  seat?: string;
  seatPrice?: number;
  email: string;
  phone: string;
  dob: string;
  country: string;
  address: string;
  priceFlight: number;
}

export interface SummaryInfo {
  adultCount: number;
  childCount: number;
  infantCount: number;
  baseAmount: number;
  seatTotal: number;
  totalAmount: number;
  currency: string;
  discount: number;
  autoAssignedSeats?: string[];
  autoAssignedCount?: number;
}

export interface customer {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  dob: string;
}


export const getInvoiceSummaries = async (
  airlineId?: number,
  routeId?: number,
  customerId?: number
): Promise<InvoiceSummaryDTO[]> => {
  const response = await axios.get<InvoiceSummaryDTO[]>(API_BASE, {
    params: { airlineId, routeId, customerId },
  });
  return Array.isArray(response.data) ? response.data : []; 
};

export const createBookingTransaction = async (
  request: BookingPaymentRequestDTO
): Promise<Payment> => {
  const response = await axios.post<Payment>(API_BASE, request);
  return response.data;
};

export const updateBookingTransaction = async (id: string,
  request: BookingPaymentRequestDTO
): Promise<Payment> => {
  const response = await axios.put<Payment>(API_BASE + `/${id}`, request);
  return response.data;
}

export const getInvoiceBookingDetail = async (id: number): Promise<InvoiceBookingData> => {
  const response = await axios.get(`${API_BASE}/${id}/booking`);
  return response.data;
};

export const deleteBookingInvoice = async (id: number) => {
  const response = await axios.delete(`${API_BASE}/delete/${id}`);
  return response.data;
};