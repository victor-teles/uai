"use client";

import { Menu, Moon, Search, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { getRegistryItemKind, registryCatalog, registryGroups } from "./catalog";
import { CommandPalette } from "./command-palette";

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

function Brand() {
  return (
    <Link href="/" className="uai-brand" aria-label="Uai home">
      <span className="uai-brand__mark" aria-hidden="true" />
      <span className="uai-wordmark" aria-hidden="true">
        ai
      </span>
    </Link>
  );
}

function SidebarNav({ pathname }: { pathname: string }) {
  const navRef = useRef<HTMLElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-center the active link after each navigation.
  useEffect(() => {
    // Scroll only the nav list; scrollIntoView would also scroll the page.
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active) return;
    nav.scrollTop = active.offsetTop - nav.offsetTop - (nav.clientHeight - active.offsetHeight) / 2;
  }, [pathname]);

  return (
    <nav ref={navRef} className="uai-site-nav" aria-label="Components">
      <Link
        href="/"
        className="uai-site-nav__link"
        aria-current={pathname === "/" ? "page" : undefined}
      >
        Overview
      </Link>
      {registryGroups.map((group) => (
        <section key={group.category} className="uai-site-nav__group" aria-label={group.category}>
          <h2>{group.category}</h2>
          <ul>
            {group.items.map((item) => {
              const href = `/components/${item.id}`;
              return (
                <li key={item.id}>
                  <Link
                    href={href}
                    className="uai-site-nav__link"
                    aria-current={pathname === href ? "page" : undefined}
                  >
                    {item.name}
                    {getRegistryItemKind(item.id) === "block" ? (
                      <span className="uai-site-nav__tag">Block</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}

function SearchButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="uai-site-search" aria-keyshortcuts="Meta+K /" onClick={onOpen}>
      <Search aria-hidden="true" />
      <span>Search</span>
      <kbd>⌘K</kbd>
    </button>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className="uai-site">
      <div className="uai-site__frame">
        <header className="uai-site-mobilebar">
          <Brand />
          <div className="uai-site-mobilebar__actions">
            <button
              type="button"
              className="uai-icon-button"
              aria-label="Search"
              onClick={openPalette}
            >
              <Search aria-hidden="true" />
            </button>
            <button
              type="button"
              className="uai-icon-button"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="uai-site-sidebar"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </header>

        <aside id="uai-site-sidebar" className="uai-site-sidebar" data-open={menuOpen || undefined}>
          <div className="uai-site-sidebar__top">
            <div className="uai-site-sidebar__brandrow">
              <Brand />
              <ThemeToggle />
            </div>
            <p className="uai-site-sidebar__tagline">
              Beautiful, source-owned UI for web products.
            </p>
            <SearchButton onOpen={openPalette} />
          </div>
          <SidebarNav pathname={pathname} />
          <p className="uai-site-sidebar__footer">
            {registryCatalog.length - blockCount} components · {blockCount} blocks
            <br />
            Installed with the shadcn CLI.
          </p>
        </aside>

        <div className="uai-site-main">{children}</div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
