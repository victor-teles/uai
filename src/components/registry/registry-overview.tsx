import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { InstallCommand } from "@/components/install-command";
import { getRegistryItemKind, getRegistryPosition, registryGroups } from "./catalog";
import { RegistryPreview } from "./registry-preview";

export function RegistryOverview() {
  return (
    <article className="uai-doc uai-overview" aria-labelledby="uai-overview-title">
      <header className="uai-overview__intro">
        <h1 id="uai-overview-title">Open-code components for websites and web apps.</h1>
        <p>
          Uai is a shadcn registry of compound React components and page blocks. The CLI copies
          every line into your project, so you own the markup, the styles, and the behavior.
        </p>
        <InstallCommand item="prompt-composer" />
      </header>

      <RegistryPreview itemId="prompt-composer" />

      {registryGroups.map((group) => (
        <section
          key={group.category}
          className="uai-doc__section"
          aria-labelledby={`uai-group-${group.category}`}
        >
          <div className="uai-doc__section-head">
            <h2 id={`uai-group-${group.category}`}>{group.category}</h2>
            <span className="uai-doc__count">{group.items.length}</span>
          </div>
          <ul className="uai-overview__grid">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link href={`/components/${item.id}`} className="uai-overview__card">
                    <span className="uai-overview__card-top">
                      <Icon aria-hidden="true" />
                      <span className="uai-overview__number">
                        {getRegistryPosition(item.id).number}
                      </span>
                      <ArrowUpRight aria-hidden="true" className="uai-overview__arrow" />
                    </span>
                    <span className="uai-overview__name">
                      {item.name}
                      {getRegistryItemKind(item.id) === "block" ? (
                        <span className="uai-site-nav__tag">Block</span>
                      ) : null}
                    </span>
                    <span className="uai-overview__description">{item.description}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </article>
  );
}
