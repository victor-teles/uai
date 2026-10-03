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
  { name: "Calder Works", mark: <rect x="1" y="5" width="14" height="6" rx="3" /> },
  { name: "Lumen Row", mark: <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="3" /> },
];

export function TrustPanelPreview({ variant = "card" }: { variant?: TrustPanelVariant }) {
  return (
    <TrustPanel variant={variant}>
      <TrustPanelTitle>Trusted by 2,400 operations teams</TrustPanelTitle>
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
      <TrustPanelRating value={4.8}>from 1,240 verified reviews</TrustPanelRating>
      <TrustPanelBadges aria-label="Security and compliance">
        <TrustPanelBadge>SOC 2 Type II report</TrustPanelBadge>
        <TrustPanelBadge icon={<ShieldCheck size={14} aria-hidden="true" />}>
          ISO/IEC 27001 certified
        </TrustPanelBadge>
        <TrustPanelBadge icon={<LockKeyhole size={14} aria-hidden="true" />}>
          Encrypted at rest and in transit
        </TrustPanelBadge>
      </TrustPanelBadges>
    </TrustPanel>
  );
}
