import { apiClient } from "@/lib/axios";
import type { Advertisement, AdvertisementPlacement, AdvertisementUpdatePayload } from "@/types/advertisement";

/** Public — every active banner for one placement, in the order the running banner should show them. */
export async function getActiveAdvertisements(placement: AdvertisementPlacement): Promise<Advertisement[]> {
  const { data } = await apiClient.get<Advertisement[]>("/advertisements/active", { params: { placement } });
  return data;
}

/** Admin-only. Every banner for one placement, active and inactive, for the management list. */
export async function getAllAdvertisements(placement: AdvertisementPlacement): Promise<Advertisement[]> {
  const { data } = await apiClient.get<Advertisement[]>("/admin/advertisements", { params: { placement } });
  return data;
}

/** Admin-only. The instance-level JSON Content-Type header is explicitly cleared
 * so axios/the browser can attach the correct multipart boundary for the FormData
 * body — same approach as uploadPackagePhoto. Appends a new banner to the given
 * placement's rotation rather than replacing the current ones. */
export async function uploadAdvertisement(file: File, placement: AdvertisementPlacement, linkUrl?: string): Promise<Advertisement> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("placement", placement);
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

/** Admin-only. Swaps a banner with its neighbor (within its own placement) to change its place in the rotation. */
export async function moveAdvertisement(id: number, direction: "up" | "down"): Promise<Advertisement> {
  const { data } = await apiClient.post<Advertisement>(`/admin/advertisements/${id}/move`, { direction });
  return data;
}

export async function deleteAdvertisement(id: number): Promise<void> {
  await apiClient.delete(`/admin/advertisements/${id}`);
}
