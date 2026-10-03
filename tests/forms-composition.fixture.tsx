import { DateRangePickerPreview } from "@/components/registry/forms/date-range-picker-preview";
import { FileUploadPreview } from "@/components/registry/forms/file-upload-preview";
import { FilterBarPreview } from "@/components/registry/forms/filter-bar-preview";
import { FormErrorSummaryPreview } from "@/components/registry/forms/form-error-summary-preview";
import { FormFieldPreview } from "@/components/registry/forms/form-field-preview";
import { SearchFieldPreview } from "@/components/registry/forms/search-field-preview";
import { StepIndicatorPreview } from "@/components/registry/forms/step-indicator-preview";
import { UnsavedChangesBarPreview } from "@/components/registry/forms/unsaved-changes-bar-preview";

export function FormsCompositionFixture() {
  return (
    <>
      <FormFieldPreview />
      <SearchFieldPreview />
      <FilterBarPreview />
      <FileUploadPreview />
      <DateRangePickerPreview />
      <FormErrorSummaryPreview />
      <UnsavedChangesBarPreview />
      <StepIndicatorPreview />
    </>
  );
}
