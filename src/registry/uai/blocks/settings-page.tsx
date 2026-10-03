"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext, useId } from "react";
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

type PageContext = { id: string; variant: SettingsPageVariant };
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

const dangerText = "text-[color-mix(in_oklab,var(--destructive)_75%,var(--foreground))]";
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

const settingsPageVariants = cva("grid min-w-0 content-start text-[13px]/[18px] text-foreground", {
  variants: {
    variant: {
      stacked: "gap-5",
      split: "gap-5",
      compact: "gap-3",
    },
  },
});

export function SettingsPage({ variant = "stacked", className, ...props }: SettingsPageProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
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

const dangerSurface =
  "border-[color-mix(in_oklab,var(--destructive)_20%,var(--border))] bg-[color-mix(in_oklab,var(--destructive)_5%,var(--card))]";

/** A group of related settings. `tone="danger"` marks destructive actions. */
export function SettingsPageSection({
  tone = "default",
  className,
  ...props
}: ComponentProps<"section"> & { tone?: "default" | "danger" }) {
  const { variant } = usePage("SettingsPageSection");
  const id = useId();
  const danger = tone === "danger";
  return (
    <Section.Provider value={{ id, tone }}>
      <section
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        data-slot="settings-page-section"
        className={cn(
          "min-w-0 border-solid",
          variant === "split"
            ? cn(
                "flex flex-wrap gap-x-8 gap-y-3",
                danger
                  ? cn("rounded-[14px] border px-5 py-4.5", dangerSurface)
                  : "rounded-none border-0 border-b border-border px-0 pt-1 pb-6",
              )
            : cn(
                "grid border",
                variant === "compact" ? "gap-3 rounded-xl p-3.5" : "gap-4 rounded-[14px] p-5",
                danger ? dangerSurface : "border-border bg-card",
              ),
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
        "grid min-w-0 content-start gap-1",
        variant === "split" && "flex-[1_1_200px]",
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
      className={cn(
        "m-0 text-sm/5 font-medium",
        section.tone === "danger" && dangerText,
        className,
      )}
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

export function SettingsPageSectionContent({ className, ...props }: ComponentProps<"div">) {
  const { variant } = usePage("SettingsPageSectionContent");
  return (
    <div
      data-slot="settings-page-section-content"
      className={cn(
        "grid min-w-0 content-start",
        variant === "compact" ? "gap-3" : "gap-4",
        variant === "split" && "flex-[2_1_320px]",
        className,
      )}
      {...props}
    />
  );
}

/** A Form Field sized for the page. Compose Form Field parts inside it. */
export function SettingsPageField(props: Omit<FormFieldProps, "variant">) {
  const context = usePage("SettingsPageField");
  return <FormField {...props} variant={fieldVariants[context.variant]} />;
}

/** Confirmation for a destructive setting. Compose Confirmation Dialog parts inside it. */
export function SettingsPageConfirm(props: Omit<ConfirmationDialogProps, "variant">) {
  const context = usePage("SettingsPageConfirm");
  return <ConfirmationDialog {...props} variant={dialogVariants[context.variant]} />;
}

/** Save state for the whole page. Renders the default message and actions when given no children. */
export function SettingsPageSaveBar({
  children,
  ...props
}: Omit<UnsavedChangesBarProps, "variant">) {
  const context = usePage("SettingsPageSaveBar");
  return (
    <UnsavedChangesBar {...props} variant={barVariants[context.variant]}>
      {children ?? (
        <>
          <UnsavedChangesBarMessage />
          <UnsavedChangesBarActions>
            <UnsavedChangesBarDiscard />
            <UnsavedChangesBarSave />
          </UnsavedChangesBarActions>
        </>
      )}
    </UnsavedChangesBar>
  );
}
