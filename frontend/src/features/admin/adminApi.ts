import { apiClient } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse, User, VendorProfile } from "@/types/user";
import type { VendorReview } from "@/types/vendor";

export interface AdminDashboardStats {
  total_users: number;
  total_vendors: number;
  approved_vendors: number;
  pending_vendors: number;
  total_bookings: number;
  total_transacted_volume: number;
}

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const { data } = await apiClient.get<AdminDashboardStats>("/admin/dashboard");
  return data;
}

export async function listAllVendors(): Promise<VendorProfile[]> {
  const { data } = await apiClient.get<VendorProfile[]>("/admin/vendors");
  return data;
}

export async function listPendingVendors(): Promise<VendorProfile[]> {
  const { data } = await apiClient.get<VendorProfile[]>("/admin/vendors/pending");
  return data;
}

export async function approveVendor(vendorId: number): Promise<VendorProfile> {
  const { data } = await apiClient.post<VendorProfile>(`/admin/vendors/${vendorId}/approve`);
  return data;
}

export async function blockVendor(vendorId: number): Promise<VendorProfile> {
  const { data } = await apiClient.post<VendorProfile>(`/admin/vendors/${vendorId}/block`);
  return data;
}

export async function unblockVendor(vendorId: number): Promise<VendorProfile> {
  const { data } = await apiClient.post<VendorProfile>(`/admin/vendors/${vendorId}/unblock`);
  return data;
}

export async function setCommission(vendorId: number, rate: number): Promise<VendorProfile> {
  const { data } = await apiClient.patch<VendorProfile>(`/admin/vendors/${vendorId}/commission`, null, { params: { rate } });
  return data;
}

export async function setFeatured(vendorId: number, featured: boolean): Promise<VendorProfile> {
  const { data } = await apiClient.post<VendorProfile>(`/admin/vendors/${vendorId}/feature`, null, { params: { featured } });
  return data;
}

export async function listCustomers(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>("/admin/customers");
  return data;
}

export async function setCustomerPrime(userId: number, prime: boolean): Promise<User> {
  const { data } = await apiClient.post<User>(`/admin/customers/${userId}/prime`, null, { params: { prime } });
  return data;
}

export async function deleteCustomer(userId: number): Promise<void> {
  await apiClient.delete(`/admin/customers/${userId}`);
}

export async function deleteVendor(vendorId: number): Promise<void> {
  await apiClient.delete(`/admin/vendors/${vendorId}`);
}

export async function deleteReview(reviewId: number): Promise<void> {
  await apiClient.delete(`/admin/reviews/${reviewId}`);
}

export interface VendorReviewUpdatePayload {
  rating?: number;
  comment?: string;
}

/** Admin-only edit — used from the vendor dashboard while an admin is impersonating
 * that vendor, so it must always authenticate as the admin (the stashed session),
 * never the currently-active impersonated vendor token. */
export async function editReview(reviewId: number, payload: VendorReviewUpdatePayload): Promise<VendorReview> {
  const { adminSession, accessToken } = useAuthStore.getState();
  const token = adminSession?.accessToken ?? accessToken;
  const { data } = await apiClient.patch<VendorReview>(`/admin/reviews/${reviewId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function impersonateCustomer(userId: number): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(`/admin/customers/${userId}/impersonate`);
  return data;
}

export async function impersonateVendor(vendorId: number): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(`/admin/vendors/${vendorId}/impersonate`);
  return data;
}
