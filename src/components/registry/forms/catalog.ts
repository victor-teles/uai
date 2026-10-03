import {
  CalendarRange,
  CircleAlert,
  ListFilter,
  ListOrdered,
  Save,
  Search,
  TextCursorInput,
  Upload,
} from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export const formsCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "form-field",
    name: "Form Field",
    category: "Forms",
    icon: TextCursorInput,
    description: "Labels, descriptions, requirements, validation, and character counts.",
    usage: `"use client";

import { useState } from "react";
import {
  FormField,
  FormFieldCount,
  FormFieldDescription,
  FormFieldError,
  FormFieldLabel,
  FormFieldTextarea,
  type FormFieldVariant,
} from "@/components/ui/uai/form-field";

export function FormFieldPreview({ variant = "outlined" }: { variant?: FormFieldVariant }) {
  const [value, setValue] = useState(
    "Where the growth team plans launches and tracks pricing experiments.",
  );
  const [touched, setTouched] = useState(false);
  return (
    <FormField
      variant={variant}
      value={value}
      onValueChange={setValue}
      required
      maxLength={120}
      invalid={touched && value.trim().length < 10}
    >
      <FormFieldLabel>Workspace description</FormFieldLabel>
      <FormFieldTextarea
        name="description"
        onBlur={() => setTouched(true)}
        placeholder="What will your team work on?"
      />
      <FormFieldDescription>
        Use at least 10 characters. You can change this later.
      </FormFieldDescription>
      <FormFieldError>Enter a description with at least 10 characters.</FormFieldError>
      <FormFieldCount />
    </FormField>
  );
}
`,
    accessibility: [
      "Label, required state, description, error, and count are connected to the native input or textarea.",
      "The root owns the string value; use one input or textarea per field. Validation remains consumer-owned.",
      "Pass inputId on the root to connect external summaries. Mount optional descriptions and errors only when relevant.",
    ],
  },
  {
    id: "search-field",
    name: "Search Field",
    category: "Forms",
    icon: Search,
    description: "Clearable search with recent queries, loading, empty, and error feedback.",
    usage: `"use client";

import { useState } from "react";
import {
  SearchField,
  SearchFieldClear,
  SearchFieldControl,
  SearchFieldInput,
  SearchFieldLabel,
  SearchFieldMessage,
  SearchFieldRecent,
  SearchFieldRecentItem,
  type SearchFieldStatus,
  type SearchFieldVariant,
} from "@/components/ui/uai/search-field";

export function SearchFieldPreview({ variant = "rounded" }: { variant?: SearchFieldVariant }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<SearchFieldStatus>("idle");
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <SearchField
        variant={variant}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          setStatus(next ? "empty" : "idle");
        }}
        status={status}
      >
        <SearchFieldLabel>Search workspace</SearchFieldLabel>
        <SearchFieldControl>
          <SearchFieldInput placeholder="Search docs, issues, people…" />
          <SearchFieldClear />
        </SearchFieldControl>
        <SearchFieldMessage>{status === "idle" ? "Recent searches" : undefined}</SearchFieldMessage>
        <SearchFieldRecent>
          <SearchFieldRecentItem value="Q3 roadmap" />
          <SearchFieldRecentItem value="Billing migration" />
          <SearchFieldRecentItem value="Onboarding v2" />
        </SearchFieldRecent>
      </SearchField>
      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          fontSize: 12,
          color: "var(--uai-muted)",
        }}
      >
        Preview response
        <select
          style={{
            height: 26,
            padding: "0 8px",
            border: 0,
            borderRadius: 999,
            background: "var(--uai-surface-raised)",
            color: "var(--uai-text)",
            font: "inherit",
          }}
          value={status}
          onChange={(event) => setStatus(event.target.value as SearchFieldStatus)}
        >
          <option value="idle">Idle</option>
          <option value="loading">Loading</option>
          <option value="empty">No results</option>
          <option value="error">Error</option>
        </select>
      </label>
    </div>
  );
}
`,
    accessibility: [
      "Escape and Clear empty the query; Clear and recent-query selection return focus to the input.",
      "SearchFieldRecent composes ordinary buttons in tab order; it is not an autocomplete listbox.",
      "The consumer owns search requests, results, and recent history. Status messages expose loading, empty, and error states.",
    ],
  },
  {
    id: "filter-bar",
    name: "Filter Bar",
    category: "Forms",
    icon: ListFilter,
    description: "Composable filters, removable chips, result counts, and reset actions.",
    usage: `"use client";

import { useState } from "react";
import {
  FilterBar,
  FilterBarChip,
  FilterBarChips,
  FilterBarControls,
  FilterBarCount,
  FilterBarReset,
  type FilterBarVariant,
} from "@/components/ui/uai/filter-bar";

export function FilterBarPreview({ variant = "toolbar" }: { variant?: FilterBarVariant }) {
  const [status, setStatus] = useState("Open");
  const [mine, setMine] = useState(false);
  return (
    <FilterBar
      variant={variant}
      activeCount={Number(Boolean(status)) + Number(mine)}
      onReset={() => {
        setStatus("");
        setMine(false);
      }}
    >
      <FilterBarControls>
        <label style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--uai-muted)" }}>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={{
              height: 28,
              padding: "0 10px",
              border: 0,
              borderRadius: 999,
              background: "var(--uai-surface-raised)",
              color: "var(--uai-text)",
              font: "inherit",
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            <option value="">All statuses</option>
            <option>Open</option>
            <option>Closed</option>
          </select>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--uai-muted)" }}>
          <input
            type="checkbox"
            style={{ accentColor: "var(--uai-accent)" }}
            checked={mine}
            onChange={(event) => setMine(event.target.checked)}
          />
          Assigned to me
        </label>
      </FilterBarControls>
      <FilterBarChips>
        {status && <FilterBarChip onRemove={() => setStatus("")}>Status: {status}</FilterBarChip>}
        {mine && <FilterBarChip onRemove={() => setMine(false)}>Assigned to me</FilterBarChip>}
      </FilterBarChips>
      <FilterBarCount>{mine ? "3" : status ? "12" : "24"} example results</FilterBarCount>
      <FilterBarReset />
    </FilterBar>
  );
}
`,
    accessibility: [
      "Native controls retain keyboard behavior. Give each consumer-supplied filter a visible label.",
      "Each removable chip has an explicit accessible action name. Reset is disabled when activeCount is zero.",
      "Result counts use a polite live status. The consumer owns filter values and data fetching.",
    ],
  },
  {
    id: "file-upload",
    name: "File Upload",
    category: "Forms",
    icon: Upload,
    description: "File selection and drag and drop with validation, progress, retry, and removal.",
    usage: `"use client";

import { useEffect, useState } from "react";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadInput,
  FileUploadItem,
  FileUploadList,
  FileUploadProgress,
  FileUploadRemove,
  FileUploadRetry,
  FileUploadTrigger,
  type FileUploadVariant,
} from "@/components/ui/uai/file-upload";

type DemoFile = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "complete" | "error";
};
export function FileUploadPreview({ variant = "dropzone" }: { variant?: FileUploadVariant }) {
  const [files, setFiles] = useState<DemoFile[]>([
    { id: "brief", name: "Q3 launch brief.pdf", progress: 100, status: "complete" },
    { id: "deck", name: "pricing-review-deck.pdf", progress: 0, status: "error" },
  ]);
  const uploading = files.some((file) => file.status === "uploading");
  useEffect(() => {
    if (!uploading) return;
    const timer = setInterval(
      () =>
        setFiles((current) =>
          current.map((file) =>
            file.status === "uploading"
              ? {
                  ...file,
                  progress: Math.min(100, file.progress + 20),
                  status: file.progress >= 80 ? "complete" : "uploading",
                }
              : file,
          ),
        ),
      350,
    );
    return () => clearInterval(timer);
  }, [uploading]);
  return (
    <FileUpload
      variant={variant}
      accept=".pdf,image/*"
      maxSize={5 * 1024 * 1024}
      maxFiles={5}
      fileCount={files.length}
      onFilesAccepted={(accepted) =>
        setFiles((current) => [
          ...current,
          ...accepted.map((file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            progress: 0,
            status: "uploading" as const,
          })),
        ])
      }
    >
      <FileUploadDropzone>
        <div
          style={{
            textAlign: variant === "dropzone" ? "center" : "left",
            flex: variant === "dropzone" ? undefined : 1,
          }}
        >
          <strong style={{ fontWeight: 500 }}>Add project files</strong>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--uai-subtle)" }}>
            Drop PDFs or images · up to 5 MB each · 5 files
          </p>
        </div>
        <FileUploadInput />
        <FileUploadTrigger />
      </FileUploadDropzone>
      <FileUploadList>
        {files.map((file) => (
          <FileUploadItem key={file.id} status={file.status} progress={file.progress}>
            <strong style={{ fontWeight: 500 }}>{file.name}</strong>
            <FileUploadProgress aria-label={\`Uploading \${file.name}\`} />
            <div style={{ display: "flex", gap: 4 }}>
              <FileUploadRetry
                onClick={() =>
                  setFiles((current) =>
                    current.map((item) =>
                      item.id === file.id ? { ...item, progress: 0, status: "uploading" } : item,
                    ),
                  )
                }
              />
              <FileUploadRemove
                aria-label={\`Remove \${file.name}\`}
                onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))}
              />
            </div>
          </FileUploadItem>
        ))}
      </FileUploadList>
      <p style={{ margin: 0, fontSize: 11.5, color: "var(--uai-subtle)" }}>
        Local demo: progress is simulated. Files are not sent to a server.
      </p>
    </FileUpload>
  );
}
`,
    accessibility: [
      "Choose files is the keyboard alternative to dropping files. Both routes apply accept, maxSize, and count limits.",
      "Upload progress has a native progress element; provide a file-specific accessible label.",
      "The consumer owns upload requests, cancellation, progress, retry, removal, and server validation. fileCount includes existing files. Client checks are usability feedback, not a security boundary.",
    ],
  },
  {
    id: "date-range-picker",
    name: "Date Range Picker",
    category: "Forms",
    icon: CalendarRange,
    description: "Presets, date inputs, and a keyboard-navigable calendar for local date ranges.",
    usage: `"use client";

import {
  DateRangePicker,
  DateRangePickerBody,
  DateRangePickerCalendar,
  DateRangePickerClear,
  DateRangePickerInput,
  DateRangePickerInputs,
  DateRangePickerPreset,
  DateRangePickerPresets,
  DateRangePickerSummary,
  type DateRangePickerVariant,
} from "@/components/ui/uai/date-range-picker";

export function DateRangePickerPreview({ variant = "card" }: { variant?: DateRangePickerVariant }) {
  return (
    <DateRangePicker
      variant={variant}
      defaultValue={{ start: "2026-09-07", end: "2026-09-11" }}
      min="2026-01-01"
      max="2027-12-31"
    >
      <DateRangePickerInputs>
        <DateRangePickerInput boundary="start" name="start" />
        <DateRangePickerInput boundary="end" name="end" />
      </DateRangePickerInputs>
      <DateRangePickerBody>
        <DateRangePickerPresets>
          <DateRangePickerPreset value={{ start: "2026-09-07", end: "2026-09-11" }}>
            Release week
          </DateRangePickerPreset>
          <DateRangePickerPreset value={{ start: "2026-09-01", end: "2026-09-30" }}>
            September
          </DateRangePickerPreset>
        </DateRangePickerPresets>
        <DateRangePickerCalendar />
      </DateRangePickerBody>
      <DateRangePickerSummary />
      <DateRangePickerClear />
    </DateRangePicker>
  );
}
`,
    accessibility: [
      "Arrow keys move by day or week; Home and End move to week boundaries; Page Up and Down change month, with Shift changing year. Enter or Space selects.",
      "Dates are YYYY-MM-DD calendar dates without UTC conversion. The end cannot precede the start; min and max constrain presets, inputs, and calendar.",
      "Native labeled date inputs provide a direct-entry alternative. Selection uses pressed day buttons and a live range summary. The example uses fixed release dates.",
    ],
  },
  {
    id: "form-error-summary",
    name: "Form Error Summary",
    category: "Forms",
    icon: CircleAlert,
    description: "A submission error summary with links that focus the matching fields.",
    usage: `"use client";

import { useId, useState } from "react";
import {
  FormErrorSummary,
  FormErrorSummaryLink,
  FormErrorSummaryList,
  FormErrorSummaryTitle,
  type FormErrorSummaryVariant,
} from "@/components/ui/uai/form-error-summary";
import {
  FormField,
  FormFieldError,
  FormFieldInput,
  FormFieldLabel,
} from "@/components/ui/uai/form-field";

export function FormErrorSummaryPreview({
  variant = "card",
}: {
  variant?: FormErrorSummaryVariant;
}) {
  const emailId = useId();
  const nameId = useId();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(true);
  const invalidEmail = submitted && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  const invalidName = submitted && !name.trim();
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
      style={{ display: "grid", gap: 16 }}
    >
      {(invalidEmail || invalidName) && (
        <FormErrorSummary variant={variant}>
          <FormErrorSummaryTitle>Review your contact details</FormErrorSummaryTitle>
          <FormErrorSummaryList>
            {invalidEmail && (
              <FormErrorSummaryLink fieldId={emailId}>
                Enter a valid email address.
              </FormErrorSummaryLink>
            )}
            {invalidName && (
              <FormErrorSummaryLink fieldId={nameId}>Enter your full name.</FormErrorSummaryLink>
            )}
          </FormErrorSummaryList>
        </FormErrorSummary>
      )}
      <FormField
        inputId={emailId}
        value={email}
        onValueChange={setEmail}
        invalid={invalidEmail}
        required
      >
        <FormFieldLabel>Email</FormFieldLabel>
        <FormFieldInput
          name="email"
          type="email"
          autoComplete="email"
          placeholder="maya@northwind.studio"
        />
        <FormFieldError>Enter a valid email address.</FormFieldError>
      </FormField>
      <FormField
        inputId={nameId}
        value={name}
        onValueChange={setName}
        invalid={invalidName}
        required
      >
        <FormFieldLabel>Full name</FormFieldLabel>
        <FormFieldInput name="name" autoComplete="name" placeholder="Maya Chen" />
        <FormFieldError>Enter your full name.</FormFieldError>
      </FormField>
      {!invalidEmail && !invalidName && (
        <p role="status" style={{ margin: 0, fontSize: 12, color: "var(--uai-success)" }}>
          Contact details are ready.
        </p>
      )}
      <button
        type="submit"
        style={{
          justifySelf: "start",
          height: 30,
          padding: "0 14px",
          border: 0,
          borderRadius: 999,
          background: "var(--uai-accent)",
          color: "var(--uai-accent-foreground)",
          font: "inherit",
          fontSize: 12.5,
          fontWeight: 500,
        }}
      >
        Validate details
      </button>
    </form>
  );
}
`,
    accessibility: [
      "Links retain fragment destinations and focus existing target fields. Render each link inside FormErrorSummaryList.",
      "Render the summary after a failed submission and set focusOnMount when it should receive focus; the title labels its alert.",
      "Use inputId on FormField or id on native fields. Structural list and link children may be reused without context.",
    ],
  },
  {
    id: "unsaved-changes-bar",
    name: "Unsaved Changes Bar",
    category: "Forms",
    icon: Save,
    description: "Persistent save and discard actions with busy, error, and page-exit warnings.",
    usage: `"use client";

import { useEffect, useState } from "react";
import { FormField, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";
import {
  UnsavedChangesBar,
  UnsavedChangesBarActions,
  UnsavedChangesBarDiscard,
  UnsavedChangesBarMessage,
  UnsavedChangesBarSave,
  type UnsavedChangesBarVariant,
} from "@/components/ui/uai/unsaved-changes-bar";

export function UnsavedChangesBarPreview({
  variant = "bar",
}: {
  variant?: UnsavedChangesBarVariant;
}) {
  const [saved, setSaved] = useState("Product workspace");
  const [draft, setDraft] = useState("Product studio");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [fail, setFail] = useState(false);
  const dirty = draft !== saved;
  useEffect(() => {
    if (status !== "saving") return;
    const timer = setTimeout(() => {
      if (fail) setStatus("error");
      else {
        setSaved(draft);
        setStatus("idle");
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [status, fail, draft]);
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <FormField value={draft} onValueChange={setDraft} disabled={status === "saving"}>
        <FormFieldLabel>Workspace name</FormFieldLabel>
        <FormFieldInput name="workspace" />
      </FormField>
      <label
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          fontSize: 12,
          color: "var(--uai-muted)",
        }}
      >
        <input
          type="checkbox"
          style={{ accentColor: "var(--uai-accent)" }}
          checked={fail}
          disabled={status === "saving"}
          onChange={(event) => setFail(event.target.checked)}
        />
        Simulate a save error
      </label>
      <UnsavedChangesBar
        variant={variant}
        dirty={dirty}
        status={status}
        warnBeforeUnload={false}
        onSave={() => setStatus("saving")}
        onDiscard={() => {
          setDraft(saved);
          setStatus("idle");
        }}
      >
        <UnsavedChangesBarMessage />
        <UnsavedChangesBarActions>
          <UnsavedChangesBarDiscard />
          <UnsavedChangesBarSave />
        </UnsavedChangesBarActions>
      </UnsavedChangesBar>
      {!dirty && (
        <p role="status" style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12 }}>
          All changes saved. Edit the name to try again.
        </p>
      )}
      <p style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12 }}>
        Local demo. Page-exit warnings are disabled in this preview.
      </p>
    </div>
  );
}
`,
    accessibility: [
      "Saving disables both save and discard. Errors remain visible while the consumer keeps dirty true.",
      "The bar sticks to the bottom of its containing scroll region. Reserve room for other fixed app controls.",
      "warnBeforeUnload defaults to true and attaches a native page-exit warning while dirty. Browser wording and display are browser-controlled. SPA route changes need a consumer-owned router blocker; keep dirty until save succeeds.",
    ],
  },
  {
    id: "step-indicator",
    name: "Step Indicator",
    category: "Forms",
    icon: ListOrdered,
    description: "Current, complete, optional, blocked, and error steps with explicit status text.",
    usage: `"use client";

import { useState } from "react";
import {
  StepIndicator,
  StepIndicatorDescription,
  StepIndicatorStep,
  StepIndicatorTitle,
  type StepIndicatorVariant,
} from "@/components/ui/uai/step-indicator";

export function StepIndicatorPreview({
  variant = "horizontal",
}: {
  variant?: StepIndicatorVariant;
}) {
  const [review, setReview] = useState(false);
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <StepIndicator variant={variant} aria-label="Workspace setup">
        <StepIndicatorStep status="complete">
          <StepIndicatorTitle>Account</StepIndicatorTitle>
          {variant !== "compact" && (
            <StepIndicatorDescription>maya@northwind.studio</StepIndicatorDescription>
          )}
        </StepIndicatorStep>
        <StepIndicatorStep status={review ? "complete" : "current"}>
          <StepIndicatorTitle>Details</StepIndicatorTitle>
        </StepIndicatorStep>
        <StepIndicatorStep optional status="error">
          <StepIndicatorTitle>Import</StepIndicatorTitle>
          {variant !== "compact" && (
            <StepIndicatorDescription>contacts.csv · 3 rows failed</StepIndicatorDescription>
          )}
        </StepIndicatorStep>
        <StepIndicatorStep status="blocked">
          <StepIndicatorTitle>Team</StepIndicatorTitle>
          {variant !== "compact" && (
            <StepIndicatorDescription>Waiting on admin invite</StepIndicatorDescription>
          )}
        </StepIndicatorStep>
        <StepIndicatorStep status={review ? "current" : "upcoming"}>
          <StepIndicatorTitle>Review</StepIndicatorTitle>
        </StepIndicatorStep>
      </StepIndicator>
      <button
        type="button"
        onClick={() => setReview(!review)}
        style={{
          justifySelf: "start",
          height: 30,
          padding: "0 14px",
          border: 0,
          borderRadius: 999,
          background: "var(--uai-surface-raised)",
          color: "var(--uai-text)",
          font: "inherit",
          fontSize: 12.5,
          fontWeight: 500,
        }}
      >
        {review ? "Back to details" : "Continue to review"}
      </button>
    </div>
  );
}
`,
    accessibility: [
      'Steps retain ordered-list semantics and the current step exposes aria-current="step".',
      "Optional, complete, blocked, and error states appear in text. The consumer must designate only one current step.",
      "This is a progress indicator, not an automatic wizard. If composing links or buttons into steps, the consumer controls availability and navigation.",
    ],
  },
];
