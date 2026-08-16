import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <span className="uai-wordmark">uai</span>,
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
