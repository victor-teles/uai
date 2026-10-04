"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  NewsletterForm,
  type NewsletterFormProps,
  type NewsletterFormVariant,
} from "@/components/ui/uai/newsletter-form";
import { cn } from "@/lib/uai-utils";

export const WAITLIST_SECTION_VARIANTS = ["split", "centered", "card"] as const;
export type WaitlistSectionVariant = (typeof WAITLIST_SECTION_VARIANTS)[number];
export type WaitlistSectionProps = ComponentProps<"section"> & {
  variant?: WaitlistSectionVariant;
};

type WaitlistContext = {
  id: string;
  variant: WaitlistSectionVariant;
  joinedEmail: string | null;
  setJoinedEmail: (email: string | null) => void;
};
const Context = createContext<WaitlistContext | null>(null);
function useWaitlist(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within WaitlistSection`);
  return context;
}

const waitlistSectionVariants = cva(
  "box-border @container min-w-0 text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        split: "py-2",
        centered: "mx-auto max-w-[560px] py-2",
        card: "mx-auto max-w-[560px] rounded-[14px] border bg-card p-[clamp(24px,5cqi,36px)] shadow-[0_1px_2px_oklch(0_0_0/0.04)]",
      },
    },
  },
);
const formVariants: Record<WaitlistSectionVariant, NewsletterFormVariant> = {
  split: "card",
  centered: "inline",
  card: "stacked",
};

/** Collects interest with qualification fields and consent, then replaces the form with a confirmation. */
export function WaitlistSection({
  variant = "split",
  children,
  className,
  ...props
}: WaitlistSectionProps) {
  const id = useId();
  const [joinedEmail, setJoinedEmail] = useState<string | null>(null);
  return (
    <Context.Provider value={{ id, variant, joinedEmail, setJoinedEmail }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="waitlist-section"
        data-variant={variant}
        className={cn(waitlistSectionVariants({ variant }), className)}
        {...props}
      >
        <div
          className={cn(
            "grid min-w-0 items-start gap-6",
            variant === "split" &&
              "@min-[720px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @min-[720px]:gap-x-12",
          )}
        >
          {children}
        </div>
      </section>
    </Context.Provider>
  );
}

export function WaitlistSectionContent({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useWaitlist("WaitlistSectionContent");
  const centered = variant !== "split";
  return (
    <div
      data-slot="waitlist-section-content"
      className={cn(
        "grid min-w-0 gap-2.5",
        centered ? "justify-items-center text-center" : "justify-items-start text-start",
        className,
      )}
      {...props}
    />
  );
}

export function WaitlistSectionTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id } = useWaitlist("WaitlistSectionTitle");
  return (
    <h2
      data-slot="waitlist-section-title"
      className={cn(
        "m-0 text-[length:clamp(22px,2.5cqi_+_12px,30px)] leading-[1.15] font-medium tracking-[-0.025em] text-balance",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function WaitlistSectionDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="waitlist-section-description"
      className={cn("m-0 text-[15px]/[23px] text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

export function WaitlistSectionHighlights({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="waitlist-section-highlights"
      className={cn(
        "m-0 mt-1.5 grid list-none gap-2 p-0 text-start text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function WaitlistSectionHighlight({ children, className, ...props }: ComponentProps<"li">) {
  return (
    <li data-slot="waitlist-section-highlight" className={cn("flex gap-2", className)} {...props}>
      <span
        aria-hidden="true"
        className="mt-[7px] size-[5px] flex-none rounded-full bg-subtle-foreground"
      />
      <span>{children}</span>
    </li>
  );
}

/**
 * A Newsletter Form that also carries qualification fields. Resolving `onSubscribe` with success
 * (or nothing) swaps the form for WaitlistSectionConfirmation.
 */
export function WaitlistSectionForm({ variant, onSubscribe, ...props }: NewsletterFormProps) {
  const waitlist = useWaitlist("WaitlistSectionForm");
  if (waitlist.joinedEmail !== null) return null;
  return (
    <NewsletterForm
      {...props}
      variant={variant ?? formVariants[waitlist.variant]}
      onSubscribe={async (submission) => {
        const result = await onSubscribe(submission);
        if (result === undefined || result === "success") {
          waitlist.setJoinedEmail(submission.email);
        }
        return result;
      }}
    />
  );
}

export function WaitlistSectionQualification({ className, ...props }: ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="waitlist-section-qualification"
      className={cn("m-0 grid min-w-0 gap-3 border-0 p-0 text-start", className)}
      {...props}
    />
  );
}

export function WaitlistSectionQualificationLegend({
  className,
  ...props
}: ComponentProps<"legend">) {
  return (
    <legend
      data-slot="waitlist-section-qualification-legend"
      className={cn("mb-1 p-0 text-[11.5px]/4 font-medium text-subtle-foreground", className)}
      {...props}
    />
  );
}

/** Rendered after a successful signup. Focus moves here so the confirmation is announced. */
export function WaitlistSectionConfirmation({ className, ...props }: ComponentProps<"div">) {
  const waitlist = useWaitlist("WaitlistSectionConfirmation");
  const ref = useRef<HTMLDivElement>(null);
  const joined = waitlist.joinedEmail !== null;
  useEffect(() => {
    if (joined) ref.current?.focus();
  }, [joined]);
  if (!joined) return null;
  return (
    <div
      role="status"
      tabIndex={-1}
      data-slot="waitlist-section-confirmation"
      className={cn(
        "grid min-w-0 animate-in gap-2 rounded-[14px] bg-[color-mix(in_oklab,var(--success)_10%,var(--card))] p-5 text-start outline-offset-2 fade-in-0 zoom-in-98 slide-in-from-bottom-1 duration-240 ease-[cubic-bezier(0.16,1,0.3,1)] fill-mode-both focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring motion-reduce:animate-none",
        className,
      )}
      {...props}
      ref={ref}
    />
  );
}

export function WaitlistSectionConfirmationTitle({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="waitlist-section-confirmation-title"
      className={cn(
        "m-0 text-[15px]/5 font-medium text-[color-mix(in_oklab,var(--success)_75%,var(--foreground))]",
        className,
      )}
      {...props}
    />
  );
}

/** The address that joined, for use inside the confirmation copy. */
export function WaitlistSectionEmail({ className, ...props }: ComponentProps<"strong">) {
  const waitlist = useWaitlist("WaitlistSectionEmail");
  return (
    <strong
      data-slot="waitlist-section-email"
      className={cn("font-medium wrap-anywhere text-foreground", className)}
      {...props}
    >
      {waitlist.joinedEmail}
    </strong>
  );
}

export function WaitlistSectionRestart({ onClick, className, ...props }: ComponentProps<"button">) {
  const waitlist = useWaitlist("WaitlistSectionRestart");
  return (
    <Button
      type="button"
      variant="link"
      data-slot="waitlist-section-restart"
      className={cn(
        "h-7 cursor-pointer justify-self-start rounded-none border-0 bg-transparent p-0 text-[12.5px] text-foreground underline decoration-border-strong underline-offset-3 transition-[text-decoration-color] duration-120 ease-out hover:decoration-current focus-visible:rounded-[4px] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none has-[>svg]:px-0",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) waitlist.setJoinedEmail(null);
      }}
    />
  );
}
