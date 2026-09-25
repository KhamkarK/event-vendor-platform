import { Flame, Flower2, Gem, Heart, Music, PartyPopper, Plane, Sparkles, Wine, type LucideIcon } from "lucide-react";

import { HERO_IMAGE_URL } from "@/constants/heroImage";

export interface EventTypeOption {
  slug: string;
  label: string;
  icon: LucideIcon;
  /** Small placeholder thumbnail shown next to the label on the Event Types
   * dropdown — swap for CEAT/EventKarma's own event photography before a
   * real launch, same as HERO_IMAGE_URL. */
  image: string;
}

const PROPOSAL_IMAGE_URL = "https://images.unsplash.com/photo-1742790159516-bdb38cf17481?auto=format&fit=crop&w=200&q=70";
const DESTINATION_WEDDING_IMAGE_URL = "https://images.unsplash.com/photo-1515232389446-a17ce9ca7434?auto=format&fit=crop&w=200&q=70";
const RING_CEREMONY_IMAGE_URL = "https://images.unsplash.com/photo-1769038936715-738ab99f1362?auto=format&fit=crop&w=200&q=70";

/** The occasions customers can browse by on the "Event Types" screen. Purely
 * a discovery front door into Find Vendors (see EventTypeCategoriesPage) —
 * unrelated to the Marriage/Birthday/Corporate event_type used when creating
 * an event and generating its budget. */
export const EVENT_TYPES: EventTypeOption[] = [
  { slug: "bachelorette-party", label: "Bachelorette Party", icon: PartyPopper, image: HERO_IMAGE_URL },
  { slug: "marriage-proposal", label: "Marriage proposal", icon: Gem, image: PROPOSAL_IMAGE_URL },
  { slug: "sangeet-ceremony", label: "Sangeet Ceremony", icon: Music, image: HERO_IMAGE_URL },
  { slug: "destination-wedding", label: "Destination wedding", icon: Plane, image: DESTINATION_WEDDING_IMAGE_URL },
  { slug: "wedding-ceremony", label: "Wedding Ceremony", icon: Heart, image: HERO_IMAGE_URL },
  { slug: "grahshanti", label: "Grahshanti", icon: Flame, image: HERO_IMAGE_URL },
  { slug: "reception-ceremony", label: "Reception Ceremony", icon: Wine, image: HERO_IMAGE_URL },
  { slug: "haldi-mehendi-ceremony", label: "Haldi And Mehendi Ceremony", icon: Flower2, image: HERO_IMAGE_URL },
  { slug: "ring-ceremony", label: "Ring Ceremony", icon: Sparkles, image: RING_CEREMONY_IMAGE_URL },
];
