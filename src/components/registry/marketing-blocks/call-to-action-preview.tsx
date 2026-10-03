import {
  CallToAction,
  CallToActionAction,
  CallToActionActions,
  CallToActionContent,
  CallToActionDescription,
  CallToActionReassurance,
  CallToActionReassuranceItem,
  CallToActionTitle,
  type CallToActionVariant,
} from "@/components/uai/call-to-action";

export function CallToActionPreview({ variant = "banner" }: { variant?: CallToActionVariant }) {
  return (
    <CallToAction variant={variant}>
      <CallToActionContent>
        <CallToActionTitle>Route tomorrow’s requests with Ferrow</CallToActionTitle>
        <CallToActionDescription>
          Connect your inbox in ten minutes. Your first week of jobs imports automatically.
        </CallToActionDescription>
      </CallToActionContent>
      <CallToActionActions>
        <CallToActionAction href="#start-trial">Start a 14-day trial</CallToActionAction>
        <CallToActionAction href="#demo" priority="secondary">
          Book a 20-minute demo
        </CallToActionAction>
      </CallToActionActions>
      <CallToActionReassurance aria-label="Trial terms">
        <CallToActionReassuranceItem>No card required</CallToActionReassuranceItem>
        <CallToActionReassuranceItem>Cancel from settings</CallToActionReassuranceItem>
        <CallToActionReassuranceItem>Keep your data if you leave</CallToActionReassuranceItem>
      </CallToActionReassurance>
    </CallToAction>
  );
}
