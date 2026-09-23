import { apiClient } from "@/lib/axios";
import type { AuthResponse, UserRole } from "@/types/user";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  full_name: string;
  email?: string;
  mobile?: string;
  password: string;
  role: UserRole;
  business_name?: string;
  category?: string;
  location?: string;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function signupRequest(payload: SignupPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", payload);
  return data;
}
