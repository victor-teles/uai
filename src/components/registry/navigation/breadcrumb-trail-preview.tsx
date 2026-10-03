"use client";

import {
  BreadcrumbTrail,
  BreadcrumbTrailCollapsed,
  BreadcrumbTrailItem,
  type BreadcrumbTrailVariant,
} from "@/components/ui/uai/breadcrumb-trail";

export function BreadcrumbTrailPreview({
  variant = "chevron",
}: {
  variant?: BreadcrumbTrailVariant;
}) {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <BreadcrumbTrail variant={variant}>
        <BreadcrumbTrailItem href="#workspace">Northwind</BreadcrumbTrailItem>
        <BreadcrumbTrailCollapsed label="Show 2 more levels">
          <BreadcrumbTrailItem href="#projects">Projects</BreadcrumbTrailItem>
          <BreadcrumbTrailItem href="#launches">2026 launches</BreadcrumbTrailItem>
        </BreadcrumbTrailCollapsed>
        <BreadcrumbTrailItem href="#q3" parent>
          Q3 mobile release
        </BreadcrumbTrailItem>
        <BreadcrumbTrailItem current>Accessibility review checklist</BreadcrumbTrailItem>
      </BreadcrumbTrail>
      <BreadcrumbTrail variant={variant} compact aria-label="Breadcrumb, compact">
        <BreadcrumbTrailItem href="#workspace">Northwind</BreadcrumbTrailItem>
        <BreadcrumbTrailItem href="#q3" parent>
          Q3 mobile release
        </BreadcrumbTrailItem>
        <BreadcrumbTrailItem current>Accessibility review checklist</BreadcrumbTrailItem>
      </BreadcrumbTrail>
    </div>
  );
}
