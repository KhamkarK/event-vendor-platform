import type { EventTypeOption } from "@/features/events/eventTypes";

/** Maps each occasion on the Event Types screen to the vendor categories most
 * relevant to it, so checking an occasion shows matching vendors directly —
 * no separate manual category-selection step. Category strings must match
 * VENDOR_CATEGORIES exactly (used as-is with the multi-category vendor search). */
export const EVENT_TYPE_CATEGORY_MAP: Record<EventTypeOption["slug"], string[]> = {
  anniversary: [
    "Event Management Company",
    "Marriage hall and Banquet Hall",
    "Photography and Videography Services",
    "Flower decorations",
    "Outdoor Catering Services",
  ],
  "baby-shower": [
    "Event Management Company",
    "Flower decorations",
    "Photography and Videography Services",
    "Gift and Event hamper",
    "Outdoor Catering Services",
  ],
  "bachelorette-party": [
    "Event Management Company",
    "Party plots",
    "Photography and Videography Services",
    "DJ and Sound system",
    "Outdoor Catering Services",
    "Ballon Decorator",
    "Light Decorator",
  ],
  "birthday-party": [
    "Event Management Company",
    "DJ and Sound system",
    "Photography and Videography Services",
    "Outdoor Catering Services",
    "Light Decorator",
    "Gift and Event hamper",
  ],
  conference: [
    "Event Management Company",
    "Marriage hall and Banquet Hall",
    "Live Streaming Services",
    "Photography and Videography Services",
  ],
  "corporate-events": [
    "Event Management Company",
    "Marriage hall and Banquet Hall",
    "Live Streaming Services",
    "Outdoor Catering Services",
    "Photography and Videography Services",
  ],
  "destination-wedding": [
    "Event Management Company",
    "Hotel and Resorts",
    "Stay and Hotels",
    "Honeymoon Planner",
    "Transportation",
    "Photography and Videography Services",
    "Marriage hall and Banquet Hall",
  ],
  engagement: [
    "Event Management Company",
    "Marriage hall and Banquet Hall",
    "Photography and Videography Services",
    "Flower decorations",
    "DJ and Sound system",
  ],
  grahshanti: ["Pandit", "Ritual Material Services", "Flower decorations", "Food / Chef"],
  "haldi-mehendi-ceremony": [
    "Mehendi Artist",
    "Flower decorations",
    "Light Decorator",
    "Photography and Videography Services",
    "Food / Chef",
  ],
  "reception-ceremony": [
    "Event Management Company",
    "Marriage hall and Banquet Hall",
    "DJ and Sound system",
    "Light Decorator",
    "Photography and Videography Services",
    "Outdoor Catering Services",
    "Singer and Musical band",
  ],
  "sangeet-ceremony": [
    "Event Management Company",
    "DJ and Sound system",
    "Singer and Musical band",
    "Light Decorator",
    "Mandap Decorator / Tenthouse",
    "Photography and Videography Services",
  ],
  "wedding-ceremony": [
    "Event Management Company",
    "Mandap Decorator / Tenthouse",
    "Pandit",
    "Ritual Material Services",
    "Photography and Videography Services",
    "Flower decorations",
    "Marriage hall and Banquet Hall",
    "Marriage Garments",
  ],
};
