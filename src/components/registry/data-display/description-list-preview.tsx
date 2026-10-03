"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import {
  DescriptionList,
  DescriptionListAction,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  type DescriptionListVariant,
} from "@/components/ui/uai/description-list";

export function DescriptionListPreview({
  variant = "inline",
}: {
  variant?: DescriptionListVariant;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <DescriptionList variant={variant}>
      <DescriptionListItem>
        <DescriptionListTerm>Customer</DescriptionListTerm>
        <DescriptionListDetails>Northwind Logistics</DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Plan</DescriptionListTerm>
        <DescriptionListDetails>Business · 42 seats, billed yearly</DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Account ID</DescriptionListTerm>
        <DescriptionListDetails>
          <code>acct_8KQ2M7</code>
          <DescriptionListAction
            aria-label={copied ? "Account ID copied" : "Copy account ID"}
            onClick={() => setCopied(true)}
          >
            {copied ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <Copy size={14} aria-hidden="true" />
            )}
          </DescriptionListAction>
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Renewal</DescriptionListTerm>
        <DescriptionListDetails>
          March 14, 2027
          <DescriptionListAction>Change</DescriptionListAction>
        </DescriptionListDetails>
      </DescriptionListItem>
    </DescriptionList>
  );
}
