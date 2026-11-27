import { apiClient } from "@/lib/axios";
import type { MetalRate, MetalRateUpdatePayload } from "@/types/metalRate";

/** Public -- the current Gold/Silver rates for the site-wide running strip (see RateTicker). */
export async function getMetalRate(): Promise<MetalRate> {
  const { data } = await apiClient.get<MetalRate>("/metal-rates");
  return data;
}

/** Admin-only. Both rates are always sent together (see MetalRatesSettings). */
export async function updateMetalRate(payload: MetalRateUpdatePayload): Promise<MetalRate> {
  const { data } = await apiClient.patch<MetalRate>("/admin/metal-rates", payload);
  return data;
}
