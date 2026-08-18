# Component and block ideas

Uai is a general-purpose registry for websites and web applications. AI patterns are one category, not the catalog's sole focus.

Components should solve one reusable interaction contract. Blocks should combine components into complete sections or product workflows.

## Current registry

- [x] **Prompt Composer** — Compose prompts, attachments, model selection, and submission states.
- [x] **Thinking** — Disclose live activity and completed evidence without exposing private reasoning.
- [x] **Approval Card** — Present risk, evidence, impact, and typed confirmation before an action.
- [x] **Task List** — Show complete, active, and pending work across card, timeline, and compact variants.
- [x] **Coupon Field** — Apply, replace, and remove discount codes with clear feedback across rounded, pill, and compact variants.
- [x] **Price Summary** — Explain subtotal, discounts, shipping, taxes, and total across card, plain, and compact variants.
- [x] **Order Status** — Show fulfillment stages, dates, tracking, and support actions across card, plain, and compact variants.

## Component ideas

### Navigation and layout

- [ ] **App Header** — Combine navigation, account actions, search, and responsive overflow.
- [ ] **App Sidebar** — Support nested navigation, collapsed mode, mobile disclosure, and active states.
- [ ] **Breadcrumb Trail** — Show hierarchy with truncation and a compact mobile fallback.
- [ ] **Page Tabs** — Combine primary tabs, counts, actions, and horizontal overflow.
- [ ] **Command Menu** — Search and run grouped actions with complete keyboard navigation.
- [ ] **Split Pane** — Resize two content regions with keyboard controls and saved proportions.

### Forms and usability

- [ ] **Form Field** — Combine labels, descriptions, requirements, validation, and character counts.
- [ ] **Search Field** — Support clear, loading, recent, empty, and error states.
- [ ] **Filter Bar** — Compose filters, active chips, result counts, and reset actions.
- [ ] **File Upload** — Support drag and drop, progress, validation, retry, and removal.
- [ ] **Date Range Picker** — Select presets and custom ranges with accessible calendar navigation.
- [ ] **Form Error Summary** — Link submission errors to the matching fields.
- [ ] **Unsaved Changes Bar** — Keep save, discard, and navigation-warning actions visible.
- [ ] **Step Indicator** — Show current, complete, optional, blocked, and error steps.

### Feedback and state

- [ ] **Empty State** — Explain the situation and present one clear next action.
- [ ] **Status Banner** — Present information, success, warning, and error states with optional actions.
- [ ] **Progress Summary** — Combine progress, elapsed time, remaining work, and cancellation.
- [ ] **Inline Feedback** — Confirm or reject a local action without interrupting the workflow.
- [ ] **Confirmation Dialog** — Explain impact before destructive or difficult-to-reverse actions.
- [ ] **Activity Timeline** — Present events, actors, timestamps, metadata, and grouped dates.
- [ ] **Skeleton Group** — Match common page structures without causing layout shifts.

### Data display

- [ ] **Data Table Toolbar** — Combine search, filters, columns, export, and bulk actions.
- [ ] **Metric Card** — Present a value, comparison, trend, and supporting context.
- [ ] **Description List** — Display labeled facts with responsive alignment and optional actions.
- [ ] **Comparison Table** — Compare plans or products with sticky labels and highlighted differences.
- [ ] **Kanban Board** — Support columns, cards, keyboard movement, and empty states.
- [ ] **Calendar View** — Present day, week, and month layouts with event overflow.
- [ ] **Audit Log** — Show actors, actions, resources, timestamps, filters, and event details.

### Marketing and conversion

- [ ] **Announcement Bar** — Present a campaign message with actions, dismissal, and persistence.
- [ ] **Pricing Toggle** — Switch billing periods while preserving price context and savings labels.
- [ ] **Testimonial Card** — Present a quote, person, role, organization, and optional proof link.
- [ ] **Product Gallery** — Combine media selection, zoom, fullscreen viewing, and alt text.
- [ ] **Trust Panel** — Group customer logos, ratings, certifications, or security evidence.
- [ ] **Newsletter Form** — Handle consent, validation, submission, success, and duplicate-email states.

### Commerce components

- [ ] **Quantity Picker** — Change quantities with limits, direct input, and stock feedback.
- [ ] **Cart Item** — Combine product options, quantity, availability, price, and removal.

### Content and community components

- [ ] **Author Card** — Present identity, biography, links, and follow actions.
- [ ] **Comment** — Support replies, reactions, editing, moderation, and timestamps.
- [ ] **Reaction Bar** — Present counts and selected states without hiding accessible labels.
- [ ] **Share Menu** — Combine native sharing, copy-link feedback, and channel actions.
- [ ] **Changelog Entry** — Present a release date, version, categories, and linked changes.

### AI and automation components

- [ ] **Message** — Render user, assistant, system, and tool messages with replaceable content.
- [ ] **Citation** — Connect an inline claim to a source preview and destination.
- [ ] **Attachment** — Show file type, upload progress, failure, preview, and removal.
- [ ] **Tool Call** — Present queued, running, successful, and failed tool activity.
- [ ] **Response Status** — Show queued, streaming, stopped, complete, and failed responses.
- [ ] **Run Summary** — Summarize completed work, changed artifacts, warnings, and next actions.

## Block ideas

### Marketing sites

- [ ] **Hero Section** — Combine positioning, primary action, supporting proof, and product media.
- [ ] **Feature Showcase** — Explain benefits through alternating copy, media, and supporting details.
- [ ] **Pricing Section** — Compare plans, billing periods, limits, and purchase actions.
- [ ] **Testimonials Section** — Present credible customer stories with roles and organizations.
- [ ] **FAQ Section** — Group searchable questions with accessible disclosure controls.
- [ ] **Call to Action** — Close a page with one goal, supporting copy, and reassurance.
- [ ] **Waitlist Section** — Collect interest with qualification fields, consent, and confirmation.
- [ ] **Contact Section** — Combine contact options, availability, form states, and expectations.

### Authentication and onboarding

- [ ] **Sign-in Card** — Combine credentials, providers, recovery, errors, and loading states.
- [ ] **Sign-up Card** — Combine account fields, consent, password guidance, and verification.
- [ ] **Password Recovery** — Cover request, email sent, reset, expired, and success states.
- [ ] **Code Verification** — Support one-time codes, resend timing, errors, and alternate methods.
- [ ] **Onboarding Wizard** — Guide setup through resumable steps with validation and progress.
- [ ] **Workspace Setup** — Create a workspace, invite teammates, and choose initial settings.

### Application surfaces

- [ ] **Dashboard Shell** — Combine global navigation, page hierarchy, actions, and responsive layout.
- [ ] **Settings Page** — Organize settings, save states, validation, and dangerous actions.
- [ ] **Profile Page** — Combine identity, activity, contact details, and account actions.
- [ ] **Team Management** — Manage members, roles, invitations, access, and removal.
- [ ] **Notification Center** — Group updates by date with read state and bulk actions.
- [ ] **Billing Portal** — Present plan, usage, invoices, payment methods, and cancellation.
- [ ] **Search Results** — Combine query controls, filters, ranking, empty states, and pagination.

### Data and operations

- [ ] **Resource Manager** — List, create, inspect, edit, archive, and delete domain records.
- [ ] **Data Explorer** — Combine a query surface, results, saved views, and export actions.
- [ ] **Import Workflow** — Cover file selection, column mapping, validation, preview, and completion.
- [ ] **Approval Queue** — Group pending decisions by risk, age, owner, and impact.
- [ ] **Audit Log Viewer** — Combine filters, events, details, and export controls.
- [ ] **Incident Dashboard** — Present status, impact, timeline, responders, and updates.
- [ ] **Report Builder** — Select metrics, dimensions, filters, visualization, and export format.

### Commerce blocks

- [ ] **Product Detail** — Combine gallery, options, availability, price, delivery, and purchase actions.
- [ ] **Product Listing** — Combine categories, filters, sorting, result counts, and pagination.
- [ ] **Cart Drawer** — Review items, quantities, discounts, totals, and checkout actions.
- [ ] **Checkout** — Guide contact, delivery, payment, review, and confirmation.
- [ ] **Order Tracking** — Present status, shipment events, delivery estimates, and support.
- [ ] **Subscription Management** — Change plans, usage limits, payment, renewal, and cancellation.

### Content and community blocks

- [ ] **Article Page** — Combine metadata, reading controls, content, sharing, and related articles.
- [ ] **Documentation Page** — Combine navigation, table of contents, content, and page actions.
- [ ] **Changelog Page** — Group releases by date, version, category, and product area.
- [ ] **Comment Thread** — Support nested replies, reactions, sorting, and moderation.
- [ ] **Community Feed** — Combine posts, authors, reactions, filters, and pagination.
- [ ] **Public Profile** — Present identity, work, links, followers, and recent activity.

### AI and automation blocks

- [ ] **Conversation Thread** — Combine messages, sources, response states, and Prompt Composer.
- [ ] **Research Session** — Combine a research plan, search activity, sources, and synthesis.
- [ ] **File Analysis** — Combine attachments, extraction status, findings, and citations.
- [ ] **Agent Run** — Combine activity, tasks, approvals, and a final summary.

## Suggested first batch

- [ ] Build **App Header**, **Empty State**, **Form Field**, and **Filter Bar** as general foundations.
- [ ] Build **Hero Section**, **Pricing Section**, and **FAQ Section** for marketing sites.
- [ ] Build **Dashboard Shell**, **Settings Page**, and **Team Management** for applications.
- [ ] Build **Product Detail** and **Cart Drawer** for commerce.
- [ ] Keep AI components as a supported category instead of the default roadmap.
