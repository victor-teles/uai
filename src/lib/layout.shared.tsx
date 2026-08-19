import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="uai-brand" role="img" aria-label="Uai">
          <span className="uai-brand__mark" aria-hidden="true" />
          <span className="uai-wordmark" aria-hidden="true">
            ai
          </span>
        </span>
      ),
    },
    searchToggle: {
      enabled: false,
    },
    links: [
      {
        text: "Components",
        url: "/",
        active: "nested-url",
      },
    ],
  };
}
