import type { EventTypeOption } from "@/features/events/eventTypes";

/** Maps each occasion on the Event Types screen to the vendor categories most
 * relevant to it, so checking an occasion shows matching vendors directly —
 * no separate manual category-selection step. Category strings must match
 * VENDOR_CATEGORIES exactly (used as-is with the multi-category vendor search). */
export const EVENT_TYPE_CATEGORY_MAP: Record<EventTypeOption["slug"], string[]> = {
  "bachelorette-party": [
    "Event Management Company",
    "Party plots",
    "Photography and Videography Services",
    "DJ and Sound system",
    "Outdoor Catering Services",
    "Ballon Decorator",
    "Light Decorator",
  ],
  "marriage-proposal": [
    "Event Management Company",
    "Photography and Videography Services",
    "Flower decorations",
    "Light Decorator",
    "Small Event Venue",
  ],
  "sangeet-ceremony": [
    "Event Management Company",
    "DJ and Sound system",
    "Singer and Musical band",
    "Light Decorator",
    "Mandap Decorator / Tenthouse",
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
  grahshanti: ["Pandit", "Ritual Material Services", "Flower decorations", "Food / Chef"],
  "reception-ceremony": [
    "Event Management Company",
    "Marriage hall and Banquet Hall",
    "DJ and Sound system",
    "Light Decorator",
    "Photography and Videography Services",
    "Outdoor Catering Services",
    "Singer and Musical band",
  ],
  "haldi-mehendi-ceremony": [
    "Mehendi Artist",
    "Flower decorations",
    "Light Decorator",
    "Photography and Videography Services",
    "Food / Chef",
  ],
  "ring-ceremony": [
    "Event Management Company",
    "Jewelers",
    "Photography and Videography Services",
    "Flower decorations",
    "Small Event Venue",
    "Light Decorator",
  ],
};
