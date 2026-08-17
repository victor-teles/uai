import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="uai-brand">
          <span className="uai-brand__mark" aria-hidden="true" />
          <span className="uai-wordmark">uai</span>
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
