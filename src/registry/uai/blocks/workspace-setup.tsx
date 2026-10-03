"use client";

import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  FormField,
  FormFieldError,
  FormFieldInput,
  type FormFieldProps,
} from "@/components/ui/uai/form-field";
import {
  StatusBanner,
  StatusBannerContent,
  StatusBannerDescription,
  StatusBannerIcon,
} from "@/components/ui/uai/status-banner";
import { cn } from "@/lib/uai-utils";

export const WORKSPACE_SETUP_VARIANTS = ["card", "split", "compact"] as const;
export type WorkspaceSetupVariant = (typeof WORKSPACE_SETUP_VARIANTS)[number];
export type WorkspaceSetupValues = {
  name: string;
  slug: string;
  invites: string[];
  /** Every other named field in the form, such as initial settings. */
  formData: FormData;
};
export type WorkspaceSetupProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  variant?: WorkspaceSetupVariant;
  defaultName?: string;
  /** Creates the workspace. Throw or reject with an Error to show its message. */
  onCreate: (values: WorkspaceSetupValues) => Promise<unknown> | unknown;
};

type Field = "name" | "slug" | "invite";
type SetupContext = {
  id: string;
  variant: WorkspaceSetupVariant;
  name: string;
  slug: string;
  invites: string[];
  draft: string;
  errors: Partial<Record<Field, string>>;
  status: "idle" | "creating" | "created" | "error";
  failure: string | null;
  setName: (name: string) => void;
  setSlug: (slug: string) => void;
  setDraft: (draft: string) => void;
  addInvites: () => string[] | null;
  removeInvite: (email: string) => void;
};
const Context = createContext<SetupContext | null>(null);
function useSetup(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within WorkspaceSetup`);
  return context;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 40);
const transition =
  "[transition:background-color_120ms_ease-out,color_120ms_ease-out,box-shadow_120ms_ease-out,filter_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none";
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const buttonBase = cn(
  transition,
  focusRing,
  "cursor-pointer rounded-full border-0 font-medium not-disabled:active:scale-[0.97] motion-reduce:not-disabled:active:scale-100",
);
const workspaceSetupVariants = cva(
  "@container box-border min-w-0 text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        card: "mx-auto my-0 max-w-160 rounded-[14px] border bg-card p-[clamp(16px,4cqi,28px)]",
        split: "px-0 py-2",
        compact: "mx-auto my-0 max-w-120 rounded-xl border bg-card p-4",
      },
    },
  },
);

/** Creates a workspace: a name and URL, pending invitations, and initial settings. */
export function WorkspaceSetup({
  variant = "card",
  defaultName = "",
  onCreate,
  children,
  className,
  ...props
}: WorkspaceSetupProps) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setNameState] = useState(defaultName);
  const [slug, setSlugState] = useState(slugify(defaultName));
  const [slugEdited, setSlugEdited] = useState(false);
  const [invites, setInvites] = useState<string[]>([]);
  const [draft, setDraftState] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<SetupContext["status"]>("idle");
  const [failure, setFailure] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (attempt === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);

  const clear = (field: Field) => setErrors(({ [field]: _, ...rest }) => rest);
  /** Moves the draft into the invite list. Returns the merged list, or null when invalid. */
  const addInvites = () => {
    const entries = draft
      .toLowerCase()
      .split(/[\s,;]+/)
      .filter(Boolean);
    if (entries.length === 0) return invites;
    const bad = entries.find((entry) => !EMAIL.test(entry));
    if (bad) {
      setErrors((current) => ({ ...current, invite: `${bad} is not a valid email address.` }));
      return null;
    }
    const merged = [...new Set([...invites, ...entries])];
    setInvites(merged);
    setDraftState("");
    clear("invite");
    return merged;
  };

  return (
    <Context.Provider
      value={{
        id,
        variant,
        name,
        slug,
        invites,
        draft,
        errors,
        status,
        failure,
        setName: (next) => {
          setNameState(next);
          clear("name");
          if (!slugEdited) {
            setSlugState(slugify(next).replace(/-+$/, ""));
            clear("slug");
          }
        },
        setSlug: (next) => {
          setSlugEdited(true);
          setSlugState(slugify(next));
          clear("slug");
        },
        setDraft: (next) => {
          setDraftState(next);
          clear("invite");
        },
        addInvites,
        removeInvite: (email) => setInvites((current) => current.filter((item) => item !== email)),
      }}
    >
      <form
        ref={formRef}
        noValidate
        aria-labelledby={`${id}-title`}
        data-slot="workspace-setup"
        className={cn(workspaceSetupVariants({ variant }), className)}
        {...props}
        data-variant={variant}
        data-status={status}
        onSubmit={async (event) => {
          event.preventDefault();
          if (status === "creating") return;
          const next: Partial<Record<Field, string>> = {};
          if (!name.trim()) next.name = "Enter a workspace name.";
          if (!SLUG.test(slug)) {
            next.slug = "Use 3–40 lowercase letters, numbers, or hyphens.";
          }
          const allInvites = addInvites();
          if (Object.keys(next).length > 0 || !allInvites) {
            setErrors((current) => ({ ...current, ...next }));
            setAttempt((count) => count + 1);
            return;
          }
          setStatus("creating");
          setFailure(null);
          try {
            await onCreate({
              name: name.trim(),
              slug,
              invites: allInvites,
              formData: new FormData(event.currentTarget),
            });
            setStatus("created");
          } catch (reason) {
            setFailure(
              reason instanceof Error ? reason.message : "The workspace could not be created.",
            );
            setStatus("error");
          }
        }}
      >
        <div
          className={cn(
            "grid min-w-0 gap-5 [grid-template-areas:'header'_'main'_'summary']",
            variant === "split" &&
              "@min-[760px]:grid-cols-[minmax(0,1fr)_280px] @min-[760px]:gap-x-8 @min-[760px]:[grid-template-areas:'header_header'_'main_summary']",
          )}
        >
          {children}
        </div>
      </form>
    </Context.Provider>
  );
}

export function WorkspaceSetupHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="workspace-setup-header"
      className={cn("grid min-w-0 gap-1 [grid-area:header]", className)}
      {...props}
    />
  );
}

export function WorkspaceSetupTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useSetup("WorkspaceSetupTitle");
  return (
    <h2
      data-slot="workspace-setup-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.01em]",
        variant === "compact" ? "text-[15px]/5" : "text-lg/6",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function WorkspaceSetupDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="workspace-setup-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/** The main column: sections, errors, and actions. */
export function WorkspaceSetupMain({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useSetup("WorkspaceSetupMain");
  return (
    <div
      data-slot="workspace-setup-main"
      className={cn(
        "grid min-w-0 content-start [grid-area:main]",
        variant === "compact" ? "gap-5" : "gap-6",
        className,
      )}
      {...props}
    />
  );
}

export function WorkspaceSetupSection({ className, ...props }: ComponentProps<"fieldset">) {
  const { variant, status } = useSetup("WorkspaceSetupSection");
  return (
    <fieldset
      data-slot="workspace-setup-section"
      className={cn(
        "m-0 grid min-w-0 gap-3 border-0",
        variant === "split"
          ? "rounded-[14px] bg-card px-5 pt-4.5 pb-5 shadow-[inset_0_0_0_1px_var(--border)]"
          : "rounded-none bg-transparent p-0",
        className,
      )}
      {...props}
      disabled={status === "creating"}
    />
  );
}

export function WorkspaceSetupSectionTitle({ className, ...props }: ComponentProps<"legend">) {
  return (
    <legend
      data-slot="workspace-setup-section-title"
      className={cn("float-left w-full p-0 text-sm/5 font-medium", className)}
      {...props}
    />
  );
}

export function WorkspaceSetupSectionDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="workspace-setup-section-description"
      className={cn("mx-0 -mt-2 mb-0 text-[12.5px] text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

type BoundFieldProps = Omit<
  FormFieldProps,
  "value" | "defaultValue" | "onValueChange" | "invalid" | "required"
>;

/** A Form Field bound to the workspace name. Compose FormFieldLabel and FormFieldInput inside. */
export function WorkspaceSetupName({ variant, ...props }: BoundFieldProps) {
  const context = useSetup("WorkspaceSetupName");
  return (
    <FormField
      {...props}
      variant={variant ?? (context.variant === "compact" ? "compact" : "outlined")}
      required
      value={context.name}
      onValueChange={context.setName}
      invalid={Boolean(context.errors.name)}
    />
  );
}

/** A Form Field bound to the URL slug. It follows the name until someone edits it. */
export function WorkspaceSetupUrl({ variant, ...props }: BoundFieldProps) {
  const context = useSetup("WorkspaceSetupUrl");
  return (
    <FormField
      {...props}
      variant={variant ?? (context.variant === "compact" ? "compact" : "outlined")}
      required
      value={context.slug}
      onValueChange={context.setSlug}
      invalid={Boolean(context.errors.slug)}
    />
  );
}

/** A Form Field bound to the invitation draft. Enter or a comma adds the addresses. */
export function WorkspaceSetupInvite({ variant, ...props }: BoundFieldProps) {
  const context = useSetup("WorkspaceSetupInvite");
  return (
    <FormField
      {...props}
      variant={variant ?? (context.variant === "compact" ? "compact" : "outlined")}
      value={context.draft}
      onValueChange={context.setDraft}
      invalid={Boolean(context.errors.invite)}
    />
  );
}

export function WorkspaceSetupInviteRow({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="workspace-setup-invite-row"
      className={cn("flex min-w-0 flex-wrap gap-2", className)}
      {...props}
    />
  );
}

export function WorkspaceSetupInviteInput({
  onKeyDown,
  className,
  ...props
}: ComponentProps<typeof FormFieldInput>) {
  const context = useSetup("WorkspaceSetupInviteInput");
  return (
    <FormFieldInput
      type="email"
      autoComplete="off"
      className={cn("w-auto flex-[1_1_200px]", className)}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Enter" || event.key === ",") {
          event.preventDefault();
          context.addInvites();
        }
      }}
    />
  );
}

export function WorkspaceSetupInviteAdd({
  onClick,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useSetup("WorkspaceSetupInviteAdd");
  return (
    <button
      type="button"
      data-slot="workspace-setup-invite-add"
      className={cn(
        buttonBase,
        "h-7.5 flex-none self-center bg-secondary px-3.25 text-[12.5px] text-foreground not-disabled:hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.addInvites();
      }}
    />
  );
}

/** The invitation error, rendered inside WorkspaceSetupInvite. */
export function WorkspaceSetupInviteError(props: ComponentProps<typeof FormFieldError>) {
  const context = useSetup("WorkspaceSetupInviteError");
  return <FormFieldError {...props}>{context.errors.invite}</FormFieldError>;
}

/** Lists pending invitations with remove buttons. Children render when the list is empty. */
export function WorkspaceSetupInviteList({ children, className, ...props }: ComponentProps<"ul">) {
  const context = useSetup("WorkspaceSetupInviteList");
  if (context.invites.length === 0) {
    return (
      <p data-slot="workspace-setup-invite-list" className="m-0 text-[12px] text-subtle-foreground">
        {children}
      </p>
    );
  }
  return (
    <ul
      aria-label="Pending invitations"
      data-slot="workspace-setup-invite-list"
      className={cn("m-0 flex list-none flex-wrap gap-1.5 p-0", className)}
      {...props}
    >
      {context.invites.map((email) => (
        <li
          key={email}
          className="inline-flex h-6.5 max-w-full min-w-0 animate-in items-center gap-0.5 rounded-md bg-muted pr-0.75 pl-2.25 text-[12px] font-medium duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] fade-in-0 zoom-in-96 fill-mode-both motion-reduce:animate-none"
        >
          <span className="truncate">{email}</span>
          <button
            type="button"
            aria-label={`Remove ${email}`}
            onClick={() => context.removeInvite(email)}
            className={cn(
              transition,
              focusRing,
              "grid size-5 flex-none cursor-pointer place-items-center rounded-sm border-0 bg-transparent p-0 text-subtle-foreground hover:bg-foreground/10 hover:text-foreground",
            )}
          >
            <X size={12} strokeWidth={2} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export type WorkspaceSetupChoiceProps = Omit<ComponentProps<"input">, "type" | "children"> & {
  type?: "radio" | "checkbox";
  children: ReactNode;
};

/** A selectable initial setting: a native radio or checkbox with a label and description. */
export function WorkspaceSetupChoice({
  type = "radio",
  children,
  className,
  ...props
}: WorkspaceSetupChoiceProps) {
  const { variant } = useSetup("WorkspaceSetupChoice");
  return (
    <label
      data-slot="workspace-setup-choice"
      className={cn(
        transition,
        "flex min-w-0 cursor-pointer items-start gap-2.5 bg-card shadow-[inset_0_0_0_1px_var(--border)] hover:bg-[color-mix(in_oklab,var(--muted)_50%,var(--card))] has-checked:bg-[color-mix(in_oklab,var(--primary)_6%,var(--card))] has-checked:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_55%,transparent)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
        variant === "compact" ? "rounded-lg p-2.5" : "rounded-[10px] p-3",
        className,
      )}
    >
      <input {...props} type={type} className="mx-0 mt-0.5 mb-0 flex-none accent-primary" />
      <span className="grid min-w-0 gap-0.5">{children}</span>
    </label>
  );
}

export function WorkspaceSetupChoiceLabel({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="workspace-setup-choice-label"
      className={cn("font-medium", className)}
      {...props}
    />
  );
}

export function WorkspaceSetupChoiceDescription({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="workspace-setup-choice-description"
      className={cn("text-[12px] text-muted-foreground", className)}
      {...props}
    />
  );
}

/** A live summary of the workspace. Split shows it beside the form; others place it below. */
export function WorkspaceSetupSummary({ className, ...props }: ComponentProps<"aside">) {
  const { id, variant } = useSetup("WorkspaceSetupSummary");
  return (
    <aside
      aria-labelledby={`${id}-summary`}
      data-slot="workspace-setup-summary"
      className={cn(
        "grid min-w-0 gap-2 bg-muted [grid-area:summary]",
        variant === "compact" ? "rounded-xl p-3" : "rounded-[14px] p-4",
        variant === "split" && "@min-[760px]:sticky @min-[760px]:top-4 @min-[760px]:self-start",
        className,
      )}
      {...props}
    />
  );
}

export function WorkspaceSetupSummaryTitle({ className, ...props }: ComponentProps<"h3">) {
  const { id } = useSetup("WorkspaceSetupSummaryTitle");
  return (
    <h3
      data-slot="workspace-setup-summary-title"
      className={cn("m-0 text-[13px] font-medium", className)}
      {...props}
      id={`${id}-summary`}
    />
  );
}

/** Prints a live value: the name, the URL slug, or the number of invitations. */
export function WorkspaceSetupValue({
  field,
  children,
  className,
  ...props
}: ComponentProps<"span"> & { field: "name" | "slug" | "invites" }) {
  const context = useSetup("WorkspaceSetupValue");
  const value =
    field === "invites"
      ? `${context.invites.length} ${context.invites.length === 1 ? "person" : "people"}`
      : context[field].trim();
  return (
    <span
      data-slot="workspace-setup-value"
      className={cn("wrap-anywhere", !value && "text-muted-foreground", className)}
      {...props}
    >
      {value || children}
    </span>
  );
}

/** Shows why creation failed as an error Status Banner. */
export function WorkspaceSetupError({
  children,
  ...props
}: Omit<ComponentProps<typeof StatusBanner>, "tone">) {
  const context = useSetup("WorkspaceSetupError");
  if (context.status !== "error" || !context.failure) return null;
  return (
    <StatusBanner variant="tinted" {...props} tone="error">
      <StatusBannerIcon />
      <StatusBannerContent>
        {children}
        <StatusBannerDescription className="text-inherit">
          {context.failure}
        </StatusBannerDescription>
      </StatusBannerContent>
    </StatusBanner>
  );
}

/** Confirms creation as a success Status Banner. */
export function WorkspaceSetupCreated({
  children,
  ...props
}: Omit<ComponentProps<typeof StatusBanner>, "tone">) {
  const context = useSetup("WorkspaceSetupCreated");
  if (context.status !== "created") return null;
  return (
    <StatusBanner variant="tinted" {...props} tone="success">
      <StatusBannerIcon />
      <StatusBannerContent>{children}</StatusBannerContent>
    </StatusBanner>
  );
}

export function WorkspaceSetupActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="workspace-setup-actions"
      className={cn("flex flex-wrap items-center justify-end gap-2", className)}
      {...props}
    />
  );
}

export function WorkspaceSetupSubmit({
  pendingLabel = "Creating…",
  children,
  className,
  ...props
}: ComponentProps<"button"> & { pendingLabel?: ReactNode }) {
  const context = useSetup("WorkspaceSetupSubmit");
  const pending = context.status === "creating";
  const compact = context.variant === "compact";
  return (
    <button
      type="submit"
      data-slot="workspace-setup-submit"
      className={cn(
        buttonBase,
        "bg-primary text-primary-foreground not-disabled:hover:brightness-108 disabled:cursor-default disabled:bg-secondary disabled:text-subtle-foreground",
        compact ? "h-7 px-3 text-[12.5px]" : "h-8 px-3.5 text-[13px]",
        pending && "cursor-progress",
        className,
      )}
      {...props}
      aria-busy={pending || undefined}
      disabled={context.status === "created"}
    >
      {pending ? (
        <span className="animate-[shimmer_2s_linear_infinite] bg-[linear-gradient(90deg,color-mix(in_oklab,currentColor_55%,transparent)_0%,color-mix(in_oklab,currentColor_55%,transparent)_35%,currentColor_50%,color-mix(in_oklab,currentColor_55%,transparent)_65%,color-mix(in_oklab,currentColor_55%,transparent)_100%)] bg-size-[200%_100%] bg-clip-text [-webkit-text-fill-color:transparent] motion-reduce:animate-none motion-reduce:bg-none motion-reduce:[-webkit-text-fill-color:currentColor]">
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
