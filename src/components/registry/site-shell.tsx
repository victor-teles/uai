"use client";

import {
  BookOpen,
  ChevronRight,
  FileCode2,
  Folder,
  Menu,
  Moon,
  Palette,
  PanelsTopLeft,
  Search,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { findRegistryItem, getRegistryItemKind, registryCatalog, registryGroups } from "./catalog";
import { CommandPalette } from "./command-palette";
import { PaoDeQueijoBurst } from "./pao-de-queijo";
import { ResizeHandle, usePersistentSize } from "./resize-handle";

const sidebarBounds = { defaultValue: 248, min: 200, max: 420 };

const blockCount = registryCatalog.filter(
  (item) => getRegistryItemKind(item.id) === "block",
).length;

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const theme = mounted ? resolvedTheme : undefined;

  return (
    <fieldset className="uai-theme-toggle">
      <legend className="sr-only">Color theme</legend>
      <button
        type="button"
        aria-label="Light theme"
        aria-pressed={theme === "light"}
        onClick={() => setTheme("light")}
      >
        <Sun aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Dark theme"
        aria-pressed={theme === "dark"}
        onClick={() => setTheme("dark")}
      >
        <Moon aria-hidden="true" />
      </button>
    </fieldset>
  );
}

function Brand({ onClick }: { onClick: (event: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <Link href="/" className="uai-brand" aria-label="Uai home" onClick={onClick}>
      <span className="uai-brand__tile" aria-hidden="true">
        <span className="uai-brand__mark" />
      </span>
      <span className="uai-wordmark" aria-hidden="true">
        ai
      </span>
    </Link>
  );
}

function folderName(category: string) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

function findGroup(pathname: string) {
  return registryGroups.find((group) =>
    group.items.some((item) => pathname === `/components/${item.id}`),
  )?.category;
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const id = pathname.startsWith("/components/") ? pathname.slice("/components/".length) : null;
  const item = id ? findRegistryItem(id) : undefined;
  const trail = item
    ? [folderName(item.category), `${item.id}.tsx`]
    : [pathname === "/theming" ? "theming" : "overview"];

  return (
    <p className="uai-site-crumbs">
      {trail.map((segment, index) => (
        <span key={segment} aria-current={index === trail.length - 1 ? "page" : undefined}>
          {segment}
        </span>
      ))}
    </p>
  );
}

function SidebarNav({ pathname }: { pathname: string }) {
  const navRef = useRef<HTMLElement>(null);
  const currentGroup = findGroup(pathname);
  const [openGroups, setOpenGroups] = useState<ReadonlySet<string>>(
    () => new Set(currentGroup ? [currentGroup] : []),
  );

  // Reveal the folder that holds the current page after each navigation.
  useEffect(() => {
    if (!currentGroup) return;
    setOpenGroups((groups) =>
      groups.has(currentGroup) ? groups : new Set(groups).add(currentGroup),
    );
  }, [currentGroup]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-center the active link after each navigation.
  useEffect(() => {
    // Scroll only the nav list; scrollIntoView would also scroll the page.
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active) return;
    nav.scrollTop = active.offsetTop - nav.offsetTop - (nav.clientHeight - active.offsetHeight) / 2;
  }, [pathname]);

  const toggleGroup = (category: string) =>
    setOpenGroups((groups) => {
      const nextGroups = new Set(groups);
      if (!nextGroups.delete(category)) nextGroups.add(category);
      return nextGroups;
    });

  return (
    <nav ref={navRef} className="uai-site-nav" aria-label="Components">
      <Link
        href="/"
        className="uai-site-nav__link"
        aria-current={pathname === "/" ? "page" : undefined}
      >
        <BookOpen aria-hidden="true" />
        overview
      </Link>
      <Link
        href="/theming"
        className="uai-site-nav__link"
        aria-current={pathname === "/theming" ? "page" : undefined}
      >
        <Palette aria-hidden="true" />
        theming
      </Link>
      {registryGroups.map((group) => {
        const open = openGroups.has(group.category);
        const listId = `uai-nav-${folderName(group.category)}`;
        return (
          <section
            key={group.category}
            className="uai-site-nav__group"
            data-open={open || undefined}
          >
            <button
              type="button"
              className="uai-site-nav__folder"
              aria-expanded={open}
              aria-controls={listId}
              onClick={() => toggleGroup(group.category)}
            >
              <ChevronRight aria-hidden="true" className="uai-site-nav__chevron" />
              <Folder aria-hidden="true" />
              {folderName(group.category)}
              <span className="uai-site-nav__count">{group.items.length}</span>
            </button>
            <ul id={listId} hidden={!open}>
              {group.items.map((item) => {
                const href = `/components/${item.id}`;
                const block = getRegistryItemKind(item.id) === "block";
                const Icon = block ? PanelsTopLeft : FileCode2;
                return (
                  <li key={item.id}>
                    <Link
                      href={href}
                      className="uai-site-nav__link uai-site-nav__link--file"
                      aria-current={pathname === href ? "page" : undefined}
                      title={item.name}
                    >
                      <Icon aria-hidden="true" />
                      {item.id}
                      {block ? <span className="sr-only"> (block)</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </nav>
  );
}

function SearchButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="uai-site-search" aria-keyshortcuts="Meta+K /" onClick={onOpen}>
      <Search aria-hidden="true" />
      <span>Jump to…</span>
      <kbd>⌘K</kbd>
    </button>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebar = usePersistentSize("uai:sidebar-width", sidebarBounds);
  const [pdq, setPdq] = useState<{ burst: number; origin: { x: number; y: number } | null }>({
    burst: 0,
    origin: null,
  });

  // Easter egg: a triple click on the logo serves pão de queijo.
  const onBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.detail !== 3) return;
    const box = event.currentTarget.getBoundingClientRect();
    setPdq((current) => ({
      burst: current.burst + 1,
      origin: { x: box.left + 11, y: box.top + box.height / 2 },
    }));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: close the mobile menu after navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing = target?.closest("input, textarea, select, [contenteditable='true']");
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      } else if (event.key === "/" && !editing) {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openPalette = () => setPaletteOpen(true);

  return (
    <div
      className="uai-site"
      style={{ "--uai-sidebar-width": `${sidebar.size}px` } as CSSProperties}
    >
      <header className="uai-site-topbar">
        <button
          type="button"
          className="uai-icon-button uai-site-topbar__menu"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="uai-site-sidebar"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <Brand onClick={onBrandClick} />
        <Breadcrumbs pathname={pathname} />
        <div className="uai-site-topbar__actions">
          <SearchButton onOpen={openPalette} />
          <ThemeToggle />
        </div>
      </header>

      <aside id="uai-site-sidebar" className="uai-site-sidebar" data-open={menuOpen || undefined}>
        <SidebarNav pathname={pathname} />
        <p className="uai-site-sidebar__footer">
          {registryCatalog.length - blockCount} components · {blockCount} blocks
        </p>
        <ResizeHandle
          label="Resize sidebar"
          axis="x"
          grow="forward"
          size={sidebar.size}
          bounds={sidebarBounds}
          onResize={sidebar.setSize}
          onReset={sidebar.reset}
          className="uai-site-sidebar__handle"
        />
      </aside>

      <main className="uai-site-main">{children}</main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <PaoDeQueijoBurst burst={pdq.burst} origin={pdq.origin} />
    </div>
  );
}
