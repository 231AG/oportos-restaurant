"use client";

import { ButtonLink } from "./Button";
import { whatsappUrl } from "@/lib/whatsapp";

export function WhatsAppMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.9 9.9 0 0 0 4.68 1.2h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.02-5.1-2.88-6.96A9.78 9.78 0 0 0 12.04 2Zm0 1.8c2.15 0 4.17.84 5.69 2.36a7.98 7.98 0 0 1 2.36 5.68c0 4.44-3.61 8.04-8.05 8.04a8.1 8.1 0 0 1-4.11-1.12l-.29-.18-3.05.8.81-2.98-.19-.31a8 8 0 0 1-1.23-4.25c0-4.44 3.61-8.04 8.06-8.04Zm-3.5 4c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02 0 1.2.87 2.35.99 2.51.12.16 1.7 2.6 4.15 3.55 2.03.79 2.44.63 2.88.59.44-.04 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.3-.74-1.78-.19-.46-.39-.4-.54-.41h-.46Z" />
    </svg>
  );
}

interface OrderButtonProps {
  /** Pre-built WhatsApp message body. */
  message: string;
  children?: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "md" | "lg";
  className?: string;
  showMark?: boolean;
  arrow?: boolean;
}

/**
 * Every order path in the site ends here. The number itself lives in
 * `config/site.ts`; this component only ever sees a message.
 */
export function OrderButton({
  message,
  children = "Order now",
  variant = "primary",
  size = "md",
  className,
  showMark = true,
  arrow = false,
}: OrderButtonProps) {
  return (
    <ButtonLink
      href={whatsappUrl(message)}
      external
      variant={variant}
      size={size}
      className={className}
      arrow={arrow}
      aria-label={`${typeof children === "string" ? children : "Order"} on WhatsApp`}
    >
      {showMark ? <WhatsAppMark className="h-3.5 w-3.5" /> : null}
      {children}
    </ButtonLink>
  );
}
