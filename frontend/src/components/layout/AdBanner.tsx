import { useQuery } from "@tanstack/react-query";

import { AdSlot } from "@/components/common/AdSlot";
import { getActiveAdvertisements } from "@/features/advertisements/advertisementsApi";

// Wedding-clothing sample banners (frontend/public/sample-ads), looped while
// no real ad is live so the slot is visible to every role.
const SAMPLE_ADS = [
  "/sample-ads/bridal-collection.png",
  "/sample-ads/groom-wear.png",
  "/sample-ads/season-sale.png",
];

/** Site-wide running banner slot, rendered just below the Navbar on every page
 * (see AppLayout). Auto-rotates through every active "top_banner" ad the
 * admin uploaded via the "Advertisements" admin page
 * (features/admin/AdvertisementsPage.tsx), in the sequence set there; until
 * any are live it loops through sample banners. See AdSlot for the rotation
 * and fixed-size-crop behavior shared with the Event Types page's ad slots. */
export function AdBanner() {
  const { data: ads, isLoading } = useQuery({
    queryKey: ["active-advertisements", "top_banner"],
    queryFn: () => getActiveAdvertisements("top_banner"),
  });

  if (isLoading) return null;

  return (
    <div className="w-full bg-neutral-100">
      <AdSlot ads={ads} fallbackImages={SAMPLE_ADS} className="mx-auto h-32 w-full max-w-7xl" />
    </div>
  );
}
