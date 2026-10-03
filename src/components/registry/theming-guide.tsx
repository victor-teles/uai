import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";

import { InstallCommand } from "@/components/install-command";
import { CopyButton } from "./copy-button";
import { themeCss } from "./theme-css";

const utilsSource = readFileSync(join(process.cwd(), "src/registry/uai/lib/uai-utils.ts"), "utf8");

const dependencies =
  "bun add class-variance-authority clsx tailwind-merge tw-animate-css lucide-react";

const tokens = [
  { token: "background", utility: "bg-background", use: "Page canvas behind cards." },
  { token: "card", utility: "bg-card", use: "Cards, panels, and fields." },
  { token: "popover", utility: "bg-popover", use: "Menus, dialogs, and popovers." },
  { token: "muted", utility: "bg-muted", use: "Tonal fills, chips, and wells." },
  { token: "accent", utility: "hover:bg-accent", use: "Hover and selected rows." },
  { token: "secondary", utility: "bg-secondary", use: "Secondary pill buttons." },
  { token: "foreground", utility: "text-foreground", use: "Headings and primary labels." },
  { token: "muted-foreground", utility: "text-muted-foreground", use: "Body copy and labels." },
  {
    token: "subtle-foreground",
    utility: "text-subtle-foreground",
    use: "Tertiary metadata: counts, timestamps, captions.",
  },
  { token: "primary", utility: "bg-primary", use: "The one primary action per surface." },
  { token: "border", utility: "border", use: "Hairlines." },
  {
    token: "border-strong",
    utility: "border-border-strong",
    use: "Focused fields and menu outlines.",
  },
  { token: "ring", utility: "outline-ring", use: "Keyboard focus." },
  { token: "success", utility: "bg-success/14 text-success", use: "Positive status." },
  { token: "warning", utility: "bg-warning/14 text-warning", use: "Cautionary status." },
  { token: "destructive", utility: "bg-destructive/14", use: "Errors and destructive actions." },
] as const;

const tokenOverride = `:root {
  --primary: oklch(0.6 0.2 300);
  --radius: 0.5rem;
}

.dark {
  --primary: oklch(0.7 0.18 300);
}`;

const classOverride = `<MetricCard variant="compact" className="rounded-none border-0 bg-muted">
  <MetricCardLabel className="text-foreground">Revenue</MetricCardLabel>
  <MetricCardValue>$48,290</MetricCardValue>
</MetricCard>`;

function Code({ code, lang, label }: { code: string; lang: string; label: string }) {
  return (
    <div className="uai-code-card uai-theming__code">
      <div className="uai-theming__code-copy">
        <CopyButton text={code} label={label} />
      </div>
      <DynamicCodeBlock
        lang={lang}
        code={code}
        codeblock={{
          allowCopy: false,
          className: "uai-syntax-codeblock uai-syntax-codeblock--source",
        }}
      />
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="uai-doc__section" aria-labelledby={id}>
      <div className="uai-doc__section-head">
        <h2 id={id}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function ThemingGuide() {
  return (
    <article className="uai-doc uai-theming" aria-labelledby="uai-doc-title">
      <header className="uai-doc__header">
        <span className="uai-doc__number" aria-hidden="true" />
        <div>
          <h1 id="uai-doc-title">Theming</h1>
          <p>
            Uai components read the standard shadcn theme tokens, so they follow whatever theme your
            project defines. The Uai theme fills those tokens with a warm graphite palette.
          </p>
        </div>
        <span className="uai-doc__meta">Guide</span>
      </header>

      <Section id="uai-theming-cli" title="Install the theme">
        <p className="uai-theming__text">
          Every component installs the theme as a dependency. To set it up on its own, run the
          command once. The CLI writes the light and dark tokens into your global CSS and adds{" "}
          <code>tw-animate-css</code>.
        </p>
        <InstallCommand item="uai-theme" />
        <p className="uai-theming__text">
          Already have a shadcn theme you like? Skip this step. Components use your{" "}
          <code>background</code>, <code>card</code>, <code>primary</code>, and{" "}
          <code>muted-foreground</code> tokens. Add the four Uai extensions from the CSS below:{" "}
          <code>subtle-foreground</code>, <code>border-strong</code>, <code>success</code>, and{" "}
          <code>warning</code>.
        </p>
      </Section>

      <Section id="uai-theming-manual" title="Manual installation">
        <ol className="uai-theming__steps">
          <li>
            <p className="uai-theming__text">Install the dependencies.</p>
            <Code code={dependencies} lang="bash" label="Copy dependency command" />
          </li>
          <li>
            <p className="uai-theming__text">
              Add the theme to your global CSS file, such as <code>app/globals.css</code>.
            </p>
            <Code code={themeCss} lang="css" label="Copy theme CSS" />
          </li>
          <li>
            <p className="uai-theming__text">
              Create <code>lib/uai-utils.ts</code>. Every component merges your{" "}
              <code>className</code> through this helper.
            </p>
            <Code code={utilsSource} lang="ts" label="Copy cn helper" />
          </li>
          <li>
            <p className="uai-theming__text">
              Copy a component's source from its page into <code>components/ui/uai</code>.
            </p>
          </li>
        </ol>
      </Section>

      <Section id="uai-theming-tokens" title="Tokens">
        <div className="uai-theming__table-wrap">
          <table className="uai-theming__table">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Utility</th>
                <th scope="col">Used for</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((row) => (
                <tr key={row.token}>
                  <th scope="row">
                    <span
                      className="uai-theming__swatch"
                      style={{ background: `var(--${row.token})` }}
                      aria-hidden="true"
                    />
                    <code>--{row.token}</code>
                  </th>
                  <td>
                    <code>{row.utility}</code>
                  </td>
                  <td>{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="uai-theming-customize" title="Customize">
        <p className="uai-theming__text">
          Change a token to restyle every component at once. Override both themes if you support
          dark mode.
        </p>
        <Code code={tokenOverride} lang="css" label="Copy token override" />
        <p className="uai-theming__text">
          Change a single instance with <code>className</code>. Your classes are merged last, so
          they win over the component's own.
        </p>
        <Code code={classOverride} lang="tsx" label="Copy className override" />
      </Section>
    </article>
  );
}
