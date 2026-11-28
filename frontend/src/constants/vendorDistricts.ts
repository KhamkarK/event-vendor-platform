/** Districts a service provider can register under, each with its own fixed
 * list of talukas. The Taluka field appears once a district is picked, at
 * signup (SignupPage.tsx) and in the provider's own profile editor
 * (AccountDetailsModal.tsx), and customers search by taluka too
 * (VendorFilters.tsx). Bilingual labels (English + Marathi), matching how
 * these are officially referred to locally. */
export const VENDOR_DISTRICTS = ["Jalgaon", "Dhule", "Nandurbar"] as const;

export type VendorDistrict = (typeof VENDOR_DISTRICTS)[number];

export const TALUKAS_BY_DISTRICT: Record<VendorDistrict, readonly string[]> = {
  Jalgaon: [
    "Amalner (अमळनेर)",
    "Bhadgaon (भडगाव)",
    "Bhusawal (भुसावळ)",
    "Bodwad (बोदवड)",
    "Chalisgaon (चाळीसगाव)",
    "Chopda (चोपडा)",
    "Dharangaon (धरणगाव)",
    "Erandol (एरंडोल)",
    "Jalgaon (जळगाव)",
    "Jamner (जामनेर)",
    "Muktainagar (मुक्ताईनगर)",
    "Pachora (पाचोरा)",
    "Parola (पारोळा)",
    "Raver (रावेर)",
    "Yawal (यावल)",
  ],
  Dhule: ["Dhule (धुळे)", "Sakri (साक्री)", "Shirpur (शिरपूर)", "Sindkheda (शिंदखेडा)"],
  Nandurbar: [
    "Nandurbar (नंदुरबार)",
    "Navapur (नवापूर)",
    "Shahada (शहादा)",
    "Taloda (तळोदा)",
    "Akkalkuwa (अक्कलकुवा)",
    "Akrani / Dhadgaon (अक्राणी / धडगाव)",
  ],
};

/** Every taluka across all 3 districts, flattened — used where customers
 * search/filter by taluka regardless of district (see VendorFilters.tsx),
 * since that filter isn't itself district-scoped. */
export const ALL_TALUKAS: readonly string[] = VENDOR_DISTRICTS.flatMap((district) => TALUKAS_BY_DISTRICT[district]);
