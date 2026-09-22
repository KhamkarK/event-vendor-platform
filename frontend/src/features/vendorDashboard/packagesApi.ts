import { apiClient } from "@/lib/axios";
import type { VendorPackage } from "@/types/vendor";

export interface VendorPackagePayload {
  title: string;
  description?: string;
  category: string;
  price: number;
  photos?: string[];
  is_active?: boolean;
}

export async function listMyPackages(): Promise<VendorPackage[]> {
  const { data } = await apiClient.get<VendorPackage[]>("/vendors/me/packages");
  return data;
}

export async function createPackage(payload: VendorPackagePayload): Promise<VendorPackage> {
  const { data } = await apiClient.post<VendorPackage>("/vendors/me/packages", payload);
  return data;
}

export async function updatePackage(packageId: number, payload: Partial<VendorPackagePayload>): Promise<VendorPackage> {
  const { data } = await apiClient.patch<VendorPackage>(`/vendors/me/packages/${packageId}`, payload);
  return data;
}

export async function deletePackage(packageId: number): Promise<void> {
  await apiClient.delete(`/vendors/me/packages/${packageId}`);
}

/** Uploads one image and returns its public URL. The instance-level JSON
 * Content-Type header is explicitly cleared so axios/the browser can attach
 * the correct multipart boundary for the FormData body. */
export async function uploadPackagePhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<{ url: string }>("/uploads/image", formData, {
    headers: { "Content-Type": undefined },
  });
  return data.url;
}
