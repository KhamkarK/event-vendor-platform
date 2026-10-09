export type AdvertisementPlacement = "top_banner" | "event_types_sidebar" | "event_types_bottom";

export interface Advertisement {
  id: number;
  media_url: string;
  media_type: "image" | "video";
  link_url: string | null;
  is_active: boolean;
  display_order: number;
  placement: AdvertisementPlacement;
  created_at: string;
}

export interface AdvertisementUpdatePayload {
  is_active?: boolean;
  link_url?: string;
}
