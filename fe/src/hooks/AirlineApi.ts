import axios from "axios";

const API_BASE = "http://localhost:8090/api/airlines";

export interface AirlineResDTO {
  id: string;
  name: string;
  changeFee: string;
}

export const getAllAirlines = async (): Promise<AirlineResDTO[]> => {
  const response = await axios.get<AirlineResDTO[]>(API_BASE);
  return response.data;
};

export const getAirlines = async (id: string): Promise<AirlineResDTO[]> => {
  const response = await axios.get<AirlineResDTO[]>(API_BASE+ "/"+ id);
  return response.data;
};