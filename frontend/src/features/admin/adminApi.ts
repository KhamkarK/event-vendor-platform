import { apiClient } from "@/lib/axios";
import type { VendorProfile } from "@/types/user";

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
