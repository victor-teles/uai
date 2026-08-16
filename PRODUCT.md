# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Assumed after the initial intake received no answer: Next.js App Router, React,
Fumadocs UI, Tailwind CSS, and Bun. The first deployment target is Vercel.

## Users

Assumed after the initial intake received no answer: React developers who build
polished AI products and internal tools. They use Uai to add complete interface
patterns without rebuilding interaction details from scratch.

## Product purpose

Uai is an open-code component registry. It distributes components, dependencies,
and supporting files through the shadcn CLI. Success means a developer can inspect
a component, copy its code into an application, and adapt it without depending on
a hidden runtime package.

## Positioning

Uai starts with complete patterns for AI-native product interfaces. Each registry
item combines a small React interface with detailed interaction, accessibility,
motion, and visual implementation.

## Operating context

Developers evaluate components in one workbench, inspect highlighted source, and
install selected items with the shadcn CLI. Installed code becomes part of the
developer's application.

## Capabilities and constraints

- The registry uses the shadcn registry schema and installation flow.
- Fumadocs UI provides the application shell and highlighted code blocks.
- Bun manages dependencies and project scripts.
- The first release targets React and Tailwind CSS.
- The registry structure must allow more frameworks in the future.
- The first release prioritizes AI-native patterns and includes the primitives they
  need.

## Brand commitments

- The product name is Uai.
- The component browser follows the open-code, composition, distribution, and
  live-demo principles used by shadcn/ui.
- The registry workbench is a catalog tool: graphite surfaces, dotted hairlines,
  graphite pill selection, numbered titles, and cobalt for focus only.
- Distributed components follow Beautiful UI product chrome: flat 14px bordered
  surfaces, 28px ghost controls, ink send, and compact raised menus. Cobalt is
  not the send color. Prompt Composer also ships ghost (no card) and compact
  (24px sidebar) variants of the same controls.
- Thinking presents live work and completed evidence through explicit states,
  structured activity, and user-controlled disclosure. It shows observable
  actions without presenting private chain-of-thought.
- Approval Card makes the risk and downstream impact of an AI-proposed action
  explicit before a person decides. Its evidence is composable, its async state
  is consumer-controlled, and critical actions require typed confirmation.
- Copy is direct and practical. It does not use unsupported claims.

## Evidence on hand

The project has no customer evidence, benchmarks, testimonials, pricing, or production
assets. Documentation and demonstrations must not invent those claims.

## Product principles

1. Ship source code that developers own.
2. Prefer complete product patterns over isolated decoration.
3. Keep public interfaces small and implementations detailed.
4. Demonstrate every component in realistic states.
5. Treat accessibility, keyboard behavior, and reduced motion as implementation
   requirements.
6. Keep the workbench and installed components visually distinct. The workbench
   is a catalog. Installed components are product chrome.

## Accessibility and inclusion

Target WCAG 2.2 AA. Support keyboard navigation, visible focus, semantic HTML,
screen readers, touch input, dark and light themes, and reduced-motion preferences.
