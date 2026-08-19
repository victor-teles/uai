import type { ReactNode, SVGProps } from "react";

export type IconName = "check" | "chevron" | "file" | "loader" | "search" | "tool" | "update";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export const Icon = ({ name, ...props }: IconProps) => {
  const paths = {
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </>
    ),
    loader: (
      <>
        <path d="M21 12a9 9 0 1 1-6.22-8.56" opacity="0.3" />
        <path d="M21 12a9 9 0 0 0-2.64-6.36" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    tool: (
      <path d="M14.7 6.3a4 4 0 0 0-5-5l2.1 2.1-3.4 3.4-2.1-2.1a4 4 0 0 0 5 5l-6.6 6.6a2.1 2.1 0 1 0 3 3l6.6-6.6a4 4 0 0 0 5-5l-2.1 2.1-3.4-3.4Z" />
    ),
    update: <circle cx="12" cy="12" r="7" />,
  } satisfies Record<IconName, ReactNode>;

  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};
