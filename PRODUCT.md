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

Developers browse a grouped catalog or search with ⌘K, open each item at its own
URL, switch variants from the pill floating over the live specimen, read the usage example, and install
with the shadcn CLI or by copying the distributable source manually. Installed code becomes part of the developer's application.

## Capabilities and constraints

- The registry uses the shadcn registry schema and installation flow.
- Registry items compose standard shadcn primitives and declare them in
  `registryDependencies`, so installed code reuses the primitives a shadcn app
  already owns.
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
- The site has its own identity, a component workbench: graphite surfaces, Geist
  Mono chrome, solid hairlines, and a lime signal that is used only on the site.
  It must not read as a copy of another component gallery.
- The distributed components keep the Beautiful UI language: warm graphite, soft
  medium-weight type, tonal surfaces, pill controls, a blue accent, and small,
  purposeful motion. The site signal never changes how an installed component looks.
- The site is easy to navigate: a top bar with breadcrumb and ⌘K search, a file-tree
  sidebar with one folder per category, one numbered URL per item, and previous and
  next links in reading order.
- Each item page is a workbench: a pannable, zoomable, ruled canvas with the live specimen and a
  floating variant switch above a dock with the usage example and step-by-step manual
  installation; an inspector with the title, install command, anatomy, and
  accessibility checks on the right. The sidebar, inspector, and dock resize, and the
  sizes persist.
- Uai is from Minas Gerais. A triple click on the logo serves pão de queijo.
- A Theming page, right after Overview, covers installing the theme with the CLI or by
  hand, the token reference, and how to customize tokens and instances.
- Distributed components use 14px surfaces, 28px ghost controls, pill buttons, and
  compact raised menus. Accent blue fills the single primary action; Prompt Composer
  send stays ink. Prompt Composer also ships ghost (no card) and compact
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
6. Make the catalog feel like the components: one palette, one type scale, and one
   motion vocabulary from the site chrome to the installed code.

## Accessibility and inclusion

Target WCAG 2.2 AA. Support keyboard navigation, visible focus, semantic HTML,
screen readers, touch input, dark and light themes, and reduced-motion preferences.

## Forms and usability

The catalog includes Form Field, Search Field, Filter Bar, File Upload, Date Range Picker, Form Error Summary, Unsaved Changes Bar, and Step Indicator. Each ships three named visual variants with replaceable compound children, an interactive preview, installation source, usage code, accessibility notes, and behavior tests.

These components own local interaction and accessibility. Applications own validation policy, remote search, upload transport, persistence, and navigation. File uploads in the workbench simulate progress locally. The date-range example uses fixed release dates and calendar dates without timezone conversion. The unsaved-changes preview disables page-exit warnings while exercising save, discard, and failure states; installed code enables the native warning while dirty, and applications supply SPA navigation blocking.

## Navigation and layout

The catalog includes App Sidebar, Breadcrumb Trail, Page Tabs, Command Menu, and Split Pane. Each ships three named visual variants with replaceable compound children, an interactive preview, installation source, usage code, accessibility notes, and behavior tests.

These components own local interaction and accessibility: active and collapsed state, disclosure, tab selection, active-option tracking, and pane proportions. Applications own routing, link targets, permissions, command side effects, the surrounding command dialog, global shortcuts, and any server-side persistence. Previews prevent link navigation and keep state locally. The split-pane preview saves its proportion under a preview-only localStorage key.

## Feedback and state

The catalog includes Status Banner, Progress Summary, Inline Feedback, Confirmation Dialog, Activity Timeline, and Skeleton Group. Each ships three named visual variants with replaceable compound children, an interactive preview, installation source, usage code, accessibility notes, and behavior tests.

These components own live-region urgency, progress semantics, modal focus management, and loading announcements. Applications own the underlying jobs, actions, deletions, event data, and loading policy. The progress preview simulates a contact import locally. The inline-feedback preview resolves and rejects timed promises instead of calling a network. The confirmation-dialog preview only flips local state when the project is "deleted". The skeleton preview toggles between placeholders and the loaded team list so the absence of layout shift is visible.

## Data display

The catalog includes Data Table Toolbar, Metric Card, Description List, Comparison Table, Kanban Board, Calendar View, and Audit Log. Each ships three named visual variants with replaceable compound children, an interactive preview, installation source, usage code, accessibility notes, and behavior tests.

These components own local interaction and accessibility: search clearing, the column-visibility disclosure, selection-count announcements, difference highlighting, keyboard card movement with live announcements, calendar layout and date navigation, and event-detail disclosure. Applications own data loading, filtering, sorting, export, row selection, board persistence, event sources, and audit retention. Previews use fixed sample data: the calendar pins today to September 30, 2026, the kanban board keeps its order in local state, and the audit-log filter only narrows the sample list.

## Content and community

The catalog includes Author Card, Comment, Reaction Bar, Share Menu, and Changelog Entry. Each ships three named visual variants with replaceable compound children, an interactive preview, installation source, usage code, accessibility notes, and behavior tests.

These components own local interaction and accessibility: the follow toggle, inline edit focus, moderation disclosure, reaction toggles and the picker menu, menu-button keyboard support, and copy announcements. Applications own identity data, follow and comment persistence, moderation decisions, reaction totals, share URLs and channels, and release content. The comment preview keeps edits in local state and switches the moderation state of a reply with a preview-only select. The reaction preview adds the viewer's reaction to fixed counts. The share preview copies a sample article URL and links to real share intents.

## Maps

The catalog includes Map Frame, Map Controls, Map Marker, Map Legend, Place Card, and Route Summary. Each ships three named visual variants with replaceable compound children, an interactive preview, installation source, usage code, accessibility notes, and behavior tests. Uai does not ship or depend on a map library: Map Frame hosts whichever map the application mounts, such as MapLibre, Leaflet, Mapbox, or Google Maps, and the other components are the chrome around it.

These components own local interaction and accessibility: the labelled map region and its busy state, named camera buttons and zoom limits, the locate status in words, marker selection as toggle buttons, cluster names, layer visibility checkboxes, the color ramp text alternative, spoken ratings and opening status, and the single-select travel mode group. Applications own the map instance, tiles, projection, camera state, geolocation, marker positioning and clustering, layer data, place data, routing, and attribution text. Previews draw the decorative placeholder basemap instead of real tiles, place markers with percentage offsets, and use the invented Bayview neighborhood around Harbor Street. Zoom, bearing, locate, layer, and travel-mode changes only update local state, and locating resolves on a timer.

## Marketing and conversion

The catalog includes Announcement Bar, Pricing Toggle, Testimonial Card, Product Gallery, Trust Panel, and Newsletter Form. Each ships three named visual variants with replaceable compound children, an interactive preview, installation source, usage code, accessibility notes, and behavior tests.

These components own local interaction and accessibility: dismissal and its optional persistence, billing-period selection, quote attribution semantics, media selection, zoom, and fullscreen focus management, rating text equivalents, and signup validation and status announcements. Applications own campaign targeting, prices and billing, customer stories, images, trust evidence, and the subscription service. Previews use invented organizations and neutral placeholder artwork, never real trademarks. The announcement preview stores dismissal under a preview-only localStorage key and offers a way to show it again. The newsletter preview resolves a timed promise locally; ana@example.com returns the duplicate state.

## AI and automation

The catalog includes Message, Citation, Attachment, Tool Call, Response Status, and Run Summary. Each ships three named visual variants with replaceable compound children, an interactive preview, installation source, usage code, accessibility notes, and behavior tests. They extend Prompt Composer, Thinking, and Approval Card into the parts of an agent conversation: who said what, where a claim came from, what was attached, what the agent did, where a response stands, and what a run changed.

These components own local interaction and accessibility: message roles and streaming busy state, copy confirmation, the citation preview disclosure, upload progress and failure semantics, the tool disclosure, polite status announcements, and focus continuity between Stop and Retry. Applications own model calls, streaming transport, source retrieval, uploads, tool execution, cancellation, and run data. Previews simulate everything locally: the assistant reply streams from a fixed string, the upload advances on a timer, the response status moves from queued to complete on timers, and the tool-call result is chosen from a select.

## Marketing sites

The catalog includes Hero Section, Feature Showcase, Pricing Section, Testimonials Section, FAQ Section, Call to Action, Waitlist Section, and Contact Section. Each block composes existing Uai components, ships three named layout variants with replaceable compound regions, an interactive preview, installation source, usage code, accessibility notes, and behavior tests. Blocks stack on narrow containers.

These blocks own section labelling, layout, and the local interaction of their regions: billing-period selection, question search and disclosure, waitlist confirmation and focus, and contact form states. Applications own copy, media, prices, billing, customer stories, signup storage, message delivery, and support hours. Previews use the invented company Ferrow, invented customers, and neutral SVG artwork, never real trademarks. The waitlist preview resolves a timed promise locally, and ana@example.com returns the already-joined state. The contact preview resolves locally, and addresses ending in @fail.test show the error state.

## Application surfaces

The catalog includes Dashboard Shell, Settings Page, Profile Page, Team Management, Notification Center, Billing Portal, and Search Results. Each block ships three named layout variants with replaceable compound regions, an interactive preview, installation source, usage code, accessibility notes, and behavior tests. Blocks compose existing Uai components and install them as registry dependencies.

These blocks own layout, labelling, and local interaction: named page and section regions, role selects named after each member, unread state spoken in text, labelled usage meters, a search landmark, and pagination with the current page marked. Applications own routing, data, persistence, permissions, saving, invitations, payments, notification delivery, ranking, and remote search. Previews use fixed sample data for a fictional store, Northwind Goods. The settings preview saves after a short local delay and disables page-exit warnings. Removal, deletion, and cancellation only change local state. The search preview filters a fixed list of help articles.

## Data and operations

The catalog includes seven operations blocks: Resource Manager, Data Explorer, Import Workflow, Approval Queue, Audit Log Viewer, Incident Dashboard, and Report Builder. Each ships three named layout variants with replaceable compound regions, an interactive preview, installation source, usage code, accessibility notes, and behavior tests. Blocks compose installed Uai components, such as Data Table Toolbar, Description List, Confirmation Dialog, File Upload, Step Indicator, Approval Card, Audit Log, Activity Timeline, and Metric Card, and list them as registry dependencies.

These blocks own layout, region labelling, the inspected-record and import-step state, record-list keyboard movement, and the group-by radio group. Applications own data fetching, persistence, query execution, file parsing and upload, validation rules, approval decisions, audit retention, incident paging and communications, report queries, and export generation. Previews use fixed sample data and local state: the resource manager edits suppliers in memory, the data explorer "runs" a saved query against fixed rows, the import advances on a timer, approvals settle locally, the audit filters only narrow sample events, the incident form appends to a local timeline, and exports only update a status message.

## Authentication and onboarding blocks

The catalog includes Code Verification, Onboarding Wizard, and Workspace Setup. Each block ships three named layout variants with replaceable compound regions, an interactive preview, installation source, usage code, accessibility notes, and behavior tests. Blocks compose existing Uai components and install them as registry dependencies.

These blocks own layout, labelling, and local interaction: segmented code entry with one-time-code autofill and paste, a paced resend, step validation with focus management, reachable earlier steps, a derived workspace URL, and an invitation list. Applications own authentication, code delivery and checking, rate limits, wizard persistence through `value` and `onValueChange`, workspace creation, URL availability, and invitation delivery. Previews use the invented company Ferrow and the invented customer Larkspur. The code preview accepts 482913, treats 000000 as expired, and rejects other codes after a short local delay. The wizard preview keeps its current step in local state and requires a stop count on the routes step. The workspace preview creates locally, and the URL larkspur returns a taken-URL error.

## Commerce blocks

The catalog includes Product Detail, Product Listing, Cart Drawer, Checkout, Order Tracking, and Subscription Management. Each block composes existing Uai commerce, form, and feedback components, ships three named layout variants with replaceable compound regions, an interactive preview, installation source, usage code, accessibility notes, and behavior tests. Blocks stack on narrow containers.

These blocks own section labelling, layout, and the local interaction of their regions: option selection and the pending add-to-cart action, sort and filter controls, the modal cart drawer and its focus handoff, checkout step order, validation, focus, and order placement states, the earlier-events disclosure, and the selected plan and billing period. Applications own products, prices, inventory, carts, discounts, taxes, shipping, payment processing, order and shipment data, plans, and billing. Uai never collects card data: the checkout payment region is a slot for a payment provider's hosted fields, and the preview shows inert placeholders. Previews use the invented shop Fieldhouse Ceramics, the invented software Ledgerly, invented customers, and neutral SVG artwork, never real trademarks. In the previews, the code STUDIO10 applies a discount, and the first place-order attempt is declined so the error state is visible.

## Content and community blocks

The catalog includes Article Page, Documentation Page, Changelog Page, Comment Thread, Community Feed, and Public Profile. Each block ships three named layout variants with replaceable compound regions, an interactive preview, installation source, usage code, accessibility notes, and behavior tests. Blocks compose installed Uai components, such as Author Card, Share Menu, App Sidebar, Breadcrumb Trail, Changelog Entry, Filter Bar, Empty State, Comment, Reaction Bar, and Activity Timeline, and list them as registry dependencies.

These blocks own layout, region labelling, and local interaction: the article text size, the current table of contents section, changelog category and area filters with a live count, comment sort order and composer, feed filters and pagination, and the follow toggle. Applications own content storage, rich text, moderation decisions and policy, routing, sorting and filtering of their own data, follower data, and share destinations. Previews use fixed sample data for a fictional static-site tool, Kiln, and its invented community. Moderation actions, new comments, and follows only change local state.

## AI and automation blocks

The catalog includes Conversation Thread, Research Session, File Analysis, and Agent Run. Each block composes the installed AI components, ships three named layout variants with replaceable compound regions, an interactive preview, installation source, usage code, accessibility notes, and behavior tests. Blocks stack on narrow containers and list every composed component as a registry dependency.

These blocks own layout, region labelling, and local interaction: a polite, keyboard-scrollable conversation log that stays pinned to the newest message, labelled plan, activity, synthesis, source, file, finding, task, and approval regions, and an agent activity log. Applications own model calls, streaming transport, search and retrieval, file extraction, tool execution, approvals, cancellation, and run data. Previews simulate everything locally with deterministic timers that are cleared on unmount: the conversation streams a fixed reply word by word, the research session advances a fixed script and writes its synthesis last, the file analysis reads files one at a time and fails the scanned addendum until it is retried, and the agent run pauses at a staging deploy approval and finishes with a partial summary when the deploy is rejected.

## Brazil

The catalog includes Document Field, CEP Field, Pix Payment, and Installment Picker. Each ships three named visual variants with replaceable compound children, an interactive preview, installation source, usage code, accessibility notes, and behavior tests. Default copy is Brazilian Portuguese.

These components own local interaction and accessibility: CPF and CNPJ masking with a stable caret, check-digit validation including the alphanumeric CNPJ issued from July 2026, CEP masking and lookup timing, Pix copy feedback and the expiry countdown, and radio grouping for installments. Applications own address lookup, tax-document checks against government records, Pix charge creation and confirmation, card processing, and interest rates. Previews use fixed sample data: the CEP preview resolves two addresses locally and returns the error state for 99999-999, the Pix preview pins its clock and switches states from preview-only buttons, and its QR code encodes a sample charge for an invented store, Casa Aroeira.
