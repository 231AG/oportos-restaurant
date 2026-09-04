import type { Metadata } from "next";
import { FullMenu } from "@/components/menu/MenuList";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { OrderButton } from "@/components/ui/OrderButton";
import { generalOrderMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Starters, mains, the grill, drinks and desserts — everything off the coals at OPORTOS. Order any dish on WhatsApp.",
};

export default function MenuPage() {
  return (
    <>
      <PageHeader
        index="01"
        label="The menu"
        title={["Everything", "off the coals."]}
        lede="Prices include everything but the napkins. Add dishes to the tray and send one message, or order a single dish straight from its row."
      >
        <OrderButton message={generalOrderMessage()} size="lg" arrow>
          Order on WhatsApp
        </OrderButton>
      </PageHeader>

      <div className="shell pb-24 md:pb-32">
        <CategoryNav />
        <FullMenu />
      </div>
    </>
  );
}
