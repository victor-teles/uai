import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AppSidebarItem,
  AppSidebarItemLabel,
  AppSidebarList,
  AppSidebarNav,
} from "@/components/ui/uai/app-sidebar";
import { BreadcrumbTrailItem } from "@/components/ui/uai/breadcrumb-trail";
import {
  DOCUMENTATION_PAGE_VARIANTS,
  DocumentationPage,
  DocumentationPageAction,
  DocumentationPageActions,
  DocumentationPageBreadcrumb,
  DocumentationPageContent,
  DocumentationPageHeader,
  DocumentationPageMain,
  DocumentationPageNav,
  DocumentationPagePager,
  DocumentationPagePagerLink,
  type DocumentationPageProps,
  DocumentationPageSection,
  DocumentationPageSectionTitle,
  DocumentationPageTitle,
  DocumentationPageToc,
  DocumentationPageTocItem,
  DocumentationPageTocList,
  DocumentationPageTocTitle,
} from "@/registry/uai/blocks/documentation-page";

function Fixture(props: Omit<DocumentationPageProps, "children">) {
  return (
    <DocumentationPage defaultActiveSection="install" {...props}>
      <DocumentationPageNav defaultValue="cache" mobileQuery="(max-width: 1px)">
        <AppSidebarNav aria-label="Documentation">
          <AppSidebarList>
            <AppSidebarItem value="cache">
              <AppSidebarItemLabel>Build cache</AppSidebarItemLabel>
            </AppSidebarItem>
          </AppSidebarList>
        </AppSidebarNav>
      </DocumentationPageNav>
      <DocumentationPageToc>
        <DocumentationPageTocTitle>On this page</DocumentationPageTocTitle>
        <DocumentationPageTocList>
          <DocumentationPageTocItem section="install">Install</DocumentationPageTocItem>
          <DocumentationPageTocItem section="ci" level={3}>
            CI
          </DocumentationPageTocItem>
        </DocumentationPageTocList>
      </DocumentationPageToc>
      <DocumentationPageMain>
        <DocumentationPageHeader>
          <DocumentationPageBreadcrumb compact={false}>
            <BreadcrumbTrailItem href="#docs">Docs</BreadcrumbTrailItem>
            <BreadcrumbTrailItem current>Build cache</BreadcrumbTrailItem>
          </DocumentationPageBreadcrumb>
          <DocumentationPageTitle>Build cache</DocumentationPageTitle>
          <DocumentationPageActions>
            <DocumentationPageAction>Copy link</DocumentationPageAction>
          </DocumentationPageActions>
        </DocumentationPageHeader>
        <DocumentationPageContent>
          <DocumentationPageSection id="install">
            <DocumentationPageSectionTitle>Install</DocumentationPageSectionTitle>
          </DocumentationPageSection>
          <DocumentationPageSection id="ci">
            <DocumentationPageSectionTitle>CI</DocumentationPageSectionTitle>
          </DocumentationPageSection>
        </DocumentationPageContent>
        <DocumentationPagePager>
          <DocumentationPagePagerLink direction="next" href="#config">
            Configuration
          </DocumentationPagePagerLink>
        </DocumentationPagePager>
      </DocumentationPageMain>
    </DocumentationPage>
  );
}

test("labels navigation, the table of contents, the article, and its sections", () => {
  render(<Fixture />);
  expect(screen.getByRole("navigation", { name: "Documentation" })).toBeTruthy();
  expect(screen.getByRole("navigation", { name: "On this page" })).toBeTruthy();
  expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
  expect(screen.getByRole("article", { name: "Build cache" })).toBeTruthy();
  expect(screen.getByRole("region", { name: "CI" }).id).toBe("ci");
  expect(screen.getByRole("group", { name: "Page actions" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Next Configuration" }).getAttribute("rel")).toBe("next");
});

test("marks the active section and moves it when a link is selected", async () => {
  const user = userEvent.setup();
  const onActiveSectionChange = mock();
  render(<Fixture onActiveSectionChange={onActiveSectionChange} />);
  const install = screen.getByRole("link", { name: "Install" });
  const ci = screen.getByRole("link", { name: "CI" });
  expect(install.getAttribute("aria-current")).toBe("location");
  expect(ci.getAttribute("href")).toBe("#ci");
  ci.focus();
  await user.keyboard("{Enter}");
  expect(onActiveSectionChange).toHaveBeenCalledWith("ci");
  expect(ci.getAttribute("aria-current")).toBe("location");
  expect(install.getAttribute("aria-current")).toBeNull();
});

test("respects a controlled active section", async () => {
  const user = userEvent.setup();
  render(<Fixture activeSection="install" />);
  await user.click(screen.getByRole("link", { name: "CI" }));
  expect(screen.getByRole("link", { name: "Install" }).getAttribute("aria-current")).toBe(
    "location",
  );
});

test("renders every variant and guards its parts", () => {
  for (const variant of DOCUMENTATION_PAGE_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("[data-uai-docs]")?.getAttribute("data-variant")).toBe(
      variant,
    );
    view.unmount();
  }
  expect(() => render(<DocumentationPageTitle />)).toThrow(
    "DocumentationPageTitle must be used within DocumentationPage",
  );
  expect(() =>
    render(
      <DocumentationPage>
        <DocumentationPageSectionTitle />
      </DocumentationPage>,
    ),
  ).toThrow("DocumentationPageSectionTitle must be used within DocumentationPageSection");
});
