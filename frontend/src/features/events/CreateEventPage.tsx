import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, PartyPopper, Users, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { VENDOR_LOCATIONS } from "@/constants/vendorLocations";
import { createEvent } from "@/features/events/eventsApi";
import type { EventType } from "@/types/event";

const schema = z.object({
  name: z.string().min(2, "Give your event a name"),
  event_type: z.enum([
    "anniversary",
    "baby-shower",
    "bachelorette-party",
    "birthday-party",
    "conference",
    "corporate-events",
    "destination-wedding",
    "engagement",
    "grahshanti",
    "haldi-mehendi-ceremony",
    "reception-ceremony",
    "sangeet-ceremony",
    "wedding-ceremony",
  ]),
  event_date: z.string().min(1, "Pick a date"),
  location: z.string().min(1, "Location is required"),
  total_budget: z.coerce.number().positive("Enter a valid budget"),
  guest_count: z.coerce.number().int("Enter a whole number").positive("Enter number of guests"),
});

type FormValues = z.infer<typeof schema>;

// Occasions offered when creating an event, alphabetized to match the rest
// of the site's fixed-list dropdowns.
const eventTypeOptions: { value: EventType; label: string }[] = [
  { value: "anniversary", label: "Anniversary" },
  { value: "baby-shower", label: "Baby Shower" },
  { value: "bachelorette-party", label: "Bachelorette Party" },
  { value: "birthday-party", label: "Birthday Party" },
  { value: "conference", label: "Conference" },
  { value: "corporate-events", label: "Corporate Events" },
  { value: "destination-wedding", label: "Destination Wedding" },
  { value: "engagement", label: "Engagement" },
  { value: "grahshanti", label: "Grahshanti" },
  { value: "haldi-mehendi-ceremony", label: "Haldi And Mehendi Ceremony" },
  { value: "reception-ceremony", label: "Reception Ceremony" },
  { value: "sangeet-ceremony", label: "Sangeet Ceremony" },
  { value: "wedding-ceremony", label: "Wedding Ceremony" },
];

export function CreateEventPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { event_type: "wedding-ceremony" } });

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created — budget categories generated!");
      navigate(`/events/${event.id}/budget`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? "Could not create event");
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-neutral-900">Create a new event</h1>
        <p className="mt-1 text-sm text-neutral-500">
          We&apos;ll auto-generate budget categories based on your event type — you can rearrange them next.
        </p>
      </motion.div>

      <Card className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">Event type</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <PartyPopper size={16} />
              </span>
              <select
                className={`w-full appearance-none rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none transition-all duration-150 focus:ring-4 focus:ring-brand-100 ${
                  errors.event_type ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-brand-400"
                }`}
                {...register("event_type")}
              >
                {eventTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.event_type?.message && <p className="mt-1 text-xs font-medium text-red-500">{errors.event_type.message}</p>}
          </div>

          <Input label="Event name" placeholder="e.g. Riya & Arjun's Wedding" error={errors.name?.message} {...register("name")} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Event date" type="date" error={errors.event_date?.message} {...register("event_date")} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Location</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <MapPin size={16} />
                </span>
                <select
                  defaultValue=""
                  className={`w-full appearance-none rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none transition-all duration-150 focus:ring-4 focus:ring-brand-100 ${
                    errors.location ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-brand-400"
                  }`}
                  {...register("location")}
                >
                  <option value="" disabled>
                    Select a location
                  </option>
                  {VENDOR_LOCATIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              {errors.location?.message && <p className="mt-1 text-xs font-medium text-red-500">{errors.location.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total budget (₹)"
              type="number"
              step="0.01"
              placeholder="500000"
              icon={<Wallet size={16} />}
              error={errors.total_budget?.message}
              {...register("total_budget")}
            />
            <Input
              label="Number of guests"
              type="number"
              placeholder="150"
              icon={<Users size={16} />}
              error={errors.guest_count?.message}
              {...register("guest_count")}
            />
          </div>

          <Button type="submit" isLoading={isSubmitting} fullWidth>
            Create event & generate budget
          </Button>
        </form>
      </Card>
    </div>
  );
}
