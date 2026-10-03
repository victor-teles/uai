"use client";

import {
  RunSummary,
  RunSummaryAction,
  RunSummaryActions,
  RunSummaryArtifact,
  RunSummaryArtifactMeta,
  RunSummaryArtifactName,
  RunSummaryArtifacts,
  RunSummaryDescription,
  RunSummaryHeader,
  RunSummaryNextStep,
  RunSummaryNextSteps,
  RunSummaryStat,
  RunSummaryStats,
  RunSummaryTitle,
  type RunSummaryVariant,
  RunSummaryWarning,
  RunSummaryWarnings,
} from "@/components/ui/uai/run-summary";

export function RunSummaryPreview({ variant = "card" }: { variant?: RunSummaryVariant }) {
  return (
    <RunSummary variant={variant} outcome="partial">
      <RunSummaryHeader>
        <RunSummaryTitle>Migrated billing emails to the new template</RunSummaryTitle>
        <RunSummaryDescription>
          Finished in 4m 12s · 18 steps · branch billing/email-templates
        </RunSummaryDescription>
      </RunSummaryHeader>
      <RunSummaryStats>
        <RunSummaryStat label="Files changed">5</RunSummaryStat>
        <RunSummaryStat label="Tests">42 passed</RunSummaryStat>
        <RunSummaryStat label="Warnings">2</RunSummaryStat>
      </RunSummaryStats>
      <RunSummaryArtifacts label="Changed files (5)">
        <RunSummaryArtifact change="added">
          <RunSummaryArtifactName>emails/receipt.tsx</RunSummaryArtifactName>
          <RunSummaryArtifactMeta>+128</RunSummaryArtifactMeta>
        </RunSummaryArtifact>
        <RunSummaryArtifact change="added">
          <RunSummaryArtifactName>emails/refund-issued.tsx</RunSummaryArtifactName>
          <RunSummaryArtifactMeta>+96</RunSummaryArtifactMeta>
        </RunSummaryArtifact>
        <RunSummaryArtifact>
          <RunSummaryArtifactName>lib/billing/notify.ts</RunSummaryArtifactName>
          <RunSummaryArtifactMeta>+31 −44</RunSummaryArtifactMeta>
        </RunSummaryArtifact>
        <RunSummaryArtifact>
          <RunSummaryArtifactName>lib/billing/notify.test.ts</RunSummaryArtifactName>
          <RunSummaryArtifactMeta>+58 −12</RunSummaryArtifactMeta>
        </RunSummaryArtifact>
        <RunSummaryArtifact change="deleted">
          <RunSummaryArtifactName>templates/receipt.html</RunSummaryArtifactName>
          <RunSummaryArtifactMeta>−210</RunSummaryArtifactMeta>
        </RunSummaryArtifact>
      </RunSummaryArtifacts>
      <RunSummaryWarnings>
        <RunSummaryWarning>
          The Spanish receipt still uses the old footer. No translation for “VAT ID” was found.
        </RunSummaryWarning>
        <RunSummaryWarning>Snapshot tests were updated, not reviewed.</RunSummaryWarning>
      </RunSummaryWarnings>
      <RunSummaryNextSteps>
        <RunSummaryNextStep>Review the updated receipt snapshots.</RunSummaryNextStep>
        <RunSummaryNextStep>Add the Spanish “VAT ID” string to the locale file.</RunSummaryNextStep>
      </RunSummaryNextSteps>
      <RunSummaryActions>
        <RunSummaryAction>View diff</RunSummaryAction>
        <RunSummaryAction primary>Open pull request</RunSummaryAction>
      </RunSummaryActions>
    </RunSummary>
  );
}
