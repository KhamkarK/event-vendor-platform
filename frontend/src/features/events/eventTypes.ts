import { Flame, Flower2, Gem, Heart, Music, PartyPopper, Plane, Sparkles, Wine, type LucideIcon } from "lucide-react";

export interface EventTypeOption {
  slug: string;
  label: string;
  icon: LucideIcon;
}

/** The occasions customers can browse by on the "Event Types" screen. Purely
 * a discovery front door into Find Vendors (see EventTypeCategoriesPage) —
 * unrelated to the Marriage/Birthday/Corporate event_type used when creating
 * an event and generating its budget. */
export const EVENT_TYPES: EventTypeOption[] = [
  { slug: "bachelorette-party", label: "Bachelorette Party", icon: PartyPopper },
  { slug: "marriage-proposal", label: "Marriage proposal", icon: Gem },
  { slug: "sangeet-ceremony", label: "Sangeet Ceremony", icon: Music },
  { slug: "destination-wedding", label: "Destination wedding", icon: Plane },
  { slug: "wedding-ceremony", label: "Wedding Ceremony", icon: Heart },
  { slug: "grahshanti", label: "Grahshanti", icon: Flame },
  { slug: "reception-ceremony", label: "Reception Ceremony", icon: Wine },
  { slug: "haldi-mehendi-ceremony", label: "Haldi And Mehendi Ceremony", icon: Flower2 },
  { slug: "ring-ceremony", label: "Ring Ceremony", icon: Sparkles },
];
