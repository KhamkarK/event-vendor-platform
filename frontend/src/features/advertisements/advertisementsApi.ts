import { apiClient } from "@/lib/axios";
import type { Advertisement, AdvertisementUpdatePayload } from "@/types/advertisement";

/** Public — every active banner, in the order the running banner should show them. */
export async function getActiveAdvertisements(): Promise<Advertisement[]> {
  const { data } = await apiClient.get<Advertisement[]>("/advertisements/active");
  return data;
}

/** Admin-only. Every banner, active and inactive, for the management list. */
export async function getAllAdvertisements(): Promise<Advertisement[]> {
  const { data } = await apiClient.get<Advertisement[]>("/admin/advertisements");
  return data;
}

/** Admin-only. The instance-level JSON Content-Type header is explicitly cleared
 * so axios/the browser can attach the correct multipart boundary for the FormData
 * body — same approach as uploadPackagePhoto. Appends a new banner to the rotation
 * rather than replacing the current ones. */
export async function uploadAdvertisement(file: File, linkUrl?: string): Promise<Advertisement> {
  const formData = new FormData();
  formData.append("file", file);
  if (linkUrl) formData.append("link_url", linkUrl);
  const { data } = await apiClient.post<Advertisement>("/admin/advertisements", formData, {
    headers: { "Content-Type": undefined },
  });
  return data;
}

/** Admin-only. Toggle a banner active/inactive, and/or edit its link URL. */
export async function updateAdvertisement(id: number, payload: AdvertisementUpdatePayload): Promise<Advertisement> {
  const { data } = await apiClient.patch<Advertisement>(`/admin/advertisements/${id}`, payload);
  return data;
}

/** Admin-only. Swaps a banner with its neighbor to change its place in the rotation. */
export async function moveAdvertisement(id: number, direction: "up" | "down"): Promise<Advertisement> {
  const { data } = await apiClient.post<Advertisement>(`/admin/advertisements/${id}/move`, { direction });
  return data;
}

export async function deleteAdvertisement(id: number): Promise<void> {
  await apiClient.delete(`/admin/advertisements/${id}`);
}
