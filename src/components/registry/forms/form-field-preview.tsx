"use client";

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
  const [value, setValue] = useState("A shared space for product decisions.");
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
