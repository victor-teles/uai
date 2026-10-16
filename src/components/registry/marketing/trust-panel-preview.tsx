import { LockKeyhole, ShieldCheck } from "lucide-react";
import {
  TrustPanel,
  TrustPanelBadge,
  TrustPanelBadges,
  TrustPanelLogo,
  TrustPanelLogos,
  TrustPanelRating,
  TrustPanelTitle,
  type TrustPanelVariant,
} from "@/components/ui/uai/trust-panel";

const customers = [
  { name: "Brightmoor", mark: <circle cx="8" cy="8" r="7" /> },
  { name: "Quillon", mark: <rect x="1" y="1" width="14" height="14" rx="3" /> },
  { name: "Tessaline", mark: <path d="M8 1 15 15H1z" /> },
  { name: "Orvik", mark: <path d="M1 8a7 7 0 0 1 14 0z" /> },
  { name: "Calder", mark: <rect x="1" y="5" width="14" height="6" rx="3" /> },
  { name: "Lumen Row", mark: <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="3" /> },
];

export function TrustPanelPreview({ variant = "card" }: { variant?: TrustPanelVariant }) {
  return (
    <TrustPanel variant={variant}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <TrustPanelTitle>
          <b>2,400</b> operations teams run their week on Ferrow
        </TrustPanelTitle>
        <TrustPanelRating
          value={4.8}
          className={variant === "card" ? "justify-items-end" : undefined}
        >
          1,240 verified reviews on G2
        </TrustPanelRating>
      </div>
      <TrustPanelLogos>
        {customers.map((customer) => (
          <TrustPanelLogo key={customer.name} name={customer.name}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              {customer.mark}
            </svg>
            {customer.name}
          </TrustPanelLogo>
        ))}
      </TrustPanelLogos>
      <TrustPanelBadges aria-label="Security and compliance">
        <TrustPanelBadge>
          <b>SOC 2 Type II</b> report on request
        </TrustPanelBadge>
        <TrustPanelBadge icon={<ShieldCheck size={13} aria-hidden="true" />}>
          <b>ISO/IEC 27001</b> certified
        </TrustPanelBadge>
        <TrustPanelBadge icon={<LockKeyhole size={13} aria-hidden="true" />}>
          <b>AES-256</b> at rest and in transit
        </TrustPanelBadge>
      </TrustPanelBadges>
    </TrustPanel>
  );
}
