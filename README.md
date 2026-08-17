# Uai

Uai is an open-code React component library for websites and web applications.
It works as a shadcn registry: the CLI copies each component and its dependencies
into the consumer's application, where the team can inspect and change every line.

The repository includes a component browser built with Next.js, Fumadocs UI,
Tailwind CSS, and Bun.

## Run the site

Install the dependencies and start the local development server:

```bash
bun install
bun run dev
```

Open `http://localhost:3000` to browse the components. Generated registry
documents are available under `/r`.

## Install a registry item locally

Keep the Uai development server running. In a shadcn project, run:

```bash
bunx shadcn@latest add http://localhost:3000/r/prompt-composer.json
```

Prompt Composer installs the Uai theme tokens and the shared class-name utility.
Replace `prompt-composer` with another registry item name to install that component.

Set `NEXT_PUBLIC_REGISTRY_URL` to the deployed `/r` URL before publishing the
site. Update the `homepage` and dependency URLs in `registry.json` at the same
time. shadcn requires full URLs for custom registry dependencies.

## Repository layout

- `src/registry/uai`: source files distributed through the registry.
- `src/components/registry`: component catalog, previews, and install workflow.
- `src/components/ui/uai`: local component copies used by the browser.
- `registry.json`: the registry catalog and dependency graph.
- `public/r`: generated registry documents.

## Add a component

1. Add the source file under `src/registry/uai`.
2. Define the public item, target path, and dependencies in `registry.json`.
3. Add the component to `src/components/registry/catalog.ts` and its live preview.
4. Run the validation suite.

Keep public interfaces small. A compound component should own its shared behavior
and delegate replaceable content to named children.

## Validate a change

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

`bun run test` regenerates the registry before checking its public documents.
`bun run build` does the same before creating the production site.
