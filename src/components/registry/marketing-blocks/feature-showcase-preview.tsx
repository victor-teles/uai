import {
  FeatureShowcase,
  FeatureShowcaseContent,
  FeatureShowcaseDescription,
  FeatureShowcaseDetails,
  FeatureShowcaseHeader,
  FeatureShowcaseItem,
  FeatureShowcaseItemDescription,
  FeatureShowcaseItemTitle,
  FeatureShowcaseLabel,
  FeatureShowcaseList,
  FeatureShowcaseMedia,
  FeatureShowcaseTitle,
  type FeatureShowcaseVariant,
} from "@/components/uai/feature-showcase";
import {
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";

const features = [
  {
    label: "Routing",
    title: "Requests reach the right crew on their own",
    description:
      "Rules read the address, trade, and urgency of each request, then assign it to whoever is closest and free.",
    detail: ["Median assignment", "under 2 minutes"],
    bars: [72, 48, 60],
  },
  {
    label: "Scheduling",
    title: "A calendar that respects travel time",
    description:
      "Visits are spaced by real driving distance, so dispatchers stop double-booking the far side of town.",
    detail: ["Drive time saved", "41 minutes a day"],
    bars: [40, 80, 56],
  },
  {
    label: "Updates",
    title: "Customers know when someone is on the way",
    description:
      "Arrival windows go out by text and email, and replies land back in the same conversation.",
    detail: ["Fewer “where are you” calls", "38% drop"],
    bars: [64, 36, 76],
  },
];

export function FeatureShowcasePreview({
  variant = "alternating",
}: {
  variant?: FeatureShowcaseVariant;
}) {
  return (
    <FeatureShowcase variant={variant}>
      <FeatureShowcaseHeader>
        <FeatureShowcaseTitle>Less dispatching, more finished jobs</FeatureShowcaseTitle>
        <FeatureShowcaseDescription>
          Three parts of the day that Ferrow takes off a coordinator’s desk.
        </FeatureShowcaseDescription>
      </FeatureShowcaseHeader>
      <FeatureShowcaseList>
        {features.map((feature) => (
          <FeatureShowcaseItem key={feature.label}>
            <FeatureShowcaseContent>
              <FeatureShowcaseLabel>{feature.label}</FeatureShowcaseLabel>
              <FeatureShowcaseItemTitle>{feature.title}</FeatureShowcaseItemTitle>
              <FeatureShowcaseItemDescription>{feature.description}</FeatureShowcaseItemDescription>
              <FeatureShowcaseDetails>
                <DescriptionListItem>
                  <DescriptionListTerm>{feature.detail[0]}</DescriptionListTerm>
                  <DescriptionListDetails>{feature.detail[1]}</DescriptionListDetails>
                </DescriptionListItem>
              </FeatureShowcaseDetails>
            </FeatureShowcaseContent>
            <FeatureShowcaseMedia>
              <svg
                aria-hidden="true"
                viewBox="0 0 160 120"
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                style={{ display: "block" }}
              >
                <rect
                  x="16"
                  y="16"
                  width="128"
                  height="88"
                  rx="8"
                  fill="var(--uai-surface-raised)"
                />
                {feature.bars.map((width, index) => (
                  <rect
                    key={width}
                    x="28"
                    y={32 + index * 22}
                    width={width}
                    height="10"
                    rx="5"
                    fill={index === 0 ? "var(--uai-text)" : "var(--uai-border-strong)"}
                  />
                ))}
              </svg>
            </FeatureShowcaseMedia>
          </FeatureShowcaseItem>
        ))}
      </FeatureShowcaseList>
    </FeatureShowcase>
  );
}
