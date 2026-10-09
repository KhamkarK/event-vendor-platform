import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getActiveAdvertisement } from "@/features/advertisements/advertisementsApi";

// Wedding-clothing sample banners (frontend/public/sample-ads), shown while no
// real ad is live so the slot is visible to every role.
const SAMPLE_ADS = [
  "/sample-ads/bridal-collection.png",
  "/sample-ads/groom-wear.png",
  "/sample-ads/season-sale.png",
];

/** Site-wide ad slot, rendered just below the Navbar on every page (see
 * AppLayout). Shows the active ad the admin uploaded via the "Advertisements"
 * admin page (features/admin/AdvertisementsPage.tsx); until one is live it
 * shows a random sample banner, picked once per page load. */
export function AdBanner() {
  const { data: ad, isLoading } = useQuery({ queryKey: ["active-advertisement"], queryFn: getActiveAdvertisement });
  const [sampleAd] = useState(() => SAMPLE_ADS[Math.floor(Math.random() * SAMPLE_ADS.length)]);

  if (isLoading) return null;

  const media = !ad ? (
    <img src={sampleAd} alt="Sample advertisement" className="h-full w-full object-cover" />
  ) : ad.media_type === "video" ? (
    <video src={ad.media_url} autoPlay muted loop playsInline className="h-full w-full object-cover" />
  ) : (
    <img src={ad.media_url} alt="Advertisement" className="h-full w-full object-cover" />
  );

  return (
    <div className="w-full bg-neutral-100">
      <div className="mx-auto max-h-32 w-full max-w-7xl overflow-hidden">
        {ad?.link_url ? (
          <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block">
            {media}
          </a>
        ) : (
          media
        )}
      </div>
    </div>
  );
}
