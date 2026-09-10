"use client";

import {
  DATE_RANGE_PICKER_VARIANTS,
  type DateRangePickerVariant,
} from "@/components/ui/uai/date-range-picker";
import { FILE_UPLOAD_VARIANTS, type FileUploadVariant } from "@/components/ui/uai/file-upload";
import { FILTER_BAR_VARIANTS, type FilterBarVariant } from "@/components/ui/uai/filter-bar";
import {
  FORM_ERROR_SUMMARY_VARIANTS,
  type FormErrorSummaryVariant,
} from "@/components/ui/uai/form-error-summary";
import { FORM_FIELD_VARIANTS, type FormFieldVariant } from "@/components/ui/uai/form-field";
import { SEARCH_FIELD_VARIANTS, type SearchFieldVariant } from "@/components/ui/uai/search-field";
import {
  STEP_INDICATOR_VARIANTS,
  type StepIndicatorVariant,
} from "@/components/ui/uai/step-indicator";
import {
  UNSAVED_CHANGES_BAR_VARIANTS,
  type UnsavedChangesBarVariant,
} from "@/components/ui/uai/unsaved-changes-bar";
import { PreviewStage } from "../preview-chrome";
import { DateRangePickerPreview } from "./date-range-picker-preview";
import { FileUploadPreview } from "./file-upload-preview";
import { FilterBarPreview } from "./filter-bar-preview";
import { FormErrorSummaryPreview } from "./form-error-summary-preview";
import { FormFieldPreview } from "./form-field-preview";
import { SearchFieldPreview } from "./search-field-preview";
import { StepIndicatorPreview } from "./step-indicator-preview";
import { UnsavedChangesBarPreview } from "./unsaved-changes-bar-preview";

export function getFormsPreviewControl(itemId: string) {
  if (itemId === "form-field")
    return {
      ariaLabel: "form field variant",
      defaultValue: "outlined",
      options: FORM_FIELD_VARIANTS.map((id) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
      })),
    };
  if (itemId === "search-field")
    return {
      ariaLabel: "search field variant",
      defaultValue: "rounded",
      options: SEARCH_FIELD_VARIANTS.map((id) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
      })),
    };
  if (itemId === "filter-bar")
    return {
      ariaLabel: "filter bar variant",
      defaultValue: "toolbar",
      options: FILTER_BAR_VARIANTS.map((id) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
      })),
    };
  if (itemId === "file-upload")
    return {
      ariaLabel: "file upload variant",
      defaultValue: "dropzone",
      options: FILE_UPLOAD_VARIANTS.map((id) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
      })),
    };
  if (itemId === "date-range-picker")
    return {
      ariaLabel: "date range picker variant",
      defaultValue: "card",
      options: DATE_RANGE_PICKER_VARIANTS.map((id) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
      })),
    };
  if (itemId === "form-error-summary")
    return {
      ariaLabel: "form error summary variant",
      defaultValue: "card",
      options: FORM_ERROR_SUMMARY_VARIANTS.map((id) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
      })),
    };
  if (itemId === "unsaved-changes-bar")
    return {
      ariaLabel: "unsaved changes bar variant",
      defaultValue: "bar",
      options: UNSAVED_CHANGES_BAR_VARIANTS.map((id) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
      })),
    };
  if (itemId === "step-indicator")
    return {
      ariaLabel: "step indicator variant",
      defaultValue: "horizontal",
      options: STEP_INDICATOR_VARIANTS.map((id) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
      })),
    };
}

export function FormsPreview({ itemId, selection }: { itemId: string; selection: string }) {
  return (
    <PreviewStage label="Forms and usability">
      <div
        style={{
          width: "100%",
          maxWidth: itemId === "step-indicator" || itemId === "filter-bar" ? 660 : 440,
          minWidth: 0,
          padding: "24px 0",
        }}
      >
        {itemId === "form-field" && <FormFieldPreview variant={selection as FormFieldVariant} />}
        {itemId === "search-field" && (
          <SearchFieldPreview variant={selection as SearchFieldVariant} />
        )}
        {itemId === "filter-bar" && <FilterBarPreview variant={selection as FilterBarVariant} />}
        {itemId === "file-upload" && <FileUploadPreview variant={selection as FileUploadVariant} />}
        {itemId === "date-range-picker" && (
          <DateRangePickerPreview variant={selection as DateRangePickerVariant} />
        )}
        {itemId === "form-error-summary" && (
          <FormErrorSummaryPreview variant={selection as FormErrorSummaryVariant} />
        )}
        {itemId === "unsaved-changes-bar" && (
          <UnsavedChangesBarPreview variant={selection as UnsavedChangesBarVariant} />
        )}
        {itemId === "step-indicator" && (
          <StepIndicatorPreview variant={selection as StepIndicatorVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
