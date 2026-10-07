"use client";

import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type FormEvent,
  useContext,
  useId,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  StatusBanner,
  StatusBannerContent,
  StatusBannerIcon,
  type StatusBannerProps,
} from "@/components/ui/uai/status-banner";
import { cn } from "@/lib/uai-utils";

export const CONTACT_SECTION_VARIANTS = ["split", "stacked", "card"] as const;
export type ContactSectionVariant = (typeof CONTACT_SECTION_VARIANTS)[number];
export type ContactSectionProps = ComponentProps<"section"> & { variant?: ContactSectionVariant };
export type ContactSectionStatus = "idle" | "submitting" | "success" | "error";

type SectionContext = {
  id: string;
  variant: ContactSectionVariant;
  status: ContactSectionStatus;
  setStatus: (status: ContactSectionStatus) => void;
};
const Context = createContext<SectionContext | null>(null);
function useSection(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ContactSection`);
  return context;
}

const contactSectionVariants = cva("@container min-w-0 text-[13px]/[18px] text-foreground", {
  variants: {
    variant: {
      split: "py-2",
      stacked: "mx-auto max-w-[640px] py-2",
      card: "rounded-[14px] border bg-card p-[clamp(16px,4cqi,28px)] shadow-[0_1px_2px_oklch(0_0_0/0.04)]",
    },
  },
});

const actionClass =
  "justify-self-start rounded-full border-0 py-0 transition-[filter,box-shadow,background-color,scale] duration-[120ms,120ms,120ms,140ms] ease-[ease-out,ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring active:not-aria-disabled:scale-[0.97] motion-reduce:transition-none motion-reduce:active:not-aria-disabled:scale-100";

/** Contact options, availability, a message form with its states, and response expectations. */
export function ContactSection({
  variant = "split",
  className,
  children,
  ...props
}: ContactSectionProps) {
  const id = useId();
  const [status, setStatus] = useState<ContactSectionStatus>("idle");
  return (
    <Context.Provider value={{ id, variant, status, setStatus }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="contact-section"
        data-variant={variant}
        className={cn(contactSectionVariants({ variant }), className)}
        {...props}
      >
        <div
          className={cn(
            "grid min-w-0 items-start gap-6",
            variant !== "stacked" &&
              "@min-[720px]:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] @min-[720px]:gap-x-10",
          )}
        >
          {children}
        </div>
      </section>
    </Context.Provider>
  );
}

export function ContactSectionDetails({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="contact-section-details"
      className={cn("grid min-w-0 gap-5", className)}
      {...props}
    />
  );
}

export function ContactSectionHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header data-slot="contact-section-header" className={cn("grid gap-2", className)} {...props} />
  );
}

export function ContactSectionTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id } = useSection("ContactSectionTitle");
  return (
    <h2
      data-slot="contact-section-title"
      className={cn(
        "m-0 text-[length:clamp(22px,2.5cqi_+_12px,30px)] leading-[1.15] font-medium tracking-[-0.025em] text-balance",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function ContactSectionDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="contact-section-description"
      className={cn("m-0 text-[15px]/[23px] text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

export function ContactSectionOptions({ className, ...props }: ComponentProps<"ul">) {
  const { variant } = useSection("ContactSectionOptions");
  return (
    <ul
      data-slot="contact-section-options"
      className={cn(
        "m-0 grid list-none gap-2 p-0",
        variant === "stacked"
          ? "grid-cols-[repeat(auto-fit,minmax(min(100%,170px),1fr))]"
          : "grid-cols-1",
        className,
      )}
      {...props}
    />
  );
}

export function ContactSectionOption({ className, ...props }: ComponentProps<"li">) {
  const { variant } = useSection("ContactSectionOption");
  return (
    <li
      data-slot="contact-section-option"
      className={cn(
        "grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-0.5 rounded-xl p-3",
        variant === "card"
          ? "bg-[color-mix(in_oklab,var(--muted)_70%,var(--card))] shadow-none"
          : "bg-card shadow-[inset_0_0_0_1px_var(--border)]",
        className,
      )}
      {...props}
    />
  );
}

export function ContactSectionOptionIcon({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="contact-section-option-icon"
      className={cn(
        "row-[1/span_3] grid size-7 place-items-center rounded-lg bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function ContactSectionOptionTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      data-slot="contact-section-option-title"
      className={cn("col-start-2 m-0 text-[13px]/[18px] font-medium", className)}
      {...props}
    />
  );
}

export function ContactSectionOptionDetail({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="contact-section-option-detail"
      className={cn("col-start-2 m-0 text-[12px]/[17px] text-subtle-foreground", className)}
      {...props}
    />
  );
}

export function ContactSectionOptionLink({ className, ...props }: ComponentProps<"a">) {
  return (
    <a
      data-slot="contact-section-option-link"
      className={cn(
        "col-start-2 mt-0.5 justify-self-start text-[12.5px] font-medium text-foreground underline decoration-border-strong underline-offset-3 wrap-anywhere transition-[text-decoration-color] duration-120 ease-[ease-out] hover:decoration-current focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export type ContactSectionAvailabilityProps = ComponentProps<"p"> & {
  /** Whether the team is available now. The text must say so too; the dot is decorative. */
  available?: boolean;
};

export function ContactSectionAvailability({
  available = false,
  children,
  className,
  ...props
}: ContactSectionAvailabilityProps) {
  return (
    <p
      data-slot="contact-section-availability"
      data-available={available}
      className={cn("m-0 flex items-center gap-2 text-[12px] text-muted-foreground", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-[7px] flex-none rounded-full",
          available
            ? "bg-success text-success animate-[ring-pulse_2s_cubic-bezier(0.23,1,0.32,1)_infinite] motion-reduce:animate-none"
            : "bg-border-strong",
        )}
      />
      <span>{children}</span>
    </p>
  );
}

export function ContactSectionExpectations({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="contact-section-expectations"
      className={cn(
        "m-0 grid list-none gap-[7px] p-0 text-[12.5px]/[18px] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function ContactSectionExpectation({ children, className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-slot="contact-section-expectation"
      className={cn("flex items-start gap-2", className)}
      {...props}
    >
      <Check
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className="mt-0.5 flex-none text-subtle-foreground size-3.5"
      />
      <span>{children}</span>
    </li>
  );
}

export type ContactSectionResult = "success" | "error";
export type ContactSectionFormProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  /** Receives the form data. Resolve "error" or throw to show the error state. */
  onSend: (
    data: FormData,
    // biome-ignore lint/suspicious/noConfusingVoidType: async handlers without a result mean success.
  ) => Promise<ContactSectionResult | void> | ContactSectionResult | void;
};

export function ContactSectionForm({ onSend, className, ...props }: ContactSectionFormProps) {
  const section = useSection("ContactSectionForm");
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (section.status === "submitting") return;
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    section.setStatus("submitting");
    try {
      const result = await onSend(new FormData(form));
      section.setStatus(result === "error" ? "error" : "success");
    } catch {
      section.setStatus("error");
    }
  };
  return (
    <form
      noValidate
      aria-busy={section.status === "submitting"}
      data-slot="contact-section-form"
      className={cn(
        "grid min-w-0 gap-3",
        section.variant === "card"
          ? "rounded-xl bg-[color-mix(in_oklab,var(--muted)_70%,var(--card))] p-4"
          : "rounded-none bg-transparent p-0",
        className,
      )}
      {...props}
      onSubmit={handleSubmit}
    />
  );
}

/** Form fields and the submit control. Hidden after a successful send. */
export function ContactSectionFields({ className, ...props }: ComponentProps<"div">) {
  const section = useSection("ContactSectionFields");
  if (section.status === "success") return null;
  return (
    <div
      data-slot="contact-section-fields"
      className={cn("grid min-w-0 gap-3", className)}
      {...props}
    />
  );
}

export function ContactSectionSubmit({
  children = "Send message",
  pendingLabel = "Sending…",
  onClick,
  className,
  ...props
}: Omit<ComponentProps<"button">, "type"> & { pendingLabel?: string }) {
  const section = useSection("ContactSectionSubmit");
  const pending = section.status === "submitting";
  return (
    <Button
      data-slot="contact-section-submit"
      className={cn(
        actionClass,
        "h-8.5 px-4 text-[13px] whitespace-nowrap has-[>svg]:px-4",
        pending
          ? "cursor-progress bg-muted text-muted-foreground hover:bg-muted"
          : "cursor-pointer bg-primary text-primary-foreground hover:bg-primary hover:not-aria-disabled:brightness-[1.08]",
        className,
      )}
      {...props}
      type="submit"
      aria-disabled={pending || undefined}
      onClick={(event) => {
        if (pending) event.preventDefault();
        onClick?.(event);
      }}
    >
      {/* Both labels share one grid cell so the button keeps its width while sending. */}
      <span className="grid *:[grid-area:1/1]">
        <span
          aria-hidden={pending || undefined}
          className={cn("inline-flex items-center justify-center gap-1.5", pending && "invisible")}
        >
          {children}
        </span>
        <span
          aria-hidden={!pending || undefined}
          className={cn(
            "shimmer-text text-center motion-reduce:text-muted-foreground",
            !pending && "invisible",
          )}
        >
          {pendingLabel}
        </span>
      </span>
    </Button>
  );
}

type ContactSectionResultProps = Omit<StatusBannerProps, "tone" | "open" | "defaultOpen">;

function ResultBanner({
  tone,
  children,
  ...props
}: ContactSectionResultProps & { tone: "success" | "error" }) {
  return (
    <StatusBanner data-slot={`contact-section-${tone}`} variant="tinted" {...props} tone={tone}>
      <StatusBannerIcon />
      <StatusBannerContent>{children}</StatusBannerContent>
    </StatusBanner>
  );
}

/** A success Status Banner shown after the message is sent. Compose StatusBannerTitle and description inside. */
export function ContactSectionSuccess(props: ContactSectionResultProps) {
  const section = useSection("ContactSectionSuccess");
  if (section.status !== "success") return null;
  return <ResultBanner {...props} tone="success" />;
}

/** An error Status Banner shown when sending fails. The fields stay filled so people can retry. */
export function ContactSectionError(props: ContactSectionResultProps) {
  const section = useSection("ContactSectionError");
  if (section.status !== "error") return null;
  return <ResultBanner {...props} tone="error" />;
}

export function ContactSectionReset({ onClick, className, ...props }: ComponentProps<"button">) {
  const section = useSection("ContactSectionReset");
  if (section.status !== "success") return null;
  return (
    <Button
      type="button"
      variant="secondary"
      data-slot="contact-section-reset"
      className={cn(
        actionClass,
        "h-7.5 cursor-pointer bg-secondary px-[13px] text-[12.5px] text-secondary-foreground hover:bg-secondary hover:shadow-[inset_0_0_0_999px_color-mix(in_oklab,var(--foreground)_9%,transparent)] has-[>svg]:px-[13px]",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) section.setStatus("idle");
      }}
    />
  );
}
