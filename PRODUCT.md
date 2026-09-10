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

Developers evaluate components in one workbench, compare each live preview with its
usage example, and install selected items with the shadcn CLI or by copying the
distributable source manually. Installed code becomes part of the developer's application.

## Capabilities and constraints

- The registry uses the shadcn registry schema and installation flow.
- Fumadocs UI provides the application shell and highlighted code blocks.
- Bun manages dependencies and project scripts.
- The first release targets React and Tailwind CSS.
- The registry structure must allow more frameworks in the future.
- The catalog supports application, marketing, commerce, content, and AI patterns.

## Brand commitments

- The product name is Uai.
- The Uai identity uses the compact three-part modular mark as the visual `U` and
  pairs it with the lowercase mono wordmark `ai`. The same mark identifies the
  product in the browser favicon.
- The component browser follows the open-code, composition, distribution, and
  live-demo principles used by shadcn/ui.
- Distributed interfaces use named compound components: roots retain shared
  behavior and accessibility while consumers compose replaceable regions.
- The registry workbench is a catalog tool: graphite surfaces, dotted hairlines,
  graphite pill selection, numbered titles, and cobalt for focus only.
- Each component specimen keeps the live preview above its usage example and moves
  variant selection into a vertical rail on the right. The install dock owns the
  separate manual-source path.
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
- Empty State keeps blank-slate explanation, media, actions, and supporting guidance
  composable while leaving empty-data detection and action behavior with the consuming
  application. It ships card, plain, compact, and page variants for blank pages, existing
  panels, dense sidebars, and full-page not-found routes.
- Task List keeps progress semantics and status copy visible while adapting the same
  composed tasks across card, timeline, and compact contexts.
- Sign-in Card composes identity providers, credentials, recovery, errors, and submission
  feedback while leaving authentication and navigation with the consuming application. It
  ships card, split, and compact variants for modal, page, and embedded account contexts;
  Split separates its two visible paths with a concise `or` label.
- Sign-up Card composes identity providers, account fields, password guidance, consent,
  errors, and verification feedback while leaving account creation and navigation with the
  consuming application. It ships card, split, and compact variants for dialogs, pages,
  and invitation contexts; Split keeps provider and email paths visible side by side.
- Password Recovery composes account-lookup input, delivery handoff, new-password fields,
  expired links, and completion feedback while leaving account lookup, email delivery, token
  validation, password persistence, and navigation with the consuming application. It ships
  card, split, and compact variants for dialogs, full recovery pages, and embedded
  account-support contexts.
- Coupon Field keeps apply, replace, remove, and feedback behavior composable while
  leaving discount validation and async state with the consuming checkout. It ships
  rounded, pill, and compact variants for checkout, promotion, and cart contexts.
- Quantity Picker keeps limits, direct input, step actions, and stock feedback composable
  while leaving inventory and cart persistence with the consuming application. It ships
  rounded, pill, and compact variants for product, cart-line, and drawer contexts.
- Cart Item composes product media, options, availability, quantity, price, and removal
  while leaving inventory, pricing, and cart persistence with the consuming application.
  It ships card, plain, and compact variants for cart, review, and drawer contexts.
- Price Summary keeps order amounts composable and semantic while giving subtotal,
  discounts, shipping, taxes, and total an explicit visual hierarchy. It ships card,
  plain, and compact variants for checkout, payment, and cart contexts.
- Order Status keeps fulfillment stages, tracking facts, and support actions composable
  while leaving carrier data and order updates with the consuming application. It ships
  card, plain, and compact variants for account, confirmation, and drawer contexts.
- App Header composes brand, navigation, search, account actions, and responsive overflow
  while leaving destinations, search behavior, and account menus with the consuming
  application. It ships bar, floating, and compact variants for application shells, inset
  workspaces, and dense operations surfaces.
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

## Forms and usability

The catalog includes Form Field, Search Field, Filter Bar, File Upload, Date Range Picker, Form Error Summary, Unsaved Changes Bar, and Step Indicator. Each ships three named visual variants with replaceable compound children, an interactive preview, installation source, usage code, accessibility notes, and behavior tests.

These components own local interaction and accessibility. Applications own validation policy, remote search, upload transport, persistence, and navigation. File uploads in the workbench simulate progress locally. The date-range example uses fixed release dates and calendar dates without timezone conversion. The unsaved-changes preview disables page-exit warnings while exercising save, discard, and failure states; installed code enables the native warning while dirty, and applications supply SPA navigation blocking.
