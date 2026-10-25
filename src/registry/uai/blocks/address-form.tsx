"use client";

import { cva } from "class-variance-authority";
import { CircleCheck, Sparkle } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CepField,
  CepFieldControl,
  CepFieldInput,
  CepFieldLabel,
  CepFieldLookup,
  CepFieldMessage,
  type CepFieldStatus,
  formatCep,
  normalizeCep,
} from "@/components/ui/uai/cep-field";
import {
  FormField,
  FormFieldDescription,
  FormFieldError,
  FormFieldInput,
  FormFieldLabel,
} from "@/components/ui/uai/form-field";
import { cn } from "@/lib/uai-utils";

export const ADDRESS_FORM_VARIANTS = ["stacked", "split", "compact"] as const;
export const ADDRESS_FORM_LOOKUP_STATUSES = [
  "idle",
  "looking-up",
  "found",
  "partial",
  "not-found",
  "error",
] as const;

export type AddressFormVariant = (typeof ADDRESS_FORM_VARIANTS)[number];
export type AddressFormLookupStatus = (typeof ADDRESS_FORM_LOOKUP_STATUSES)[number];

/** The 27 federative units, in the order of their codes' alphabet. */
export const BRAZIL_STATES = [
  ["AC", "Acre"],
  ["AL", "Alagoas"],
  ["AP", "Amapá"],
  ["AM", "Amazonas"],
  ["BA", "Bahia"],
  ["CE", "Ceará"],
  ["DF", "Distrito Federal"],
  ["ES", "Espírito Santo"],
  ["GO", "Goiás"],
  ["MA", "Maranhão"],
  ["MT", "Mato Grosso"],
  ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"],
  ["PA", "Pará"],
  ["PB", "Paraíba"],
  ["PR", "Paraná"],
  ["PE", "Pernambuco"],
  ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"],
  ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"],
  ["RR", "Roraima"],
  ["SC", "Santa Catarina"],
  ["SP", "São Paulo"],
  ["SE", "Sergipe"],
  ["TO", "Tocantins"],
] as const;

export type Address = {
  /** Unmasked CEP digits. */
  cep: string;
  street: string;
  number: string;
  /** The "Sem número" checkbox. */
  noNumber: boolean;
  complement: string;
  district: string;
  city: string;
  /** Two-letter UF code. */
  state: string;
};

/** What the consumer's CEP lookup resolved. Missing fields stay for the person to fill. */
export type AddressLookupResult = Partial<Pick<Address, "street" | "district" | "city" | "state">>;

export const EMPTY_ADDRESS: Address = {
  cep: "",
  street: "",
  number: "",
  noNumber: false,
  complement: "",
  district: "",
  city: "",
  state: "",
};

type ResolvableField = "street" | "district" | "city" | "state";
type RequiredField = "street" | "number" | "city" | "state";

/** The cascade order: Rua → Bairro → Cidade → UF. */
const RESOLVABLE_FIELDS: readonly ResolvableField[] = ["street", "district", "city", "state"];

/** Fields the person still has to fill: Número unless "Sem número" is checked, Rua, Cidade and UF. */
export function getMissingAddressFields(address: Address): RequiredField[] {
  const missing: RequiredField[] = [];
  if (!address.street.trim()) missing.push("street");
  if (!address.noNumber && !address.number.trim()) missing.push("number");
  if (!address.city.trim()) missing.push("city");
  if (!address.state) missing.push("state");
  return missing;
}

/**
 * Cascade timing: fields fill 40ms apart (the S1 stagger cap; the step is written inline in the
 * cascade as `index * 40` so the motion lint checks it), and the wash settles 120ms after each.
 */
const WASH_SETTLE_MS = 120;
const FOCUS_AFTER_MS = 250;

/**
 * Phases of a field the lookup filled: `enter` holds the value invisible for a frame, `wash`
 * fades it in on the primary wash, and `settled` eases down to the resting 5% marker.
 */
type FillPhase = "enter" | "wash" | "settled";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function lookupCepStatus(status: AddressFormLookupStatus): CepFieldStatus {
  if (status === "looking-up") return "loading";
  if (status === "found" || status === "partial") return "found";
  return status;
}

type AddressFormContextValue = {
  variant: AddressFormVariant;
  address: Address;
  status: AddressFormLookupStatus;
  result: AddressLookupResult | null | undefined;
  disabled: boolean;
  fills: Partial<Record<ResolvableField, FillPhase>>;
  showErrors: boolean;
  missing: readonly RequiredField[];
  titleId: string;
  descriptionId: string;
  setField: <Key extends keyof Address>(field: Key, value: Address[Key]) => void;
  setCep: (cep: string) => void;
  lookup: (cep: string) => void;
  cepRef: RefObject<HTMLDivElement | null>;
  registerInput: (field: string, element: HTMLElement | null) => void;
};

const AddressFormContext = createContext<AddressFormContextValue | null>(null);

function useAddressForm(name: string) {
  const context = useContext(AddressFormContext);
  if (!context) throw new Error(`${name} must be used within AddressForm`);
  return context;
}

const addressFormVariants = cva("@container w-full min-w-0 text-foreground", {
  variants: {
    variant: {
      stacked: "max-w-[440px]",
      split: "",
      compact: "max-w-[340px]",
    },
  },
});

const addressFormSurfaceVariants = cva(
  "m-0 grid min-w-0 border border-border bg-card text-[13px] leading-[18px]",
  {
    variants: {
      variant: {
        stacked: "gap-4 rounded-[14px] p-5",
        split: "gap-4 rounded-[14px] p-5 @[720px]:grid-cols-[minmax(0,1fr)_260px] @[720px]:gap-x-8",
        compact: "gap-3 rounded-[12px] p-3.5",
      },
    },
  },
);

export type AddressFormProps = Omit<
  ComponentProps<"fieldset">,
  "defaultValue" | "onChange" | "disabled"
> & {
  variant?: AddressFormVariant;
  value?: Address;
  defaultValue?: Partial<Address>;
  onValueChange?: (address: Address) => void;
  /** Lookup state owned by the application that resolves the CEP. */
  lookupStatus?: AddressFormLookupStatus;
  /** The resolved fields. A new object with `found` or `partial` starts the cascade. */
  lookupResult?: AddressLookupResult | null;
  /** Runs once per complete CEP, and again on Enter or Buscar. Call your CEP API here. */
  onLookup?: (cep: string) => void;
  disabled?: boolean;
};

/**
 * A Brazilian address group that nests inside your checkout `<form>`. It never fetches:
 * resolve the CEP in `onLookup`, then pass `lookupStatus` and `lookupResult`.
 */
export function AddressForm({
  variant = "stacked",
  value,
  defaultValue,
  onValueChange,
  lookupStatus = "idle",
  lookupResult,
  onLookup,
  disabled = false,
  className,
  children,
  ...props
}: AddressFormProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [internal, setInternal] = useState<Address>(() => ({ ...EMPTY_ADDRESS, ...defaultValue }));
  const address = value ?? internal;
  const latest = useRef(address);
  latest.current = address;

  // A status describes the CEP it was looked up for; once the CEP changes, it no longer applies.
  const [lookedUpCep, setLookedUpCep] = useState(() =>
    lookupStatus === "idle" ? null : normalizeCep(address.cep),
  );
  const status: AddressFormLookupStatus =
    lookedUpCep === normalizeCep(address.cep) ? lookupStatus : "idle";

  const [fills, setFills] = useState<Partial<Record<ResolvableField, FillPhase>>>({});
  const edited = useRef(new Set<ResolvableField>());
  const [showErrors, setShowErrors] = useState(false);
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const cepRef = useRef<HTMLDivElement>(null);
  const inputs = useRef(new Map<string, HTMLElement>());
  const timers = useRef<number[]>([]);
  const focusTimer = useRef<number | undefined>(undefined);
  const focusWasInCep = useRef(false);
  const appliedResult = useRef<AddressLookupResult | null | undefined>(undefined);

  const commit = useCallback(
    (next: Address) => {
      latest.current = next;
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [value, onValueChange],
  );

  const commitRef = useRef(commit);
  commitRef.current = commit;
  const handledStatus = useRef<string | null>(null);

  const clearTimers = useCallback(() => {
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current = [];
    window.clearTimeout(focusTimer.current);
  }, []);

  /** Typing anywhere in the block cancels a pending focus move: the person has moved on. */
  const cancelFocusMove = () => window.clearTimeout(focusTimer.current);

  useEffect(() => clearTimers, [clearTimers]);

  const setField = <Key extends keyof Address>(field: Key, next: Address[Key]) => {
    cancelFocusMove();
    if ((RESOLVABLE_FIELDS as readonly string[]).includes(field)) {
      const resolvable = field as ResolvableField;
      edited.current.add(resolvable);
      setFills(({ [resolvable]: _dropped, ...rest }) => rest);
    }
    commit({ ...latest.current, [field]: next });
  };

  const setCep = (cep: string) => {
    cancelFocusMove();
    commit({ ...latest.current, cep });
  };

  const lookup = (cep: string) => {
    const active = document.activeElement;
    focusWasInCep.current = Boolean(cepRef.current?.contains(active));
    setLookedUpCep(cep);
    onLookup?.(cep);
  };

  /** Moves focus only while it is still in the CEP field; never steals it from elsewhere. */
  const moveFocus = useCallback((target: RequiredField | "complement") => {
    const active = document.activeElement;
    const inCep = Boolean(cepRef.current?.contains(active));
    const lost = (!active || active === document.body) && focusWasInCep.current;
    if (!inCep && !lost) return;
    const element = inputs.current.get(target);
    if (element && !(element as HTMLInputElement).disabled) element.focus();
  }, []);

  // Runs the cascade, the markers and the focus move when a new lookup result arrives.
  useEffect(() => {
    const commit = commitRef.current;
    const key = `${status}:${lookedUpCep}`;
    const fresh = handledStatus.current !== key;
    handledStatus.current = key;
    if (status === "looking-up") {
      appliedResult.current = undefined;
      return;
    }
    if (status === "not-found") {
      if (!fresh) return;
      clearTimers();
      // Fields the CEP filled are cleared; anything typed by hand stays.
      const cleared = { ...latest.current };
      for (const field of RESOLVABLE_FIELDS) if (!edited.current.has(field)) cleared[field] = "";
      setFills({});
      commit(cleared);
      moveFocus("street");
      return;
    }
    if (status !== "found" && status !== "partial") return;
    if (!lookupResult || appliedResult.current === lookupResult) return;
    appliedResult.current = lookupResult;
    clearTimers();

    const reduced = prefersReducedMotion();
    const start = { ...latest.current };
    const queue: [ResolvableField, string][] = [];
    for (const field of RESOLVABLE_FIELDS) {
      // Fields the person typed into keep their text, unless they left them empty.
      if (edited.current.has(field) && start[field].trim()) continue;
      edited.current.delete(field);
      const next = lookupResult[field]?.trim() ?? "";
      if (next) queue.push([field, next]);
      else start[field] = "";
    }
    setFills({});

    if (reduced) {
      for (const [field, next] of queue) start[field] = next;
      commit(start);
      setFills(Object.fromEntries(queue.map(([field]) => [field, "settled"])));
    } else {
      commit(start);
      queue.forEach(([field, next], index) => {
        // Stagger step: keep it at or under 40ms (S1). premium-lint reads this delay.
        const delay = index * 40;
        const schedule = (ms: number, run: () => void) =>
          timers.current.push(window.setTimeout(run, ms));
        schedule(delay, () => {
          commit({ ...latest.current, [field]: next });
          setFills((current) => ({ ...current, [field]: "enter" }));
        });
        schedule(delay + 16, () => setFills((current) => ({ ...current, [field]: "wash" })));
        schedule(delay + WASH_SETTLE_MS, () =>
          setFills((current) => ({ ...current, [field]: "settled" })),
        );
      });
    }

    const target =
      status === "partial" || !lookupResult.street?.trim()
        ? "street"
        : latest.current.noNumber
          ? "complement"
          : "number";
    if (reduced) moveFocus(target);
    else focusTimer.current = window.setTimeout(() => moveFocus(target), FOCUS_AFTER_MS);
  }, [status, lookedUpCep, lookupResult, clearTimers, moveFocus]);

  // Native constraint validation: the consumer's form won't submit while a required field is
  // missing, and the first `invalid` event shows the inline errors instead of browser bubbles.
  useEffect(() => {
    const fieldset = fieldsetRef.current;
    if (!fieldset) return;
    let focused = false;
    const onInvalid = (event: Event) => {
      if (!(event.target instanceof HTMLElement) || !fieldset.contains(event.target)) return;
      event.preventDefault();
      setShowErrors(true);
      if (focused) return;
      focused = true;
      // Every invalid control fires in the same task; only the first one takes focus.
      window.setTimeout(() => {
        focused = false;
      });
      const field = event.target.dataset.addressField;
      (field ? inputs.current.get(field) : event.target)?.focus();
    };
    // A press or key in the block means the person has moved on; drop a pending focus move.
    const cancel = () => window.clearTimeout(focusTimer.current);
    fieldset.addEventListener("invalid", onInvalid, true);
    fieldset.addEventListener("pointerdown", cancel, true);
    fieldset.addEventListener("keydown", cancel, true);
    return () => {
      fieldset.removeEventListener("invalid", onInvalid, true);
      fieldset.removeEventListener("pointerdown", cancel, true);
      fieldset.removeEventListener("keydown", cancel, true);
    };
  }, []);

  const registerInput = useCallback((field: string, element: HTMLElement | null) => {
    if (element) inputs.current.set(field, element);
    else inputs.current.delete(field);
  }, []);

  return (
    <AddressFormContext.Provider
      value={{
        variant,
        address,
        status,
        result: lookupResult,
        disabled,
        fills,
        showErrors,
        missing: getMissingAddressFields(address),
        titleId,
        descriptionId,
        setField,
        setCep,
        lookup,
        cepRef,
        registerInput,
      }}
    >
      <div
        data-slot="address-form"
        data-variant={variant}
        data-status={status}
        className={addressFormVariants({ variant })}
      >
        <fieldset
          data-slot="address-form-fieldset"
          className={cn(addressFormSurfaceVariants({ variant }), className)}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          {...props}
          ref={fieldsetRef}
          disabled={disabled}
        >
          {children}
        </fieldset>
      </div>
    </AddressFormContext.Provider>
  );
}

export type AddressFormHeaderProps = ComponentProps<"legend">;

/** The group's legend. Defaults to the title and description; compose your own parts inside. */
export function AddressFormHeader({ children, className, ...props }: AddressFormHeaderProps) {
  const context = useAddressForm("AddressFormHeader");
  return (
    <legend
      data-slot="address-form-header"
      className={cn(
        "float-left grid w-full min-w-0 gap-0.5 p-0",
        context.variant === "split" && "@[720px]:col-start-1",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <AddressFormTitle />
          <AddressFormDescription />
        </>
      )}
    </legend>
  );
}

export type AddressFormTitleProps = ComponentProps<"span">;

export function AddressFormTitle({
  children = "Endereço de entrega",
  className,
  ...props
}: AddressFormTitleProps) {
  const context = useAddressForm("AddressFormTitle");
  return (
    <span
      data-slot="address-form-title"
      className={cn(
        "block font-semibold text-foreground",
        context.variant === "compact" ? "text-[13px] leading-[18px]" : "text-[14px] leading-5",
        className,
      )}
      {...props}
      id={context.titleId}
    >
      {children}
    </span>
  );
}

export type AddressFormDescriptionProps = ComponentProps<"span">;

export function AddressFormDescription({
  children = "Comece pelo CEP. A gente completa o resto.",
  className,
  ...props
}: AddressFormDescriptionProps) {
  const context = useAddressForm("AddressFormDescription");
  return (
    <span
      data-slot="address-form-description"
      className={cn(
        "block text-muted-foreground",
        context.variant === "compact" ? "text-[12px] leading-4" : "text-[12.5px] leading-[18px]",
        className,
      )}
      {...props}
      id={context.descriptionId}
    >
      {children}
    </span>
  );
}

export type AddressFormFieldsProps = ComponentProps<"div">;

/** The field grid: CEP; Rua; Número + Complemento; Bairro; Cidade + UF. */
export function AddressFormFields({ className, ...props }: AddressFormFieldsProps) {
  const context = useAddressForm("AddressFormFields");
  return (
    <div
      data-slot="address-form-fields"
      className={cn(
        "grid min-w-0 items-start",
        context.variant === "compact"
          ? "grid-cols-[96px_minmax(0,1fr)_76px] gap-2"
          : "grid-cols-[120px_minmax(0,1fr)_76px] gap-x-2.5 gap-y-3",
        context.variant === "split" && "@[720px]:col-start-1",
        className,
      )}
      {...props}
    />
  );
}

const defaultMessages = {
  "looking-up": "Buscando endereço…",
  found: "Endereço encontrado. Falta só o número.",
  partial: "Encontramos a cidade. Preencha a rua e o bairro.",
  "not-found": "Não achamos esse CEP. Preencha o endereço abaixo.",
  error: "Não deu para buscar agora. Preencha o endereço abaixo ou tente de novo.",
} satisfies Partial<Record<AddressFormLookupStatus, string>>;

export type AddressFormCepProps = Omit<ComponentProps<"div">, "children"> & {
  /** Where "Não sei meu CEP" points, such as the Correios search. Omit to hide the link. */
  helpHref?: string;
  helpLabel?: ReactNode;
  label?: ReactNode;
  /** Replaces the default lookup messages. */
  messages?: Partial<Record<keyof typeof defaultMessages, ReactNode>>;
  /** The screen-reader announcement once the address is found. */
  foundAnnouncement?: (result: AddressLookupResult) => string;
};

function defaultFoundAnnouncement(result: AddressLookupResult) {
  const parts = [result.street, result.district, result.city, result.state].filter(Boolean);
  return `Endereço encontrado: ${parts.join(", ")}. Informe o número.`;
}

/** The CEP field, wired to the lookup, with the polite status that announces every result. */
export function AddressFormCep({
  helpHref,
  helpLabel = "Não sei meu CEP",
  label = "CEP",
  messages,
  foundAnnouncement = defaultFoundAnnouncement,
  className,
  ...props
}: AddressFormCepProps) {
  const context = useAddressForm("AddressFormCep");
  const compact = context.variant === "compact";
  const { status } = context;
  const cepStatus = lookupCepStatus(status);
  const found = status === "found" || status === "partial";
  const failed = status === "not-found" || status === "error";
  const visible = status === "idle" ? undefined : (messages?.[status] ?? defaultMessages[status]);

  return (
    <div
      data-slot="address-form-cep"
      className={cn("col-span-full min-w-0", className)}
      {...props}
      ref={context.cepRef}
    >
      <CepField
        variant={compact ? "compact" : "rounded"}
        status={cepStatus}
        value={context.address.cep}
        onValueChange={context.setCep}
        onLookup={context.lookup}
        disabled={context.disabled}
      >
        <CepFieldLabel className={cn(compact && "sr-only")}>{label}</CepFieldLabel>
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          <CepFieldControl
            className={cn(
              compact ? "w-full" : "w-full max-w-[260px]",
              "border-input bg-transparent dark:bg-input/30",
              status === "not-found" && "animate-shake motion-reduce:animate-none",
            )}
          >
            <CepFieldInput name="cep" />
            {found ? (
              <span
                data-slot="address-form-cep-check"
                className={cn(
                  "grid shrink-0 place-items-center text-success-ink animate-in zoom-in-50 fade-in-0 duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none",
                  compact ? "h-7 px-1.5" : "h-8 px-2",
                )}
              >
                <CircleCheck className={compact ? "size-3.5" : "size-4"} aria-hidden="true" />
              </span>
            ) : (
              <CepFieldLookup>{status === "looking-up" ? "Buscando" : "Buscar"}</CepFieldLookup>
            )}
          </CepFieldControl>
          {helpHref && !compact ? (
            <a
              data-slot="address-form-cep-help"
              href={helpHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-[4px] text-[12px] leading-4 text-primary-ink underline decoration-[color-mix(in_oklab,var(--primary-ink)_40%,transparent)] underline-offset-2 transition-colors duration-120 ease-out hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
            >
              {helpLabel}
            </a>
          ) : null}
        </div>
        <CepFieldMessage>
          {visible ? (
            <span
              key={status}
              className={cn(
                "block",
                failed && "animate-in fade-in-0 duration-180 ease-out motion-reduce:animate-none",
              )}
            >
              {status === "found" && context.result ? (
                <>
                  <span aria-hidden="true">{visible}</span>
                  <span className="sr-only">{foundAnnouncement(context.result)}</span>
                </>
              ) : (
                visible
              )}
            </span>
          ) : null}
        </CepFieldMessage>
      </CepField>
    </div>
  );
}

const fillClass: Record<FillPhase | "resting", string> = {
  resting: "",
  enter: "border-ring/60 ring-3 ring-ring/16 text-transparent transition-none",
  wash: "border-ring/60 ring-3 ring-ring/16 transition-[color] duration-200 ease-out-quint motion-reduce:transition-none",
  settled:
    "transition-[color,border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none",
};

function controlClass(compact: boolean, phase: FillPhase | undefined, busy: boolean) {
  return cn(
    "border-input bg-transparent dark:bg-input/30",
    compact && "h-8 rounded-lg py-1.5",
    phase && "pr-8",
    fillClass[phase ?? "resting"],
    busy && "text-transparent",
  );
}

function FillMarker({ phase, busy }: { phase: FillPhase | undefined; busy: boolean }) {
  if (!phase || busy) return null;
  return (
    <Sparkle
      data-slot="address-form-marker"
      className={cn(
        "pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-subtle-foreground transition-opacity duration-200 ease-out-quint motion-reduce:transition-none",
        phase === "enter" ? "opacity-0" : "opacity-100",
      )}
      strokeWidth={2}
      aria-hidden="true"
    />
  );
}

function FieldSkeleton({ width }: { width: string }) {
  return (
    <span
      data-slot="address-form-skeleton"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-3 h-2.5 -translate-y-1/2 rounded-[5px] bg-[linear-gradient(90deg,var(--muted)_0%,color-mix(in_oklab,var(--muted)_70%,var(--foreground))_50%,var(--muted)_100%)] bg-size-[200%_100%] motion-safe:animate-skeleton-shimmer"
      style={{ width }}
    />
  );
}

type TextFieldProps = Omit<ComponentProps<"div">, "children" | "defaultValue" | "onChange"> & {
  /** The visible label (screen-reader only in compact). */
  children?: ReactNode;
  placeholder?: string;
  /** The inline error when the field is required and empty. */
  requiredMessage?: string;
  /** The screen-reader description of a field the CEP filled. */
  markerLabel?: string;
};

const skeletonWidths: Record<ResolvableField, string> = {
  street: "62%",
  district: "34%",
  city: "52%",
  state: "60%",
};

function useFieldState(field: ResolvableField | "number" | "complement") {
  const context = useAddressForm("AddressForm field");
  const resolvable = (RESOLVABLE_FIELDS as readonly string[]).includes(field)
    ? (field as ResolvableField)
    : undefined;
  const phase = resolvable ? context.fills[resolvable] : undefined;
  // While looking up, the fields the CEP will replace (filled by it, or still empty) shimmer.
  const busy =
    resolvable !== undefined &&
    context.status === "looking-up" &&
    (phase !== undefined || !context.address[resolvable].trim());
  const invalid = context.showErrors && (context.missing as readonly string[]).includes(field);
  return { context, resolvable, phase, busy, invalid };
}

function useValidity(
  element: RefObject<HTMLInputElement | null>,
  required: boolean,
  message: string,
) {
  useEffect(() => {
    element.current?.setCustomValidity(required ? message : "");
  }, [element, required, message]);
}

function AddressTextField({
  field,
  autoComplete,
  defaultLabel,
  defaultPlaceholder,
  defaultRequired,
  layout,
  children,
  placeholder,
  requiredMessage,
  markerLabel = "Preenchido pelo CEP",
  className,
  ...props
}: TextFieldProps & {
  field: "street" | "complement" | "district" | "city";
  autoComplete: string;
  defaultLabel: string;
  defaultPlaceholder?: string;
  defaultRequired?: string;
  layout: string;
}) {
  const { context, phase, busy, invalid } = useFieldState(field);
  const compact = context.variant === "compact";
  const inputRef = useRef<HTMLInputElement>(null);
  const label = children ?? defaultLabel;
  const message = requiredMessage ?? defaultRequired ?? "";
  const missing = (context.missing as readonly string[]).includes(field);
  useValidity(inputRef, Boolean(defaultRequired) && missing, message);
  const { registerInput } = context;
  useEffect(() => {
    registerInput(field, inputRef.current);
    return () => registerInput(field, null);
  }, [field, registerInput]);

  return (
    <FormField
      data-slot={`address-form-${field}`}
      variant={compact ? "compact" : "outlined"}
      value={context.address[field]}
      onValueChange={(next) => context.setField(field, next)}
      invalid={invalid}
      disabled={context.disabled}
      className={cn(layout, className)}
      {...props}
    >
      <FormFieldLabel
        className={cn(compact ? "sr-only" : "text-[12px] leading-4 text-muted-foreground")}
      >
        {label}
      </FormFieldLabel>
      <div className="relative min-w-0">
        <FormFieldInput
          ref={inputRef}
          name={field}
          autoComplete={autoComplete}
          placeholder={
            placeholder ??
            (compact && typeof label === "string" ? label : undefined) ??
            defaultPlaceholder
          }
          aria-required={defaultRequired ? true : undefined}
          aria-busy={busy || undefined}
          data-filled={phase ? "" : undefined}
          className={controlClass(compact, phase, busy)}
        />
        {busy ? <FieldSkeleton width={skeletonWidths[field as ResolvableField]} /> : null}
        <FillMarker phase={phase} busy={busy} />
      </div>
      {phase ? (
        <FormFieldDescription className="sr-only">{markerLabel}</FormFieldDescription>
      ) : null}
      {defaultRequired ? <FormFieldError>{message}</FormFieldError> : null}
    </FormField>
  );
}

export type AddressFormStreetProps = TextFieldProps;

export function AddressFormStreet(props: AddressFormStreetProps) {
  useAddressForm("AddressFormStreet");
  return (
    <AddressTextField
      field="street"
      autoComplete="address-line1"
      defaultLabel="Rua"
      defaultRequired="Informe a rua."
      layout="col-span-full"
      {...props}
    />
  );
}

export type AddressFormComplementProps = TextFieldProps;

export function AddressFormComplement(props: AddressFormComplementProps) {
  useAddressForm("AddressFormComplement");
  return (
    <AddressTextField
      field="complement"
      autoComplete="address-line2"
      defaultLabel="Complemento"
      defaultPlaceholder="Apto, bloco (opcional)"
      layout="col-span-2"
      {...props}
    />
  );
}

export type AddressFormDistrictProps = TextFieldProps;

export function AddressFormDistrict(props: AddressFormDistrictProps) {
  useAddressForm("AddressFormDistrict");
  return (
    <AddressTextField
      field="district"
      autoComplete="address-level3"
      defaultLabel="Bairro"
      layout="col-span-full"
      {...props}
    />
  );
}

export type AddressFormCityProps = TextFieldProps;

export function AddressFormCity(props: AddressFormCityProps) {
  useAddressForm("AddressFormCity");
  return (
    <AddressTextField
      field="city"
      autoComplete="address-level2"
      defaultLabel="Cidade"
      defaultRequired="Informe a cidade."
      layout="col-span-2 col-start-1"
      {...props}
    />
  );
}

export type AddressFormNumberProps = TextFieldProps & {
  /** The "Sem número" checkbox label. */
  noNumberLabel?: ReactNode;
};

/** Número, required unless "Sem número" is checked. */
export function AddressFormNumber({
  children = "Número",
  placeholder,
  requiredMessage = 'Informe o número ou marque "Sem número".',
  noNumberLabel = "Sem número",
  markerLabel: _markerLabel,
  className,
  ...props
}: AddressFormNumberProps) {
  const { context, invalid } = useFieldState("number");
  const compact = context.variant === "compact";
  const inputRef = useRef<HTMLInputElement>(null);
  const checkboxId = useId();
  const { noNumber } = context.address;
  useValidity(inputRef, context.missing.includes("number"), requiredMessage);
  const { registerInput } = context;
  useEffect(() => {
    registerInput("number", inputRef.current);
    return () => registerInput("number", null);
  }, [registerInput]);

  return (
    <FormField
      data-slot="address-form-number"
      variant={compact ? "compact" : "outlined"}
      value={context.address.number}
      onValueChange={(next) => context.setField("number", next)}
      invalid={invalid}
      disabled={context.disabled || noNumber}
      className={cn("col-start-1 min-w-0 grid-cols-[minmax(0,1fr)]", className)}
      {...props}
    >
      <FormFieldLabel
        className={cn(compact ? "sr-only" : "text-[12px] leading-4 text-muted-foreground")}
      >
        {children}
      </FormFieldLabel>
      <FormFieldInput
        ref={inputRef}
        name="number"
        inputMode="numeric"
        autoComplete="off"
        placeholder={
          placeholder ?? (compact && typeof children === "string" ? children : undefined)
        }
        aria-required={!noNumber}
        className={cn("tabular-nums", controlClass(compact, undefined, false))}
      />
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Checkbox
          id={checkboxId}
          data-slot="address-form-no-number"
          checked={noNumber}
          disabled={context.disabled}
          onCheckedChange={(checked) => {
            const next = checked === true;
            context.setField("noNumber", next);
            if (next) context.setField("number", "");
          }}
          className="size-3.5 shrink-0 rounded-[4px] border-subtle-foreground shadow-none focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid [&_svg]:size-3"
        />
        <Label
          htmlFor={checkboxId}
          className={cn(
            "font-normal text-muted-foreground select-auto",
            compact ? "text-[11.5px] leading-4" : "text-[12px] leading-4",
          )}
        >
          {noNumberLabel}
        </Label>
      </div>
      <FormFieldError className="whitespace-nowrap">{requiredMessage}</FormFieldError>
    </FormField>
  );
}

export type AddressFormStateProps = TextFieldProps;

/** UF, a Select of the 27 federative units named "UF" with each state's full name. */
export function AddressFormState({
  children = "UF",
  placeholder = "UF",
  requiredMessage = "Escolha a UF.",
  markerLabel = "Preenchido pelo CEP",
  className,
  ...props
}: AddressFormStateProps) {
  const { context, phase, busy, invalid } = useFieldState("state");
  const compact = context.variant === "compact";
  const triggerId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const validityRef = useRef<HTMLInputElement>(null);
  const { state } = context.address;
  useValidity(validityRef, context.missing.includes("state"), requiredMessage);
  const { registerInput } = context;
  useEffect(() => {
    registerInput("state", triggerRef.current);
    return () => registerInput("state", null);
  }, [registerInput]);

  return (
    <FormField
      data-slot="address-form-state"
      variant={compact ? "compact" : "outlined"}
      inputId={triggerId}
      invalid={invalid}
      disabled={context.disabled}
      className={cn("col-start-3 min-w-0", className)}
      {...props}
    >
      <FormFieldLabel
        className={cn(compact ? "sr-only" : "text-[12px] leading-4 text-muted-foreground")}
      >
        {children}
      </FormFieldLabel>
      <div className="relative min-w-0">
        <Select
          value={state}
          disabled={context.disabled}
          onValueChange={(next: string | null) => {
            if (next) context.setField("state", next);
          }}
        >
          <SelectTrigger
            ref={triggerRef}
            id={triggerId}
            data-empty={state ? undefined : ""}
            aria-invalid={invalid || undefined}
            aria-busy={busy || undefined}
            data-filled={phase ? "" : undefined}
            aria-describedby={`${triggerId}-description ${triggerId}-error`}
            className={cn(
              "w-full min-w-0 gap-1 rounded-[10px] border border-input bg-transparent px-3 text-[13px] leading-[18px] shadow-none transition-[border-color,background-color,box-shadow] duration-120 ease-out hover:border-border-strong focus-visible:border-border-strong focus-visible:ring-3 focus-visible:ring-primary/24 aria-invalid:border-destructive/70 motion-reduce:transition-none data-[size=default]:h-[38px] data-empty:text-subtle-foreground dark:bg-input/30 dark:hover:bg-input/30 [&_svg]:size-3.5 [&_svg]:text-subtle-foreground",
              compact && "rounded-lg px-2.5 text-[12.5px] data-[size=default]:h-8",
              fillClass[phase ?? "resting"],
              busy && "text-transparent [&_svg]:opacity-0",
            )}
          >
            <SelectValue placeholder={placeholder}>{state || placeholder}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72 rounded-[14px] border-0 bg-popover p-1 text-popover-foreground shadow-[0_0_0_1px_var(--border-strong),0_12px_28px_-10px_oklch(0_0_0/0.32),0_2px_6px_-2px_oklch(0_0_0/0.12)] duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:zoom-out-96 data-closed:zoom-out-96 data-[state=open]:zoom-in-96 data-open:zoom-in-96 motion-reduce:data-[state=closed]:animate-none motion-reduce:data-closed:animate-none motion-reduce:data-[state=open]:animate-none motion-reduce:data-open:animate-none">
            {BRAZIL_STATES.map(([code, name]) => (
              <SelectItem
                key={code}
                value={code}
                className="gap-2 rounded-[10px] py-1.5 text-[13px] leading-[18px]"
              >
                <span className="font-medium tabular-nums">{code}</span>
                <span className="text-muted-foreground">{name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {busy ? <FieldSkeleton width={skeletonWidths.state} /> : null}
        <input
          ref={validityRef}
          data-address-field="state"
          name="state"
          value={state}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="address-level1"
          className="sr-only"
        />
      </div>
      {phase ? (
        <p id={`${triggerId}-description`} className="sr-only">
          {markerLabel}
        </p>
      ) : null}
      <FormFieldError>{requiredMessage}</FormFieldError>
    </FormField>
  );
}

export type AddressFormSummaryProps = ComponentProps<"div"> & {
  label?: ReactNode;
};

/** Split only: an "Entregar em" card that composes the address live; children add a slot below. */
export function AddressFormSummary({
  label = "Entregar em",
  children,
  className,
  ...props
}: AddressFormSummaryProps) {
  const context = useAddressForm("AddressFormSummary");
  if (context.variant !== "split") return null;
  const { address } = context;
  const number = address.noNumber ? "S/N" : address.number.trim();
  const lines = [
    [address.street.trim(), number].filter(Boolean).join(", "),
    address.complement.trim(),
    address.district.trim(),
    [address.city.trim(), address.state].filter(Boolean).join(" – "),
    address.cep.length === 8 ? `CEP ${formatCep(address.cep)}` : "",
  ].filter(Boolean);
  return (
    <div
      data-slot="address-form-summary"
      className={cn(
        "grid min-w-0 content-start gap-3 self-start rounded-xl bg-muted p-4 @[720px]:col-start-2 @[720px]:row-span-3 @[720px]:row-start-1",
        className,
      )}
      {...props}
    >
      <span className="text-[12px] leading-4 font-medium text-muted-foreground">{label}</span>
      <address className="grid gap-0.5 text-[13px] leading-[18px] text-muted-foreground not-italic [&>:first-child]:font-medium [&>:first-child]:text-foreground">
        {lines.length > 0 ? lines.map((line) => <span key={line}>{line}</span>) : <span>—</span>}
      </address>
      {children}
    </div>
  );
}

export type AddressFormActionsProps = ComponentProps<"div">;

export function AddressFormActions({ className, ...props }: AddressFormActionsProps) {
  const context = useAddressForm("AddressFormActions");
  return (
    <div
      data-slot="address-form-actions"
      className={cn(
        "flex min-w-0 items-center justify-end gap-2",
        context.variant === "compact" && "[&>*]:flex-1",
        context.variant === "split" && "@[720px]:col-start-1",
        className,
      )}
      {...props}
    />
  );
}

const actionClass =
  "h-8 gap-1.5 rounded-full px-3.5 py-0 text-[12.5px] font-medium shadow-none transition-[scale,background-color,color] duration-140 ease-out-quint focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

export type AddressFormBackProps = ComponentProps<typeof Button>;

/** The secondary action: a raised pill with no border. */
export function AddressFormBack({
  children = "Voltar",
  className,
  ...props
}: AddressFormBackProps) {
  useAddressForm("AddressFormBack");
  return (
    <Button
      type="button"
      variant="secondary"
      data-slot="address-form-back"
      className={cn(
        actionClass,
        "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export type AddressFormSubmitProps = ComponentProps<typeof Button>;

/** The single primary action. It submits your form, so the native checks run first. */
export function AddressFormSubmit({ children, className, ...props }: AddressFormSubmitProps) {
  const context = useAddressForm("AddressFormSubmit");
  return (
    <Button
      type="submit"
      data-slot="address-form-submit"
      className={cn(
        actionClass,
        "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary)_88%,var(--foreground))]",
        className,
      )}
      {...props}
    >
      {children ?? (context.variant === "compact" ? "Salvar endereço" : "Continuar")}
    </Button>
  );
}
