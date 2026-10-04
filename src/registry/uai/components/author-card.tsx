"use client";

import { cva } from "class-variance-authority";
import { Check, Plus } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/uai-utils";

export const AUTHOR_CARD_VARIANTS = ["card", "inline", "compact"] as const;
export type AuthorCardVariant = (typeof AUTHOR_CARD_VARIANTS)[number];
export type AuthorCardProps = ComponentProps<"article"> & { variant?: AuthorCardVariant };
type AuthorContext = { id: string; variant: AuthorCardVariant };
const Context = createContext<AuthorContext | null>(null);
function useAuthor(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within AuthorCard`);
  return context;
}
const actionClass =
  "transition-[background-color,color,filter,transform] duration-[120ms,120ms,120ms,140ms] ease-[ease-out,ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";
const mixHover = "hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]";
function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

const authorCardVariants = cva(
  "grid min-w-0 items-start gap-x-3 text-[13px]/[18px] text-card-foreground",
  {
    variants: {
      variant: {
        card: "grid-cols-[minmax(0,1fr)] gap-y-3 rounded-[14px] border bg-card p-4.5",
        inline: "grid-cols-[auto_minmax(0,1fr)] gap-y-2 rounded-[14px] border-0 bg-transparent p-0",
        compact: "grid-cols-[minmax(0,1fr)] gap-y-2 rounded-xl border bg-card p-3",
      },
    },
  },
);

export function AuthorCard({ variant = "card", className, children, ...props }: AuthorCardProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <article
        aria-labelledby={`${id}-name`}
        data-slot="author-card"
        data-variant={variant}
        className={cn(authorCardVariants({ variant }), className)}
        {...props}
      >
        {children}
      </article>
    </Context.Provider>
  );
}

const avatarSizes = {
  card: "size-10 text-[13px]",
  inline: "row-span-3 size-9 text-[12px]",
  compact: "size-7 text-[11px]",
};

export function AuthorCardAvatar({
  name,
  src,
  className,
  ...props
}: Omit<ComponentProps<"span">, "children"> & { name: string; src?: string }) {
  const { variant } = useAuthor("AuthorCardAvatar");
  // Radix shows the image only once it loads and falls back to initials otherwise.
  return (
    <Avatar
      aria-hidden="true"
      data-slot="author-card-avatar"
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground shadow-[0_0_0_1px_oklch(1_0_0/0.08)]",
        avatarSizes[variant],
        className,
      )}
      {...props}
    >
      {src ? <AvatarImage src={src} alt="" className="object-cover" /> : null}
      <AvatarFallback className="text-[length:inherit]">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}

export function AuthorCardHeader({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useAuthor("AuthorCardHeader");
  return (
    <div
      data-slot="author-card-header"
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-between gap-3",
        variant === "inline" && "col-start-2",
        className,
      )}
      {...props}
    />
  );
}

export function AuthorCardName({ className, ...props }: ComponentProps<"p">) {
  const { id, variant } = useAuthor("AuthorCardName");
  return (
    <p
      data-slot="author-card-name"
      className={cn(
        "m-0 font-medium",
        variant === "compact" ? "text-[13px]/[18px]" : "text-[14px]/5",
        className,
      )}
      {...props}
      id={`${id}-name`}
    />
  );
}

export function AuthorCardRole({ className, ...props }: ComponentProps<"p">) {
  useAuthor("AuthorCardRole");
  return (
    <p
      data-slot="author-card-role"
      className={cn("m-0 text-xs/4 text-subtle-foreground", className)}
      {...props}
    />
  );
}

export function AuthorCardBio({ className, ...props }: ComponentProps<"p">) {
  const { variant } = useAuthor("AuthorCardBio");
  return (
    <p
      data-slot="author-card-bio"
      className={cn(
        "m-0 text-pretty text-muted-foreground",
        variant === "compact" ? "text-[12.5px]/[18px]" : "text-[13px]/[19px]",
        variant === "inline" && "col-start-2",
        className,
      )}
      {...props}
    />
  );
}

export function AuthorCardLinks({
  "aria-label": label = "Profiles",
  className,
  ...props
}: ComponentProps<"ul">) {
  const { variant } = useAuthor("AuthorCardLinks");
  return (
    <ul
      aria-label={label}
      data-slot="author-card-links"
      className={cn(
        "m-0 flex list-none flex-wrap gap-1 p-0",
        variant === "inline" && "col-start-2",
        className,
      )}
      {...props}
    />
  );
}

export function AuthorCardLink({ className, children, ...props }: ComponentProps<"a">) {
  const { variant } = useAuthor("AuthorCardLink");
  return (
    <li className="flex">
      <Button
        asChild
        variant="secondary"
        size="sm"
        className={cn(
          actionClass,
          mixHover,
          "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary px-2.5 text-[12px] font-medium text-muted-foreground tabular-nums no-underline hover:text-foreground has-[>svg]:px-2.5",
          variant === "compact" ? "h-6" : "h-6.5",
          className,
        )}
      >
        <a data-slot="author-card-link" {...props}>
          {children}
        </a>
      </Button>
    </li>
  );
}

export type AuthorCardFollowProps = Omit<ComponentProps<"button">, "type"> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
};
export function AuthorCardFollow({
  pressed,
  defaultPressed = false,
  onPressedChange,
  onClick,
  children = "Follow",
  className,
  ...props
}: AuthorCardFollowProps) {
  const { id, variant } = useAuthor("AuthorCardFollow");
  const [internal, setInternal] = useState(defaultPressed);
  const current = pressed ?? internal;
  const Icon = current ? Check : Plus;
  return (
    <Button
      aria-describedby={`${id}-name`}
      data-slot="author-card-follow"
      className={cn(
        actionClass,
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-primary py-0 font-medium text-primary-foreground hover:bg-primary hover:brightness-108",
        "aria-pressed:bg-secondary aria-pressed:text-secondary-foreground aria-pressed:hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] aria-pressed:hover:filter-none",
        variant === "compact"
          ? "h-6.5 pr-2.5 pl-2 text-[12px] has-[>svg]:pr-2.5 has-[>svg]:pl-2"
          : "h-7 pr-3 pl-2.5 text-[12.5px] has-[>svg]:pr-3 has-[>svg]:pl-2.5",
        className,
      )}
      {...props}
      type="button"
      aria-pressed={current}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (pressed === undefined) setInternal(!current);
        onPressedChange?.(!current);
      }}
    >
      <Icon
        key={current ? "on" : "off"}
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className={cn(
          "size-3.5",
          current &&
            "animate-in fade-in-0 zoom-in-60 duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none",
        )}
      />
      {children}
    </Button>
  );
}
