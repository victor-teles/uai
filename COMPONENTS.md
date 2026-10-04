# Component and block ideas

Uai is a general-purpose registry for websites and web applications. AI patterns are one category, not the catalog's sole focus.

Components should solve one reusable interaction contract. Blocks should combine components into complete sections or product workflows.

## Current registry

- [x] **Prompt Composer** — Compose prompts, attachments, model selection, and submission states.
- [x] **Thinking** — Disclose live activity and completed evidence without exposing private reasoning.
- [x] **Approval Card** — Present risk, evidence, impact, and typed confirmation before an action.
- [x] **Empty State** — Explain a blank slate and present clear next actions across card, plain, compact, and full-page 404 variants.
- [x] **Task List** — Show complete, active, and pending work across card, timeline, and compact variants.
- [x] **Sign-in Card** — Combine providers, credentials, recovery, errors, and loading across card, split, and compact variants.
- [x] **Sign-up Card** — Combine account fields, consent, password guidance, verification, and loading across card, split, and compact variants.
- [x] **Password Recovery** — Cover request, email sent, reset, expired, and success across card, split, and compact variants.
- [x] **Coupon Field** — Apply, replace, and remove discount codes with clear feedback across rounded, pill, and compact variants.
- [x] **Quantity Picker** — Change quantities with limits, direct input, stock feedback, and rounded, pill, and compact variants.
- [x] **Cart Item** — Combine product options, quantity, availability, price, and removal across card, plain, and compact variants.
- [x] **Price Summary** — Explain subtotal, discounts, shipping, taxes, and total across card, plain, and compact variants.
- [x] **Order Status** — Show fulfillment stages, dates, tracking, and support actions across card, plain, and compact variants.
- [x] **App Header** — Combine navigation, account actions, search, and responsive overflow across bar, floating, and compact variants.

## Component ideas

### Navigation and layout

- [x] **App Sidebar** — Support nested navigation, collapsed mode, mobile disclosure, and active states.
- [x] **Breadcrumb Trail** — Show hierarchy with truncation and a compact mobile fallback.
- [x] **Page Tabs** — Combine primary tabs, counts, actions, and horizontal overflow.
- [x] **Command Menu** — Search and run grouped actions with complete keyboard navigation.
- [x] **Split Pane** — Resize two content regions with keyboard controls and saved proportions.

### Forms and usability

- [x] **Form Field** — Combine labels, descriptions, requirements, validation, and character counts.
- [x] **Search Field** — Support clear, loading, recent, empty, and error states.
- [x] **Filter Bar** — Compose filters, active chips, result counts, and reset actions.
- [x] **File Upload** — Support drag and drop, progress, validation, retry, and removal.
- [x] **Date Range Picker** — Select presets and custom ranges with accessible calendar navigation.
- [x] **Form Error Summary** — Link submission errors to the matching fields.
- [x] **Unsaved Changes Bar** — Keep save, discard, and navigation-warning actions visible.
- [x] **Step Indicator** — Show current, complete, optional, blocked, and error steps.

### Feedback and state

- [x] **Status Banner** — Present information, success, warning, and error states with optional actions.
- [x] **Progress Summary** — Combine progress, elapsed time, remaining work, and cancellation.
- [x] **Inline Feedback** — Confirm or reject a local action without interrupting the workflow.
- [x] **Confirmation Dialog** — Explain impact before destructive or difficult-to-reverse actions.
- [x] **Activity Timeline** — Present events, actors, timestamps, metadata, and grouped dates.
- [x] **Skeleton Group** — Match common page structures without causing layout shifts.

### Data display

- [x] **Data Table Toolbar** — Combine search, filters, columns, export, and bulk actions.
- [x] **Metric Card** — Present a value, comparison, trend, and supporting context.
- [x] **Description List** — Display labeled facts with responsive alignment and optional actions.
- [x] **Comparison Table** — Compare plans or products with sticky labels and highlighted differences.
- [x] **Kanban Board** — Support columns, cards, keyboard movement, and empty states.
- [x] **Calendar View** — Present day, week, and month layouts with event overflow.
- [x] **Audit Log** — Show actors, actions, resources, timestamps, filters, and event details.

### Marketing and conversion

- [x] **Announcement Bar** — Present a campaign message with actions, dismissal, and persistence.
- [x] **Pricing Toggle** — Switch billing periods while preserving price context and savings labels.
- [x] **Testimonial Card** — Present a quote, person, role, organization, and optional proof link.
- [x] **Product Gallery** — Combine media selection, zoom, fullscreen viewing, and alt text.
- [x] **Trust Panel** — Group customer logos, ratings, certifications, or security evidence.
- [x] **Newsletter Form** — Handle consent, validation, submission, success, and duplicate-email states.

### Commerce components

### Content and community components

- [x] **Author Card** — Present identity, biography, links, and follow actions.
- [x] **Comment** — Support replies, reactions, editing, moderation, and timestamps.
- [x] **Reaction Bar** — Present counts and selected states without hiding accessible labels.
- [x] **Share Menu** — Combine native sharing, copy-link feedback, and channel actions.
- [x] **Changelog Entry** — Present a release date, version, categories, and linked changes.

### AI and automation components

- [x] **Message** — Render user, assistant, system, and tool messages with replaceable content.
- [x] **Citation** — Connect an inline claim to a source preview and destination.
- [x] **Attachment** — Show file type, upload progress, failure, preview, and removal.
- [x] **Tool Call** — Present queued, running, successful, and failed tool activity.
- [x] **Response Status** — Show queued, streaming, stopped, complete, and failed responses.
- [x] **Run Summary** — Summarize completed work, changed artifacts, warnings, and next actions.

### Map components

- [x] **Map Frame** — Host any map library, anchor overlays to its edges, and show a placeholder basemap.
- [x] **Map Controls** — Group zoom, compass, locate, and custom camera buttons.
- [x] **Map Marker** — Present selectable pins, dots, and price labels, plus cluster counts.
- [x] **Map Legend** — Explain layer symbols and color ramps, and toggle layer visibility.
- [x] **Place Card** — Present a place's rating, opening status, contact facts, and actions.
- [x] **Route Summary** — Combine travel modes, stops, totals, and turn-by-turn steps.

## Block ideas

### Marketing sites

- [x] **Hero Section** — Combine positioning, primary action, supporting proof, and product media.
- [x] **Feature Showcase** — Explain benefits through alternating copy, media, and supporting details.
- [x] **Pricing Section** — Compare plans, billing periods, limits, and purchase actions.
- [x] **Testimonials Section** — Present credible customer stories with roles and organizations.
- [x] **FAQ Section** — Group searchable questions with accessible disclosure controls.
- [x] **Call to Action** — Close a page with one goal, supporting copy, and reassurance.
- [x] **Waitlist Section** — Collect interest with qualification fields, consent, and confirmation.
- [x] **Contact Section** — Combine contact options, availability, form states, and expectations.

### Authentication and onboarding

- [x] **Sign-in Card** — Combine credentials, providers, recovery, errors, and loading states.
- [x] **Sign-up Card** — Combine account fields, consent, password guidance, and verification.
- [x] **Password Recovery** — Cover request, email sent, reset, expired, and success states.
- [x] **Code Verification** — Support one-time codes, resend timing, errors, and alternate methods.
- [x] **Onboarding Wizard** — Guide setup through resumable steps with validation and progress.
- [x] **Workspace Setup** — Create a workspace, invite teammates, and choose initial settings.

### Application surfaces

- [x] **Dashboard Shell** — Combine global navigation, page hierarchy, actions, and responsive layout.
- [x] **Settings Page** — Organize settings, save states, validation, and dangerous actions.
- [x] **Profile Page** — Combine identity, activity, contact details, and account actions.
- [x] **Team Management** — Manage members, roles, invitations, access, and removal.
- [x] **Notification Center** — Group updates by date with read state and bulk actions.
- [x] **Billing Portal** — Present plan, usage, invoices, payment methods, and cancellation.
- [x] **Search Results** — Combine query controls, filters, ranking, empty states, and pagination.

### Data and operations

- [x] **Resource Manager** — List, create, inspect, edit, archive, and delete domain records.
- [x] **Data Explorer** — Combine a query surface, results, saved views, and export actions.
- [x] **Import Workflow** — Cover file selection, column mapping, validation, preview, and completion.
- [x] **Approval Queue** — Group pending decisions by risk, age, owner, and impact.
- [x] **Audit Log Viewer** — Combine filters, events, details, and export controls.
- [x] **Incident Dashboard** — Present status, impact, timeline, responders, and updates.
- [x] **Report Builder** — Select metrics, dimensions, filters, visualization, and export format.

### Commerce blocks

- [x] **Product Detail** — Combine gallery, options, availability, price, delivery, and purchase actions.
- [x] **Product Listing** — Combine categories, filters, sorting, result counts, and pagination.
- [x] **Cart Drawer** — Review items, quantities, discounts, totals, and checkout actions.
- [x] **Checkout** — Guide contact, delivery, payment, review, and confirmation.
- [x] **Order Tracking** — Present status, shipment events, delivery estimates, and support.
- [x] **Subscription Management** — Change plans, usage limits, payment, renewal, and cancellation.

### Content and community blocks

- [x] **Article Page** — Combine metadata, reading controls, content, sharing, and related articles.
- [x] **Documentation Page** — Combine navigation, table of contents, content, and page actions.
- [x] **Changelog Page** — Group releases by date, version, category, and product area.
- [x] **Comment Thread** — Support nested replies, reactions, sorting, and moderation.
- [x] **Community Feed** — Combine posts, authors, reactions, filters, and pagination.
- [x] **Public Profile** — Present identity, work, links, followers, and recent activity.

### AI and automation blocks

- [x] **Conversation Thread** — Combine messages, sources, response states, and Prompt Composer.
- [x] **Research Session** — Combine a research plan, search activity, sources, and synthesis.
- [x] **File Analysis** — Combine attachments, extraction status, findings, and citations.
- [x] **Agent Run** — Combine activity, tasks, approvals, and a final summary.

## Suggested first batch

- [x] Build **Form Field** and **Filter Bar** as the next general foundations.
- [x] Build **Hero Section**, **Pricing Section**, and **FAQ Section** for marketing sites.
- [x] Build **Dashboard Shell**, **Settings Page**, and **Team Management** for applications.
- [x] Build **Product Detail** and **Cart Drawer** for commerce.
- [ ] Keep AI components as a supported category instead of the default roadmap.
