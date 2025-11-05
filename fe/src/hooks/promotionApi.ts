import axios from "axios";

const API_BASE = "http://localhost:8090/api/promotions";
export interface DiscountCode {
  id: number;
  code: string;
  description: string;
  discountType: "PERCENT" | "AMOUNT"; 
  discountValue: number;
  maxDiscount: number;
  startDate: string; 
  endDate: string;   
  airlineId: number;
  nameRouter: string;
  minFare: number;
  isActive: boolean;
  airlineName: string;
}

export const getPromotions = async (): Promise<DiscountCode[]> => {
  const response = await axios.get<DiscountCode[]>(API_BASE);
  return Array.isArray(response.data) ? response.data : []; 
};

export const createPromotion = async (data: any) => {
  await axios.post(API_BASE, data);
};

export const updatePromotion = async (id: number, data: any) => {
  await axios.put(`${API_BASE}/${id}`, data);
};

export const toggleStatus = async (id: number) => {
  await axios.delete(`${API_BASE}/${id}/status`);
};
