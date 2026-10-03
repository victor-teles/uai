"use client";

import { X } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
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
const layoutCss = `
[data-uai-workspace-layout]{display:grid;gap:20px;min-width:0;grid-template-areas:"header" "main" "summary"}
[data-uai-workspace-part="header"]{grid-area:header}
[data-uai-workspace-part="main"]{grid-area:main}
[data-uai-workspace-part="summary"]{grid-area:summary}
@container (min-width: 760px){
  [data-uai-workspace="split"]>[data-uai-workspace-layout]{grid-template-columns:minmax(0,1fr) 280px;grid-template-areas:"header header" "main summary";column-gap:32px}
  [data-uai-workspace="split"] [data-uai-workspace-part="summary"]{position:sticky;top:16px;align-self:start}
}
[data-uai-workspace-button],[data-uai-workspace-remove],[data-uai-workspace-choice]{transition:background-color 120ms ease-out,color 120ms ease-out,box-shadow 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-workspace-button="primary"]{background:var(--uai-accent);color:var(--uai-accent-foreground)}
[data-uai-workspace-button="primary"]:disabled{background:var(--uai-surface-raised);color:var(--uai-subtle);cursor:default}
[data-uai-workspace-button="secondary"]{background:var(--uai-surface-raised);color:var(--uai-text)}
[data-uai-workspace-button="primary"]:hover:not(:disabled){filter:brightness(1.08)}
[data-uai-workspace-button="secondary"]:hover:not(:disabled){background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
[data-uai-workspace-button]:active:not(:disabled){transform:scale(0.97)}
[data-uai-workspace-remove]{background:transparent;color:var(--uai-subtle)}
[data-uai-workspace-remove]:hover{background:color-mix(in oklab,var(--uai-text) 10%,transparent);color:var(--uai-text)}
[data-uai-workspace-choice]{background:var(--uai-surface);box-shadow:inset 0 0 0 1px var(--uai-border)}
[data-uai-workspace-choice]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 50%,var(--uai-surface))}
[data-uai-workspace-choice]:has(input:checked){background:color-mix(in oklab,var(--uai-accent) 6%,var(--uai-surface));box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--uai-accent) 55%,transparent)}
[data-uai-workspace-choice]:has(input:focus-visible){outline:2px solid var(--uai-accent);outline-offset:2px}
[data-uai-workspace-button]:focus-visible,[data-uai-workspace-remove]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@keyframes uai-workspace-pop{from{opacity:0;transform:scale(0.96)}}
[data-uai-workspace-invite]{animation:uai-workspace-pop 180ms cubic-bezier(0.16,1,0.3,1) both}
@keyframes uai-workspace-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}
[data-uai-workspace-shimmer]{background:linear-gradient(90deg,color-mix(in oklab,currentColor 55%,transparent) 0%,color-mix(in oklab,currentColor 55%,transparent) 35%,currentColor 50%,color-mix(in oklab,currentColor 55%,transparent) 65%,color-mix(in oklab,currentColor 55%,transparent) 100%) 0 0/200% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:uai-workspace-shimmer 2s linear infinite}
@media (prefers-reduced-motion: reduce){[data-uai-workspace-button],[data-uai-workspace-remove],[data-uai-workspace-choice]{transition:none}[data-uai-workspace-button]:active:not(:disabled){transform:none}[data-uai-workspace-invite]{animation:none}[data-uai-workspace-shimmer]{animation:none;background:none;-webkit-text-fill-color:currentColor}}`;
const shells: Record<WorkspaceSetupVariant, CSSProperties> = {
  card: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "clamp(16px, 4cqi, 28px)",
    border: "1px solid var(--uai-border)",
    borderRadius: 14,
    background: "var(--uai-surface)",
  },
  split: { padding: "8px 0" },
  compact: {
    maxWidth: 480,
    margin: "0 auto",
    padding: 16,
    border: "1px solid var(--uai-border)",
    borderRadius: 12,
    background: "var(--uai-surface)",
  },
};

/** Creates a workspace: a name and URL, pending invitations, and initial settings. */
export function WorkspaceSetup({
  variant = "card",
  defaultName = "",
  onCreate,
  children,
  style,
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
        {...props}
        data-variant={variant}
        data-status={status}
        data-uai-workspace={variant}
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
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...shells[variant],
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-workspace-layout="">{children}</div>
      </form>
    </Context.Provider>
  );
}

export function WorkspaceSetupHeader({ style, ...props }: ComponentProps<"header">) {
  return (
    <header
      {...props}
      data-uai-workspace-part="header"
      style={{ display: "grid", gap: 4, minWidth: 0, ...style }}
    />
  );
}

export function WorkspaceSetupTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useSetup("WorkspaceSetupTitle");
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: variant === "compact" ? 15 : 18,
        fontWeight: 600,
        lineHeight: variant === "compact" ? "20px" : "24px",
        letterSpacing: "-0.01em",
        ...style,
      }}
    />
  );
}

export function WorkspaceSetupDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }} />
  );
}

/** The main column: sections, errors, and actions. */
export function WorkspaceSetupMain({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useSetup("WorkspaceSetupMain");
  return (
    <div
      {...props}
      data-uai-workspace-part="main"
      style={{
        display: "grid",
        gap: variant === "compact" ? 20 : 24,
        alignContent: "start",
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function WorkspaceSetupSection({ style, ...props }: ComponentProps<"fieldset">) {
  const { variant, status } = useSetup("WorkspaceSetupSection");
  return (
    <fieldset
      {...props}
      disabled={status === "creating"}
      style={{
        display: "grid",
        gap: 12,
        minWidth: 0,
        margin: 0,
        padding: variant === "split" ? "18px 20px 20px" : 0,
        border: 0,
        borderRadius: variant === "split" ? 14 : 0,
        boxShadow: variant === "split" ? "inset 0 0 0 1px var(--uai-border)" : undefined,
        background: variant === "split" ? "var(--uai-surface)" : "transparent",
        ...style,
      }}
    />
  );
}

export function WorkspaceSetupSectionTitle({ style, ...props }: ComponentProps<"legend">) {
  return (
    <legend
      {...props}
      style={{
        float: "left",
        width: "100%",
        padding: 0,
        fontSize: 14,
        fontWeight: 500,
        lineHeight: "20px",
        ...style,
      }}
    />
  );
}

export function WorkspaceSetupSectionDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: "-8px 0 0",
        color: "var(--uai-muted)",
        fontSize: 12.5,
        textWrap: "pretty",
        ...style,
      }}
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

export function WorkspaceSetupInviteRow({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "flex", flexWrap: "wrap", gap: 8, minWidth: 0, ...style }} />
  );
}

export function WorkspaceSetupInviteInput({
  onKeyDown,
  style,
  ...props
}: ComponentProps<typeof FormFieldInput>) {
  const context = useSetup("WorkspaceSetupInviteInput");
  return (
    <FormFieldInput
      type="email"
      autoComplete="off"
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Enter" || event.key === ",") {
          event.preventDefault();
          context.addInvites();
        }
      }}
      style={{ flex: "1 1 200px", width: "auto", ...style }}
    />
  );
}

export function WorkspaceSetupInviteAdd({ onClick, style, ...props }: ComponentProps<"button">) {
  const context = useSetup("WorkspaceSetupInviteAdd");
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.addInvites();
      }}
      data-uai-workspace-button="secondary"
      style={{
        flex: "none",
        alignSelf: "center",
        height: 30,
        padding: "0 13px",
        border: 0,
        borderRadius: 999,
        font: "inherit",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
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
export function WorkspaceSetupInviteList({ children, style, ...props }: ComponentProps<"ul">) {
  const context = useSetup("WorkspaceSetupInviteList");
  if (context.invites.length === 0) {
    return <p style={{ margin: 0, color: "var(--uai-subtle)", fontSize: 12 }}>{children}</p>;
  }
  return (
    <ul
      aria-label="Pending invitations"
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        margin: 0,
        padding: 0,
        listStyle: "none",
        ...style,
      }}
    >
      {context.invites.map((email) => (
        <li
          key={email}
          data-uai-workspace-invite=""
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            minWidth: 0,
            maxWidth: "100%",
            height: 26,
            padding: "0 3px 0 9px",
            borderRadius: 6,
            background: "var(--uai-surface-raised)",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {email}
          </span>
          <button
            type="button"
            aria-label={`Remove ${email}`}
            onClick={() => context.removeInvite(email)}
            data-uai-workspace-remove=""
            style={{
              display: "grid",
              placeItems: "center",
              flex: "none",
              width: 20,
              height: 20,
              padding: 0,
              border: 0,
              borderRadius: 4,
              cursor: "pointer",
            }}
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
  style,
  ...props
}: WorkspaceSetupChoiceProps) {
  const { variant } = useSetup("WorkspaceSetupChoice");
  return (
    <label
      data-uai-workspace-choice=""
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        minWidth: 0,
        padding: variant === "compact" ? 10 : 12,
        borderRadius: variant === "compact" ? 8 : 10,
        cursor: "pointer",
        ...style,
      }}
    >
      <input
        {...props}
        type={type}
        style={{ flex: "none", margin: "2px 0 0", accentColor: "var(--uai-accent)" }}
      />
      <span style={{ display: "grid", gap: 2, minWidth: 0 }}>{children}</span>
    </label>
  );
}

export function WorkspaceSetupChoiceLabel({ style, ...props }: ComponentProps<"span">) {
  return <span {...props} style={{ fontWeight: 500, ...style }} />;
}

export function WorkspaceSetupChoiceDescription({ style, ...props }: ComponentProps<"span">) {
  return <span {...props} style={{ color: "var(--uai-muted)", fontSize: 12, ...style }} />;
}

/** A live summary of the workspace. Split shows it beside the form; others place it below. */
export function WorkspaceSetupSummary({ style, ...props }: ComponentProps<"aside">) {
  const { id, variant } = useSetup("WorkspaceSetupSummary");
  return (
    <aside
      aria-labelledby={`${id}-summary`}
      {...props}
      data-uai-workspace-part="summary"
      style={{
        display: "grid",
        gap: 8,
        minWidth: 0,
        padding: variant === "compact" ? 12 : 16,
        borderRadius: variant === "compact" ? 12 : 14,
        background: "var(--uai-surface-raised)",
        ...style,
      }}
    />
  );
}

export function WorkspaceSetupSummaryTitle({ style, ...props }: ComponentProps<"h3">) {
  const { id } = useSetup("WorkspaceSetupSummaryTitle");
  return (
    <h3
      {...props}
      id={`${id}-summary`}
      style={{ margin: 0, fontSize: 13, fontWeight: 500, ...style }}
    />
  );
}

/** Prints a live value: the name, the URL slug, or the number of invitations. */
export function WorkspaceSetupValue({
  field,
  children,
  style,
  ...props
}: ComponentProps<"span"> & { field: "name" | "slug" | "invites" }) {
  const context = useSetup("WorkspaceSetupValue");
  const value =
    field === "invites"
      ? `${context.invites.length} ${context.invites.length === 1 ? "person" : "people"}`
      : context[field].trim();
  return (
    <span
      {...props}
      style={{
        color: value ? undefined : "var(--uai-muted)",
        overflowWrap: "anywhere",
        ...style,
      }}
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
        <StatusBannerDescription style={{ color: "inherit" }}>
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

export function WorkspaceSetupActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 8,
        ...style,
      }}
    />
  );
}

export function WorkspaceSetupSubmit({
  pendingLabel = "Creating…",
  children,
  style,
  ...props
}: ComponentProps<"button"> & { pendingLabel?: ReactNode }) {
  const context = useSetup("WorkspaceSetupSubmit");
  const pending = context.status === "creating";
  return (
    <button
      type="submit"
      {...props}
      aria-busy={pending || undefined}
      disabled={context.status === "created"}
      data-uai-workspace-button="primary"
      style={{
        height: context.variant === "compact" ? 28 : 32,
        padding: context.variant === "compact" ? "0 12px" : "0 14px",
        border: 0,
        borderRadius: 999,
        font: "inherit",
        fontSize: context.variant === "compact" ? 12.5 : 13,
        fontWeight: 500,
        cursor: pending ? "progress" : "pointer",
        ...style,
      }}
    >
      {pending ? <span data-uai-workspace-shimmer="">{pendingLabel}</span> : children}
    </button>
  );
}
