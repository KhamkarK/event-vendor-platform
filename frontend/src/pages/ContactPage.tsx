import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";

import { Card } from "@/components/common/Card";

const contactDetails = [
  { icon: Mail, label: "Email", value: "—" },
  { icon: Phone, label: "Phone", value: "—" },
  { icon: MapPin, label: "Address", value: "—" },
];

export function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-neutral-900">Contact Us</h1>
        <p className="mt-1 text-sm text-neutral-500">Reach out to the EventKarma team using the details below.</p>
      </motion.div>

      <Card className="mt-6">
        <div className="flex flex-col divide-y divide-neutral-100">
          {contactDetails.map((detail) => {
            const Icon = detail.icon;
            return (
              <div key={detail.label} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{detail.label}</p>
                  <p className="text-sm font-medium text-neutral-800">{detail.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
