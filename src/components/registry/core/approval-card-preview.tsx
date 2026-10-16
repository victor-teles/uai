"use client";

import { useEffect, useRef, useState } from "react";
import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardConfirmation,
  ApprovalCardDetail,
  ApprovalCardDetails,
  ApprovalCardError,
  ApprovalCardHeader,
  ApprovalCardReject,
  type ApprovalCardStatus,
  type ApprovalDecision,
} from "@/components/ui/uai/approval-card";

export const approvalScenarios = ["compact", "detailed", "critical", "error"] as const;
export type ApprovalScenario = (typeof approvalScenarios)[number];

type ApprovalPreviewState =
  | { status: Exclude<ApprovalCardStatus, "submitting" | "error"> }
  | { status: "submitting"; pendingDecision: ApprovalDecision }
  | { status: "error" };

export function ApprovalCardPreview({ scenario = "compact" }: { scenario?: ApprovalScenario }) {
  const [state, setState] = useState<ApprovalPreviewState>({ status: "ready" });
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setState(scenario === "error" ? { status: "error" } : { status: "ready" });
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [scenario]);

  const decide = (decision: ApprovalDecision) => {
    setState({ status: "submitting", pendingDecision: decision });
    timerRef.current = window.setTimeout(() => setState({ status: decision }), 900);
  };

  return (
    <>
      {scenario === "compact" ? (
        <ApprovalCard key={scenario} {...state} risk="low">
          <ApprovalCardHeader
            title="Archive 3 resolved conversations?"
            description="They remain searchable and can be restored later."
          />
          <ApprovalDecisionActions decide={decide} />
        </ApprovalCard>
      ) : scenario === "critical" ? (
        <ApprovalCard
          key={scenario}
          {...state}
          risk="critical"
          variant="detailed"
          confirmation={{ phrase: "support-search-prod" }}
        >
          <ApprovalCardHeader
            title="Delete the production search index?"
            description="This removes the index and every replica. It cannot be undone."
          />
          <ApprovalCardDetails>
            <DetailedApprovalContent critical />
          </ApprovalCardDetails>
          <ApprovalCardConfirmation />
          <ApprovalDecisionActions decide={decide} approveLabel="Delete index" />
        </ApprovalCard>
      ) : (
        <ApprovalCard key={scenario} {...state} risk="high" variant="detailed">
          <ApprovalCardHeader
            title="Deploy the generated refund policy?"
            description="This changes how new customer refunds are routed."
          />
          <ApprovalCardDetails>
            <DetailedApprovalContent />
          </ApprovalCardDetails>
          <ApprovalCardError>
            The approval service did not respond. Review the impact and try again.
          </ApprovalCardError>
          <ApprovalDecisionActions
            decide={decide}
            approveLabel={scenario === "error" ? "Try again" : "Deploy policy"}
          />
        </ApprovalCard>
      )}
    </>
  );
}

function DetailedApprovalContent({ critical = false }: { critical?: boolean }) {
  return (
    <>
      <ApprovalCardDetail label="Requested by">Operations agent · Refund triage</ApprovalCardDetail>
      <ApprovalCardDetail label="Affected resources">
        {critical ? "support-search-prod · 8.2M indexed records" : "refund-policy-v4 · 3 queues"}
      </ApprovalCardDetail>
      <ApprovalCardDetail label="Proposed changes">
        <ul>
          <li>
            {critical ? "Delete the production search index" : "Route refunds over $500 to review"}
          </li>
          <li>
            {critical ? "Remove its replicas and stored vectors" : "Notify the operations lead"}
          </li>
        </ul>
      </ApprovalCardDetail>
      <ApprovalCardDetail label="Supporting evidence">
        {critical
          ? "No restorable snapshot exists."
          : "A 14-day replay matched 98.6% of prior decisions."}
      </ApprovalCardDetail>
      <ApprovalCardDetail label="Downstream impact" className="sm:col-span-2">
        {critical
          ? "Search will be unavailable until the index is rebuilt from source documents."
          : "New refund requests begin using this policy immediately after approval."}
      </ApprovalCardDetail>
    </>
  );
}

function ApprovalDecisionActions({
  decide,
  approveLabel,
}: {
  decide: (decision: ApprovalDecision) => void;
  approveLabel?: string;
}) {
  return (
    <ApprovalCardActions>
      <ApprovalCardReject onClick={() => decide("rejected")} />
      <ApprovalCardApprove onClick={() => decide("approved")}>{approveLabel}</ApprovalCardApprove>
    </ApprovalCardActions>
  );
}
