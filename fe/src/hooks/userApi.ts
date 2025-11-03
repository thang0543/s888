import axios from "axios";

const API_BASE = "http://localhost:8090/api/users"; 

export interface User {
  id?: number;
  full_name: string;
  phone: string;
  email: string;
  dob?: string;
  address?: string;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get<User[]>(API_BASE);
  return response.data;
};

export const createUser = async (user: User): Promise<User> => {
  const response = await axios.post<User>(API_BASE, user);
  return response.data;
};