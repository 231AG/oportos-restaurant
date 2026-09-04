import type { Metadata } from "next";
import { site } from "@/config/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { Location } from "@/components/sections/Location";
import { Reveal } from "@/components/motion/Reveal";
import { OrderButton } from "@/components/ui/OrderButton";
import {
  dishOrderMessage,
  generalOrderMessage,
  reservationMessage,
} from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Location & Contact",
  description: `Find OPORTOS at ${site.address.line1}, ${site.address.line2}, ${site.address.city}. Order, book a table or ask us anything on WhatsApp.`,
};

const actions = [
  {
    title: "Place an order",
    body: "Tell us what you want and when you're coming. We'll confirm and put it on.",
    label: "Order on WhatsApp",
    message: generalOrderMessage(),
  },
  {
    title: "Book a table",
    body: "Groups up to twenty on the long counter. Send a date, time and headcount.",
    label: "Book on WhatsApp",
    message: reservationMessage(),
  },
  {
    title: "Feed a party",
    body: "Whole birds, trays of wings, and enough flatbread for a room.",
    label: "Ask about catering",
    message: dishOrderMessage("Catering — whole birds & trays"),
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        index="03"
        label="Location"
        title={["Find the fire."]}
        lede={`${site.address.line1}, ${site.address.line2}, ${site.address.city} ${site.address.postcode}. Everything — orders, bookings, questions — happens on WhatsApp at ${site.whatsappDisplay}.`}
      />

      <div className="shell pb-8">
        <div className="grid gap-px border border-line bg-line md:grid-cols-3">
          {actions.map((action, index) => (
            <Reveal
              key={action.title}
              className="flex flex-col justify-between gap-6 bg-ink p-6 md:p-8"
              delay={index * 0.06}
            >
              <div>
                <h2 className="font-display text-xl uppercase leading-none text-cream md:text-2xl">
                  {action.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                  {action.body}
                </p>
              </div>
              <OrderButton
                message={action.message}
                variant="outline"
                className="self-start"
              >
                {action.label}
              </OrderButton>
            </Reveal>
          ))}
        </div>
      </div>

      <Location index="04" />
    </>
  );
}
