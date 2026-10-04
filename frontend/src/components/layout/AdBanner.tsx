import { useQuery } from "@tanstack/react-query";

import { getActiveAdvertisement } from "@/features/advertisements/advertisementsApi";

/** Site-wide ad slot, rendered just below the Navbar on every page (see
 * AppLayout). Renders nothing when there's no active ad — admin uploads one
 * via the "Advertisements" admin page (features/admin/AdvertisementsPage.tsx). */
export function AdBanner() {
  const { data: ad } = useQuery({ queryKey: ["active-advertisement"], queryFn: getActiveAdvertisement });

  if (!ad) return null;

  const media =
    ad.media_type === "video" ? (
      <video src={ad.media_url} autoPlay muted loop playsInline className="h-full w-full object-cover" />
    ) : (
      <img src={ad.media_url} alt="Advertisement" className="h-full w-full object-cover" />
    );

  return (
    <div className="w-full bg-neutral-100">
      <div className="mx-auto max-h-32 w-full max-w-7xl overflow-hidden">
        {ad.link_url ? (
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
