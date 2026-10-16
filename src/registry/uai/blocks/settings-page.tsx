"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type RefObject,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  ConfirmationDialog,
  type ConfirmationDialogProps,
  type ConfirmationDialogVariant,
} from "@/components/ui/uai/confirmation-dialog";
import {
  FormField,
  type FormFieldProps,
  type FormFieldVariant,
} from "@/components/ui/uai/form-field";
import {
  UnsavedChangesBar,
  UnsavedChangesBarActions,
  UnsavedChangesBarDiscard,
  UnsavedChangesBarMessage,
  type UnsavedChangesBarProps,
  UnsavedChangesBarSave,
  type UnsavedChangesBarVariant,
} from "@/components/ui/uai/unsaved-changes-bar";
import { cn } from "@/lib/uai-utils";

export const SETTINGS_PAGE_VARIANTS = ["stacked", "split", "compact"] as const;
export type SettingsPageVariant = (typeof SETTINGS_PAGE_VARIANTS)[number];
export type SettingsPageProps = ComponentProps<"section"> & { variant?: SettingsPageVariant };

type PageContext = {
  id: string;
  variant: SettingsPageVariant;
  rootRef: RefObject<HTMLElement | null>;
};
const Context = createContext<PageContext | null>(null);
function usePage(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within SettingsPage`);
  return context;
}
type SectionContext = { id: string; tone: "default" | "danger" };
const Section = createContext<SectionContext | null>(null);
function useSection(part: string) {
  const context = useContext(Section);
  if (!context) throw new Error(`${part} must be used within SettingsPageSection`);
  return context;
}

// `text-[color-mix(…destructive 75%, foreground)]` and `primaryInk` stand in for
// `--destructive-ink` and `--primary-ink` until the ink tokens land (phase 2, item 2).
const primaryInk = "text-[color-mix(in_oklab,var(--primary)_80%,var(--foreground))]";
const fieldVariants: Record<SettingsPageVariant, FormFieldVariant> = {
  stacked: "outlined",
  split: "outlined",
  compact: "compact",
};
const barVariants: Record<SettingsPageVariant, UnsavedChangesBarVariant> = {
  stacked: "floating",
  split: "bar",
  compact: "compact",
};
const dialogVariants: Record<SettingsPageVariant, ConfirmationDialogVariant> = {
  stacked: "centered",
  split: "centered",
  compact: "compact",
};

const settingsPageVariants = cva(
  "@container grid w-full max-w-[820px] min-w-0 content-start text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        stacked: "gap-4.5",
        split: "gap-6",
        compact: "gap-3.5",
      },
    },
  },
);

export function SettingsPage({ variant = "stacked", className, ...props }: SettingsPageProps) {
  const id = useId();
  const rootRef = useRef<HTMLElement>(null);
  return (
    <Context.Provider value={{ id, variant, rootRef }}>
      <section
        ref={rootRef}
        aria-labelledby={`${id}-title`}
        data-slot="settings-page"
        data-variant={variant}
        className={cn(settingsPageVariants({ variant }), className)}
        {...props}
      />
    </Context.Provider>
  );
}

export function SettingsPageHeader({ className, ...props }: ComponentProps<"div">) {
  usePage("SettingsPageHeader");
  return (
    <div
      data-slot="settings-page-header"
      className={cn("grid min-w-0 gap-1", className)}
      {...props}
    />
  );
}

export function SettingsPageTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = usePage("SettingsPageTitle");
  return (
    <h2
      data-slot="settings-page-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.01em]",
        context.variant === "compact" ? "text-[15px]/5" : "text-lg/6",
        className,
      )}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

export function SettingsPageDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="settings-page-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/** A group of related settings. `tone="danger"` marks destructive actions. */
export function SettingsPageSection({
  tone = "default",
  className,
  ...props
}: ComponentProps<"section"> & { tone?: "default" | "danger" }) {
  const { variant } = usePage("SettingsPageSection");
  const id = useId();
  return (
    <Section.Provider value={{ id, tone }}>
      <section
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        data-slot="settings-page-section"
        className={cn(
          "grid min-w-0 content-start",
          variant === "split"
            ? "items-start gap-x-7 gap-y-2.5 @[600px]:grid-cols-[220px_minmax(0,1fr)]"
            : "gap-2.5",
          className,
        )}
        {...props}
        data-tone={tone}
      />
    </Section.Provider>
  );
}

export function SettingsPageSectionHeader({ className, ...props }: ComponentProps<"div">) {
  const { variant } = usePage("SettingsPageSectionHeader");
  useSection("SettingsPageSectionHeader");
  return (
    <div
      data-slot="settings-page-section-header"
      className={cn(
        "min-w-0",
        variant === "split"
          ? "grid content-start gap-1 @[600px]:pt-0.5"
          : "flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5",
        className,
      )}
      {...props}
    />
  );
}

export function SettingsPageSectionTitle({ className, ...props }: ComponentProps<"h3">) {
  const section = useSection("SettingsPageSectionTitle");
  return (
    <h3
      data-slot="settings-page-section-title"
      className={cn("m-0 text-sm/5 font-medium", className)}
      {...props}
      id={`${section.id}-title`}
    />
  );
}

export function SettingsPageSectionDescription({ className, ...props }: ComponentProps<"p">) {
  const section = useSection("SettingsPageSectionDescription");
  return (
    <p
      data-slot="settings-page-section-description"
      className={cn("m-0 text-[12.5px]/[18px] text-pretty text-muted-foreground", className)}
      {...props}
      id={`${section.id}-description`}
    />
  );
}

const rowPadding: Record<SettingsPageVariant, string> = {
  stacked: "px-4 py-3.5",
  split: "px-4 py-3.5",
  compact: "px-3 py-2.5",
};

/**
 * The section card. Each child is a row, separated by hairlines. In a danger section the
 * card holds one row: the consequence (a `<strong>` and a `<p>`) and the confirm trigger.
 */
export function SettingsPageSectionContent({ className, ...props }: ComponentProps<"div">) {
  const { variant } = usePage("SettingsPageSectionContent");
  const section = useSection("SettingsPageSectionContent");
  const danger = section.tone === "danger";
  return (
    <div
      data-slot="settings-page-section-content"
      className={cn(
        "min-w-0 bg-card text-card-foreground shadow-[0_0_0_1px_var(--border)]",
        variant === "compact" ? "rounded-xl" : "rounded-[14px]",
        danger
          ? cn(
              "flex flex-wrap items-center gap-x-4 gap-y-3",
              rowPadding[variant],
              "[&>div:first-child]:min-w-0 [&>div:first-child]:flex-[1_1_240px] [&_strong]:font-medium",
              "[&_p]:m-0 [&_p]:mt-0.5 [&_p]:text-[12.5px]/[18px] [&_p]:text-pretty [&_p]:text-muted-foreground",
              // Only the button carries danger: a 12% tint with ink text, 18% on hover.
              "[&_[data-slot=confirmation-dialog-trigger]]:h-7.5 [&_[data-slot=confirmation-dialog-trigger]]:px-3.5 [&_[data-slot=confirmation-dialog-trigger]]:text-[12.5px]/[18px] [&_[data-slot=confirmation-dialog-trigger]]:text-[color-mix(in_oklab,var(--destructive)_75%,var(--foreground))] [&_[data-slot=confirmation-dialog-trigger]]:hover:text-[color-mix(in_oklab,var(--destructive)_75%,var(--foreground))]",
            )
          : "grid divide-y divide-solid divide-border",
        className,
      )}
      {...props}
      data-tone={section.tone}
    />
  );
}

type FieldContext = { edited: boolean };
const Field = createContext<FieldContext | null>(null);

const fieldRow = cn(
  "min-w-0 gap-1.5",
  // Required is the default, so only optional fields carry a marker.
  "[&_[data-slot=form-field-label]]:flex [&_[data-slot=form-field-label]]:items-center [&_[data-slot=form-field-label]]:gap-2",
  "[&_[data-slot=form-field-label]>span:not([data-slot])]:hidden",
  // The error names the fix and carries its icon.
  "[&_[data-slot=form-field-error]]:flex [&_[data-slot=form-field-error]]:items-center [&_[data-slot=form-field-error]]:gap-1.5 [&_[data-slot=form-field-error]_svg]:size-3.25 [&_[data-slot=form-field-error]_svg]:shrink-0",
  // A disabled row dims as a whole; the hint says why.
  "has-[[data-slot=form-field-input]:disabled]:cursor-not-allowed has-[[data-slot=form-field-input]:disabled]:opacity-55",
  "[&_[data-slot=form-field-input]]:disabled:opacity-100",
  // Pressing Save with an invalid field shakes it once.
  "[&_[data-slot=form-field-input]]:data-shake:motion-safe:animate-shake",
);
const fieldInput: Record<SettingsPageVariant, string> = {
  stacked: cn(
    "[&_[data-slot=form-field-input]]:h-9 [&_[data-slot=form-field-input]]:border-transparent [&_[data-slot=form-field-input]]:px-2.75 [&_[data-slot=form-field-input]]:py-0",
    "[&_[data-slot=form-field-input]]:focus-visible:border-border-strong [&_[data-slot=form-field-input]]:focus-visible:ring-primary/18",
    "[&_[data-slot=form-field-input]]:aria-invalid:border-destructive",
  ),
  split: cn(
    "[&_[data-slot=form-field-input]]:h-9 [&_[data-slot=form-field-input]]:border-transparent [&_[data-slot=form-field-input]]:px-2.75 [&_[data-slot=form-field-input]]:py-0",
    "[&_[data-slot=form-field-input]]:focus-visible:border-border-strong [&_[data-slot=form-field-input]]:focus-visible:ring-primary/18",
    "[&_[data-slot=form-field-input]]:aria-invalid:border-destructive",
  ),
  compact: "[&_[data-slot=form-field-input]]:aria-invalid:border-destructive",
};
const optionalMarker =
  "[&_[data-slot=form-field-label]]:after:text-xs [&_[data-slot=form-field-label]]:after:font-normal [&_[data-slot=form-field-label]]:after:text-subtle-foreground [&_[data-slot=form-field-label]]:after:content-['(optional)']";

/**
 * A Form Field sized for the page, as one row of the section card. Compose Form Field parts
 * inside it. `edited` shows the Edited marker (`SettingsPageFieldEdited`) while the value
 * differs from the saved one.
 */
export function SettingsPageField({
  edited = false,
  className,
  ...props
}: Omit<FormFieldProps, "variant"> & { edited?: boolean }) {
  const context = usePage("SettingsPageField");
  return (
    <Field.Provider value={{ edited }}>
      <FormField
        {...props}
        data-edited={edited || undefined}
        className={cn(
          fieldRow,
          rowPadding[context.variant],
          fieldInput[context.variant],
          !props.required && optionalMarker,
          className,
        )}
        variant={fieldVariants[context.variant]}
      />
    </Field.Provider>
  );
}

/** "Edited" marker for a field label. Fades in while the field's value differs from the saved one. */
export function SettingsPageFieldEdited({
  children = "Edited",
  className,
  ...props
}: ComponentProps<"span">) {
  const field = useContext(Field);
  if (!field) throw new Error("SettingsPageFieldEdited must be used within SettingsPageField");
  return (
    <span
      data-slot="settings-page-field-edited"
      data-state={field.edited ? "on" : "off"}
      aria-hidden={!field.edited || undefined}
      className={cn(
        "inline-flex items-center gap-1.25 text-[11.5px]/4 font-normal",
        primaryInk,
        "opacity-0 transition-opacity duration-160 ease-out data-[state=on]:opacity-100 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary" />
      {children}
    </span>
  );
}

/** Confirmation for a destructive setting. Compose Confirmation Dialog parts inside it. */
export function SettingsPageConfirm(props: Omit<ConfirmationDialogProps, "variant">) {
  const context = usePage("SettingsPageConfirm");
  return <ConfirmationDialog {...props} variant={dialogVariants[context.variant]} />;
}

const barClass: Record<SettingsPageVariant, string> = {
  stacked:
    "h-11 w-fit max-w-full justify-self-center gap-2 rounded-full bg-popover py-0 pr-1.5 pl-4 [&_[data-slot=unsaved-changes-bar-message]]:flex-none",
  split: "",
  compact: "",
};

function shake(element: HTMLElement) {
  element.removeAttribute("data-shake");
  void element.offsetWidth;
  element.setAttribute("data-shake", "");
  element.addEventListener("animationend", () => element.removeAttribute("data-shake"), {
    once: true,
  });
}

/**
 * Save state for the whole page. Renders the default message and actions when given no
 * children. Save stays enabled while a field is invalid: pressing it focuses and shakes the
 * first invalid field instead of calling `onSave`.
 */
export function SettingsPageSaveBar({
  children,
  onSave,
  className,
  ...props
}: Omit<UnsavedChangesBarProps, "variant">) {
  const context = usePage("SettingsPageSaveBar");
  const [blocked, setBlocked] = useState(0);
  useEffect(() => {
    if (!blocked) return;
    const invalid = context.rootRef.current?.querySelectorAll('[aria-invalid="true"]').length ?? 0;
    if (invalid !== blocked) setBlocked(invalid);
  });
  function save() {
    const invalid = Array.from(
      context.rootRef.current?.querySelectorAll<HTMLElement>('[aria-invalid="true"]') ?? [],
    );
    setBlocked(invalid.length);
    const first = invalid[0];
    if (!first) return onSave?.();
    first.focus();
    shake(first);
  }
  return (
    <UnsavedChangesBar
      {...props}
      onSave={save}
      data-invalid={blocked ? "" : undefined}
      className={cn(
        barClass[context.variant],
        "[&_[data-slot=unsaved-changes-bar-message]]:font-normal",
        "[&:not([data-invalid])_[data-slot=unsaved-changes-bar-message][role=status]]:text-muted-foreground",
        "[&[data-invalid]_[data-slot=unsaved-changes-bar-message]]:text-[color-mix(in_oklab,var(--destructive)_75%,var(--foreground))]",
        className,
      )}
      variant={barVariants[context.variant]}
    >
      {children ?? (
        <>
          <UnsavedChangesBarMessage>
            {blocked ? `Fix ${blocked} ${blocked === 1 ? "field" : "fields"} to save` : undefined}
          </UnsavedChangesBarMessage>
          <UnsavedChangesBarActions>
            <UnsavedChangesBarDiscard />
            <UnsavedChangesBarSave />
          </UnsavedChangesBarActions>
        </>
      )}
    </UnsavedChangesBar>
  );
}
