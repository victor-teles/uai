"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext, useId, useState } from "react";

import { cn } from "@/lib/uai-utils";

export const INSTALLMENT_PICKER_VARIANTS = ["list", "tiles", "compact"] as const;

export type InstallmentPickerVariant = (typeof INSTALLMENT_PICKER_VARIANTS)[number];

export function formatBrl(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export type InstallmentPickerProps = Omit<
  ComponentProps<"fieldset">,
  "defaultValue" | "onChange"
> & {
  variant?: InstallmentPickerVariant;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Form field name for the native radio inputs. */
  name?: string;
};

type InstallmentPickerContextValue = {
  variant: InstallmentPickerVariant;
  name: string;
  value: string | undefined;
  disabled: boolean;
  select: (value: string) => void;
};

const InstallmentPickerContext = createContext<InstallmentPickerContextValue | null>(null);

function useInstallmentPicker(part: string) {
  const context = useContext(InstallmentPickerContext);
  if (!context) throw new Error(`${part} must be used within InstallmentPicker`);
  return context;
}

export function InstallmentPicker({
  variant = "list",
  value,
  defaultValue,
  onValueChange,
  name,
  disabled = false,
  children,
  className,
  ...props
}: InstallmentPickerProps) {
  const generatedName = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const current = value ?? internalValue;

  const select = (next: string) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <InstallmentPickerContext.Provider
      value={{ variant, name: name ?? generatedName, value: current, disabled, select }}
    >
      <fieldset
        data-slot="installment-picker"
        data-variant={variant}
        className={cn(
          "group/installments m-0 grid w-full min-w-0 border-0 p-0 text-foreground",
          disabled && "opacity-55",
          className,
        )}
        {...props}
        disabled={disabled}
      >
        {children}
      </fieldset>
    </InstallmentPickerContext.Provider>
  );
}

export type InstallmentPickerLegendProps = ComponentProps<"legend">;

export function InstallmentPickerLegend({
  children = "Parcelamento",
  className,
  ...props
}: InstallmentPickerLegendProps) {
  const context = useInstallmentPicker("InstallmentPickerLegend");
  return (
    <legend
      data-slot="installment-picker-legend"
      className={cn(
        "float-left w-full p-0 font-medium text-muted-foreground",
        context.variant === "compact"
          ? "mb-1 text-[11.5px] leading-4"
          : "mb-1.5 text-[12px] leading-4",
        className,
      )}
      {...props}
    >
      {children}
    </legend>
  );
}

const optionsVariants = cva("clear-both grid min-w-0", {
  variants: {
    variant: {
      list: "overflow-hidden rounded-[14px] border border-border bg-card *:not-first:border-t *:not-first:border-border",
      tiles: "@container/tiles grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-2",
      compact: "gap-0.5 rounded-xl border border-border bg-card p-0.5",
    },
  },
});

export type InstallmentPickerOptionsProps = ComponentProps<"div">;

export function InstallmentPickerOptions({ className, ...props }: InstallmentPickerOptionsProps) {
  const context = useInstallmentPicker("InstallmentPickerOptions");
  return (
    <div
      data-slot="installment-picker-options"
      className={cn(optionsVariants({ variant: context.variant }), className)}
      {...props}
    />
  );
}

const optionVariants = cva(
  "group/option relative flex min-w-0 cursor-pointer items-center transition-[background-color,box-shadow] duration-[120ms] ease-out has-checked:bg-accent has-disabled:cursor-not-allowed has-disabled:opacity-55 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-ring motion-reduce:transition-none",
  {
    variants: {
      variant: {
        list: "gap-3 px-3.5 py-3 hover:bg-accent/60",
        tiles:
          "flex-col items-start gap-1 rounded-xl bg-card p-3 shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--border-strong)] has-checked:shadow-[inset_0_0_0_1px_var(--foreground)]",
        compact: "gap-2.5 rounded-[10px] px-2.5 py-1.5 hover:bg-accent/60",
      },
    },
  },
);

export type InstallmentPickerOptionProps = Omit<ComponentProps<"label">, "htmlFor"> & {
  value: string;
  disabled?: boolean;
};

/** One choice, built on a native radio so arrow keys and forms work without scripting. */
export function InstallmentPickerOption({
  value,
  disabled = false,
  children,
  className,
  ...props
}: InstallmentPickerOptionProps) {
  const context = useInstallmentPicker("InstallmentPickerOption");
  const checked = context.value === value;
  return (
    <label
      data-slot="installment-picker-option"
      data-state={checked ? "checked" : "unchecked"}
      className={cn(optionVariants({ variant: context.variant }), className)}
      {...props}
    >
      <input
        type="radio"
        className="peer sr-only"
        name={context.name}
        value={value}
        checked={checked}
        disabled={context.disabled || disabled}
        onChange={() => context.select(value)}
      />
      <span
        aria-hidden="true"
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--border-strong)] transition-[background-color,box-shadow] duration-[140ms] ease-out-quint after:size-1.5 after:scale-0 after:rounded-full after:bg-primary-foreground after:transition-transform after:duration-[140ms] after:ease-out-quint peer-checked:bg-primary peer-checked:shadow-none peer-checked:after:scale-100 motion-reduce:transition-none motion-reduce:after:transition-none",
          context.variant === "tiles" && "absolute top-3 right-3",
          context.variant === "compact" && "size-3.5",
        )}
      />
      <span
        className={cn(
          "grid min-w-0 flex-1 items-baseline gap-x-2 gap-y-0.5",
          context.variant === "tiles"
            ? "w-full grid-cols-1 pr-6"
            : "grid-cols-[auto_minmax(0,1fr)_auto]",
        )}
      >
        {children}
      </span>
    </label>
  );
}

export type InstallmentPickerCountProps = ComponentProps<"span">;

/** The number of installments, such as "12x". */
export function InstallmentPickerCount({ className, ...props }: InstallmentPickerCountProps) {
  return (
    <span
      data-slot="installment-picker-count"
      className={cn(
        "font-medium text-foreground tabular-nums group-data-[variant=compact]/installments:text-[12.5px] group-data-[variant=list]/installments:min-w-7 group-data-[variant=list]/installments:text-[13px] group-data-[variant=tiles]/installments:text-[12px] group-data-[variant=tiles]/installments:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export type InstallmentPickerAmountProps = ComponentProps<"span">;

/** The amount of each installment. */
export function InstallmentPickerAmount({ className, ...props }: InstallmentPickerAmountProps) {
  return (
    <span
      data-slot="installment-picker-amount"
      className={cn(
        "min-w-0 truncate text-foreground tabular-nums group-data-[variant=compact]/installments:text-[12.5px] group-data-[variant=list]/installments:text-[13px] group-data-[variant=tiles]/installments:text-[17px] group-data-[variant=tiles]/installments:leading-6 group-data-[variant=tiles]/installments:font-semibold",
        className,
      )}
      {...props}
    />
  );
}

export type InstallmentPickerTermsProps = ComponentProps<"span"> & {
  /** Marks interest-free terms with the success tint. */
  interestFree?: boolean;
};

/** The interest terms or the final total, such as "sem juros" or "total R$ 574,80". */
export function InstallmentPickerTerms({
  interestFree = false,
  className,
  ...props
}: InstallmentPickerTermsProps) {
  return (
    <span
      data-slot="installment-picker-terms"
      data-interest-free={interestFree || undefined}
      className={cn(
        "justify-self-end text-[11.5px] leading-4 tabular-nums group-data-[variant=tiles]/installments:justify-self-start",
        interestFree
          ? "inline-flex h-5 items-center rounded-full bg-success/14 px-2 font-medium text-success"
          : "text-subtle-foreground",
        className,
      )}
      {...props}
    />
  );
}
