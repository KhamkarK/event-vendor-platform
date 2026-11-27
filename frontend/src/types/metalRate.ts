export interface MetalRate {
  gold_rate_per_10g: number | null;
  silver_rate_per_kg: number | null;
  updated_at: string;
}

export interface MetalRateUpdatePayload {
  gold_rate_per_10g: number;
  silver_rate_per_kg: number;
}
