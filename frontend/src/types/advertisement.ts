export interface Advertisement {
  id: number;
  media_url: string;
  media_type: "image" | "video";
  link_url: string | null;
  is_active: boolean;
  created_at: string;
}
