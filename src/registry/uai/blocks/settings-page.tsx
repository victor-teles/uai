"use client";

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

const dangerText = "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))";
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

export function SettingsPage({ variant = "stacked", style, ...props }: SettingsPageProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          alignContent: "start",
          gap: variant === "compact" ? 12 : 20,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      />
    </Context.Provider>
  );
}

export function SettingsPageHeader({ style, ...props }: ComponentProps<"div">) {
  usePage("SettingsPageHeader");
  return <div {...props} style={{ display: "grid", gap: 4, minWidth: 0, ...style }} />;
}

export function SettingsPageTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = usePage("SettingsPageTitle");
  const compact = context.variant === "compact";
  return (
    <h2
      {...props}
      id={`${context.id}-title`}
      style={{
        margin: 0,
        fontSize: compact ? 15 : 18,
        lineHeight: compact ? "20px" : "24px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        ...style,
      }}
    />
  );
}

export function SettingsPageDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }} />
  );
}

/** A group of related settings. `tone="danger"` marks destructive actions. */
export function SettingsPageSection({
  tone = "default",
  style,
  ...props
}: ComponentProps<"section"> & { tone?: "default" | "danger" }) {
  const { variant } = usePage("SettingsPageSection");
  const id = useId();
  const danger = tone === "danger";
  const borderColor = danger
    ? "color-mix(in oklab, var(--uai-danger) 20%, var(--uai-border))"
    : "var(--uai-border)";
  const background = danger
    ? "color-mix(in oklab, var(--uai-danger) 5%, var(--uai-surface))"
    : "var(--uai-surface)";
  return (
    <Section.Provider value={{ id, tone }}>
      <section
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        {...props}
        data-tone={tone}
        style={
          variant === "split"
            ? {
                display: "flex",
                flexWrap: "wrap",
                gap: "12px 32px",
                minWidth: 0,
                padding: danger ? "18px 20px" : "4px 0 24px",
                borderStyle: "solid",
                borderWidth: danger ? 1 : "0 0 1px",
                borderColor,
                borderRadius: danger ? 14 : 0,
                background: danger ? background : undefined,
                ...style,
              }
            : {
                display: "grid",
                gap: variant === "compact" ? 12 : 16,
                minWidth: 0,
                padding: variant === "compact" ? 14 : 20,
                borderStyle: "solid",
                borderWidth: 1,
                borderColor,
                borderRadius: variant === "compact" ? 12 : 14,
                background,
                ...style,
              }
        }
      />
    </Section.Provider>
  );
}

export function SettingsPageSectionHeader({ style, ...props }: ComponentProps<"div">) {
  const { variant } = usePage("SettingsPageSectionHeader");
  useSection("SettingsPageSectionHeader");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: 4,
        flex: variant === "split" ? "1 1 200px" : undefined,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function SettingsPageSectionTitle({ style, ...props }: ComponentProps<"h3">) {
  const section = useSection("SettingsPageSectionTitle");
  return (
    <h3
      {...props}
      id={`${section.id}-title`}
      style={{
        margin: 0,
        fontSize: 14,
        lineHeight: "20px",
        fontWeight: 500,
        color: section.tone === "danger" ? dangerText : undefined,
        ...style,
      }}
    />
  );
}

export function SettingsPageSectionDescription({ style, ...props }: ComponentProps<"p">) {
  const section = useSection("SettingsPageSectionDescription");
  return (
    <p
      {...props}
      id={`${section.id}-description`}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: 12.5,
        lineHeight: "18px",
        textWrap: "pretty",
        ...style,
      }}
    />
  );
}

export function SettingsPageSectionContent({ style, ...props }: ComponentProps<"div">) {
  const { variant } = usePage("SettingsPageSectionContent");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: variant === "compact" ? 12 : 16,
        flex: variant === "split" ? "2 1 320px" : undefined,
        minWidth: 0,
        ...style,
      }}
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
