# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Assumed after the initial intake received no answer: Next.js App Router, React,
Fumadocs UI, Tailwind CSS, and Bun. The first deployment target is Vercel.

## Users

React developers who build websites, products, and internal tools. They use Uai
to add complete interface patterns without rebuilding interaction details from
scratch.

## Product purpose

Uai is an open-code component registry. It distributes components, dependencies,
and supporting files through the shadcn CLI. Success means a developer can inspect
a component, copy its code into an application, and adapt it without depending on
a hidden runtime package.

## Positioning

Uai provides complete patterns for general-purpose web interfaces. The catalog can
include application, marketing, commerce, content, and AI patterns. Each registry
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
- The catalog supports application, marketing, commerce, content, and AI patterns.

## Brand commitments

- The product name is Uai.
- The Uai identity pairs a compact three-part modular `u` mark with the lowercase
  mono wordmark. The same mark identifies the product in the browser favicon.
- The component browser follows the open-code, composition, distribution, and
  live-demo principles used by shadcn/ui.
- Distributed interfaces use named compound components: roots retain shared
  behavior and accessibility while consumers compose replaceable regions.
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
- Coupon Field keeps apply, replace, remove, and feedback behavior composable while
  leaving discount validation and async state with the consuming checkout. It ships
  rounded, pill, and compact variants for checkout, promotion, and cart contexts.
- Price Summary keeps order amounts composable and semantic while giving subtotal,
  discounts, shipping, taxes, and total an explicit visual hierarchy. It ships card,
  plain, and compact variants for checkout, payment, and cart contexts.
- Order Status keeps fulfillment stages, tracking facts, and support actions composable
  while leaving carrier data and order updates with the consuming application. It ships
  card, plain, and compact variants for account, confirmation, and drawer contexts.
- Copy is direct and practical. It does not use unsupported claims.

## Evidence on hand

The project has no customer evidence, benchmarks, testimonials, pricing, or production
assets. Documentation and demonstrations must not invent those claims.

## Product principles

1. Ship source code that developers own.
2. Prefer complete product patterns over isolated decoration.
3. Keep public interfaces composition-first and small, with detailed behavior behind them.
4. Demonstrate every component in realistic states.
5. Treat accessibility, keyboard behavior, and reduced motion as implementation
   requirements.
6. Keep the workbench and installed components visually distinct. The workbench
   is a catalog. Installed components are product chrome.

## Accessibility and inclusion

Target WCAG 2.2 AA. Support keyboard navigation, visible focus, semantic HTML,
screen readers, touch input, dark and light themes, and reduced-motion preferences.
