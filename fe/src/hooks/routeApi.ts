import axios from "axios";

const API_BASE = "http://localhost:8090/api/router";

export interface RouteSegmentResDTO {
  fromAirport: string;
  toAirport: string;
  sequence: number;
  flightDuration: number;
  stopType: string;
  stopDuration: number;
}

export interface RouterResDTO {
  id: number;
  name: string;
  segments: RouteSegmentResDTO[];
}

export const getAllRoutes = async (): Promise<RouterResDTO[]> => {
  const response = await axios.get<RouterResDTO[]>(API_BASE);
  return response.data;
};
