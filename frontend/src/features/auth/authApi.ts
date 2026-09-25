import { apiClient } from "@/lib/axios";
import type { AuthResponse, User, UserRole } from "@/types/user";

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

/** Records a Prime membership request from the customer — no payment is
 * actually charged; an admin still has to drag them into "Prime Members" on
 * the Customers page (see AdminService.set_customer_prime) to activate it. */
export async function requestPrimeMembership(): Promise<User> {
  const { data } = await apiClient.post<User>("/users/me/prime-request");
  return data;
}

/** Records a Premium membership request from the vendor — no payment is
 * actually charged; an admin still has to drag them into "Premium" on the
 * Vendor Management page (see AdminService.set_featured) to activate it. */
export async function requestPremiumMembership(): Promise<User> {
  const { data } = await apiClient.post<User>("/users/me/premium-request");
  return data;
}
