import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Briefcase, Cake, Heart, MapPin, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { createEvent } from "@/features/events/eventsApi";
import type { EventType } from "@/types/event";

const schema = z.object({
  name: z.string().min(2, "Give your event a name"),
  event_type: z.enum(["marriage", "birthday", "corporate"]),
  event_date: z.string().min(1, "Pick a date"),
  location: z.string().min(2, "Location is required"),
  total_budget: z.coerce.number().positive("Enter a valid budget"),
});

type FormValues = z.infer<typeof schema>;

const eventTypeOptions: { value: EventType; label: string; icon: typeof Heart }[] = [
  { value: "marriage", label: "Marriage", icon: Heart },
  { value: "birthday", label: "Birthday", icon: Cake },
  { value: "corporate", label: "Corporate", icon: Briefcase },
];

export function CreateEventPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { event_type: "marriage" } });

  const selectedType = watch("event_type");

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
            <div className="grid grid-cols-3 gap-3">
              {eventTypeOptions.map((option) => {
                const Icon = option.icon;
                const active = selectedType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue("event_type", option.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      active ? "border-brand-400 bg-brand-50 ring-2 ring-brand-100" : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <Icon size={22} className={active ? "text-brand-600" : "text-neutral-400"} />
                    <span className={`text-sm font-medium ${active ? "text-brand-700" : "text-neutral-600"}`}>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input label="Event name" placeholder="e.g. Riya & Arjun's Wedding" error={errors.name?.message} {...register("name")} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Event date" type="date" error={errors.event_date?.message} {...register("event_date")} />
            <Input
              label="Location"
              placeholder="City, venue"
              icon={<MapPin size={16} />}
              error={errors.location?.message}
              {...register("location")}
            />
          </div>

          <Input
            label="Total budget (₹)"
            type="number"
            step="0.01"
            placeholder="500000"
            icon={<Wallet size={16} />}
            error={errors.total_budget?.message}
            {...register("total_budget")}
          />

          <Button type="submit" isLoading={isSubmitting} fullWidth>
            Create event & generate budget
          </Button>
        </form>
      </Card>
    </div>
  );
}
