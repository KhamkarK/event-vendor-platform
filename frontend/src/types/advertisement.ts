export interface Advertisement {
  id: number;
  media_url: string;
  media_type: "image" | "video";
  link_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface AdvertisementUpdatePayload {
  is_active?: boolean;
  link_url?: string;
}
