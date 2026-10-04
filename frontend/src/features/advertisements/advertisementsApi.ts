import { apiClient } from "@/lib/axios";
import type { Advertisement } from "@/types/advertisement";

export async function getActiveAdvertisement(): Promise<Advertisement | null> {
  const { data } = await apiClient.get<Advertisement | null>("/advertisements/active");
  return data;
}

/** Admin-only. The instance-level JSON Content-Type header is explicitly cleared
 * so axios/the browser can attach the correct multipart boundary for the FormData
 * body — same approach as uploadPackagePhoto. */
export async function uploadAdvertisement(file: File, linkUrl?: string): Promise<Advertisement> {
  const formData = new FormData();
  formData.append("file", file);
  if (linkUrl) formData.append("link_url", linkUrl);
  const { data } = await apiClient.post<Advertisement>("/admin/advertisements", formData, {
    headers: { "Content-Type": undefined },
  });
  return data;
}

export async function removeActiveAdvertisement(): Promise<void> {
  await apiClient.delete("/admin/advertisements/active");
}
