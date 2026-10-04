"use client";

import {
  formatBrl,
  InstallmentPicker,
  InstallmentPickerAmount,
  InstallmentPickerCount,
  InstallmentPickerLegend,
  InstallmentPickerOption,
  InstallmentPickerOptions,
  InstallmentPickerTerms,
  type InstallmentPickerVariant,
} from "@/components/ui/uai/installment-picker";

const price = 1299;
const monthlyRate = 0.0199;

function installment(count: number) {
  if (count <= 10) return { each: price / count, total: price, interestFree: true };
  const each = (price * monthlyRate) / (1 - (1 + monthlyRate) ** -count);
  return { each, total: each * count, interestFree: false };
}

export function InstallmentPickerPreview({
  variant = "list",
}: {
  variant?: InstallmentPickerVariant;
}) {
  return (
    <InstallmentPicker variant={variant} name="parcelas" defaultValue="3">
      <InstallmentPickerLegend>Parcelamento no cartão</InstallmentPickerLegend>
      <InstallmentPickerOptions>
        <InstallmentPickerOption value="1">
          <InstallmentPickerCount>1x</InstallmentPickerCount>
          <InstallmentPickerAmount>{formatBrl(price * 0.95)}</InstallmentPickerAmount>
          <InstallmentPickerTerms interestFree>5% off à vista</InstallmentPickerTerms>
        </InstallmentPickerOption>
        {[3, 6, 10, 12].map((count) => {
          const { each, total, interestFree } = installment(count);
          return (
            <InstallmentPickerOption key={count} value={String(count)}>
              <InstallmentPickerCount>{count}x</InstallmentPickerCount>
              <InstallmentPickerAmount>{formatBrl(each)}</InstallmentPickerAmount>
              <InstallmentPickerTerms interestFree={interestFree}>
                {interestFree ? "sem juros" : `total ${formatBrl(total)}`}
              </InstallmentPickerTerms>
            </InstallmentPickerOption>
          );
        })}
      </InstallmentPickerOptions>
    </InstallmentPicker>
  );
}
