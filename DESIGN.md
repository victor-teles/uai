---
name: Uai
description: A calm, browsable registry of source-owned components in the Beautiful UI language.
colors:
  accent: "oklch(0.57 0.185 257)"
  accent-foreground: "oklch(1 0 0)"
  canvas-light: "oklch(0.975 0.001 260)"
  surface-light: "oklch(1 0 0)"
  surface-raised-light: "oklch(0.94 0.003 260)"
  border-light: "oklch(0.915 0.003 260)"
  border-strong-light: "oklch(0.84 0.005 260)"
  text-light: "oklch(0.247 0.006 258)"
  muted-light: "oklch(0.47 0.01 260)"
  subtle-light: "oklch(0.55 0.01 260)"
  canvas-dark: "oklch(0.226 0.004 264)"
  surface-dark: "oklch(0.26 0.006 271)"
  surface-raised-dark: "oklch(0.293 0.006 271)"
  border-dark: "oklch(0.315 0.006 268)"
  border-strong-dark: "oklch(0.39 0.007 268)"
  text-dark: "oklch(0.964 0.002 248)"
  muted-dark: "oklch(0.731 0.008 261)"
  subtle-dark: "oklch(0.62 0.01 264)"
  success: "oklch(0.705 0.154 154)"
  warning: "oklch(0.746 0.156 56)"
  danger: "oklch(0.666 0.18 21)"
typography:
  display:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
  emphasis:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
  navigation:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.4
  mono:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1
  code:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "0.74rem"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  xs: "5px"
  sm: "6px"
  interactive: "7px"
  md: "8px"
  control: "8px"
  lg: "10px"
  xl: "12px"
  composer: "14px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  nav-item-active:
    backgroundColor: "{colors.surface-raised-dark}"
    textColor: "{colors.text-dark}"
    rounded: "7px"
    height: "29px"
  specimen:
    backgroundColor: "color-mix(in oklab, canvas 97%, text)"
    rounded: "{rounded.composer}"
    minHeight: "440px"
  segmented-pill:
    backgroundColor: "color-mix(in oklab, surface-raised 65%, transparent)"
    rounded: "{rounded.pill}"
    height: "24px"
  primary-action:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.pill}"
    height: "30px"
  secondary-action:
    backgroundColor: "{colors.surface-raised-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.pill}"
    height: "30px"
  prompt-composer:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    padding: "6px"
  prompt-composer-compact:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.xl}"
    padding: "4px"
  prompt-send:
    backgroundColor: "{colors.text-dark}"
    textColor: "{colors.surface-dark}"
    rounded: "{rounded.control}"
    height: "28px"
    width: "28px"
  prompt-send-compact:
    backgroundColor: "{colors.text-dark}"
    textColor: "{colors.surface-dark}"
    rounded: "{rounded.sm}"
    height: "24px"
    width: "24px"
  prompt-menu:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    padding: "4px"
  thinking:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
  approval-card:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    padding: "16px"
  approval-action:
    backgroundColor: "{colors.text-dark}"
    textColor: "{colors.surface-dark}"
    rounded: "{rounded.control}"
    height: "32px"
  task-list:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
  task-list-timeline:
    backgroundColor: "transparent"
    textColor: "{colors.text-dark}"
    rounded: "0px"
  task-list-compact:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.xl}"
  sign-in-card:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    padding: "20px"
  sign-in-card-split:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    padding: "24px"
  sign-in-card-compact:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.xl}"
    padding: "14px"
  sign-up-card:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    padding: "20px"
  sign-up-card-split:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    padding: "24px"
  sign-up-card-compact:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.xl}"
    padding: "14px"
  password-recovery:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    padding: "20px"
  password-recovery-split:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    padding: "0px"
  password-recovery-compact:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.xl}"
    padding: "14px"
  coupon-field:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    height: "44px"
  coupon-field-pill:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.pill}"
    height: "44px"
  coupon-field-compact:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.xl}"
    height: "34px"
  coupon-apply:
    backgroundColor: "{colors.text-dark}"
    textColor: "{colors.surface-dark}"
    rounded: "{rounded.lg}"
    height: "34px"
  quantity-picker:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    height: "44px"
  quantity-picker-pill:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.pill}"
    height: "44px"
  quantity-picker-compact:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.xl}"
    height: "34px"
  cart-item:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    padding: "16px"
  cart-item-plain:
    backgroundColor: "transparent"
    textColor: "{colors.text-dark}"
    rounded: "0px"
    padding: "0px 0px 18px"
  cart-item-compact:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.xl}"
    padding: "12px"
  price-summary:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    padding: "18px"
  price-summary-plain:
    backgroundColor: "transparent"
    textColor: "{colors.text-dark}"
    rounded: "0px"
    padding: "0px"
  price-summary-compact:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.xl}"
    padding: "12px"
  order-status:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    padding: "18px"
  order-status-plain:
    backgroundColor: "transparent"
    textColor: "{colors.text-dark}"
    rounded: "0px"
    padding: "0px"
  order-status-compact:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.xl}"
    padding: "12px"
  app-header-bar:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "0px"
    height: "56px"
    padding: "0px 16px"
  app-header-floating:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    height: "56px"
    padding: "8px"
  app-header-compact:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.xl}"
    height: "44px"
    padding: "4px 6px"
  install-command:
    backgroundColor: "color-mix(in oklab, canvas 97%, text)"
    textColor: "{colors.muted-dark}"
    rounded: "{rounded.lg}"
    height: "40px"
  command-palette:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.composer}"
    padding: "4px"
  highlighted-code:
    backgroundColor: "color-mix(in oklab, canvas 97%, text)"
    textColor: "{colors.text-dark}"
    typography: "{typography.code}"
    rounded: "{rounded.composer}"
---

# Design System: Uai

## Overview

**Creative North Star: "Specimens on a quiet page"**

Uai follows the Beautiful UI language (beautifului.dev): warm graphite, soft medium-weight type, tonal surfaces in place of hard borders, pill controls, and small, purposeful motion. The documentation site and the distributed components share one palette, so a component looks the same in the catalog and in a consumer's app.

**Key Characteristics:**

- A centered 1280px frame on a plain canvas, split by dashed hairlines.
- A sidebar with brand, theme toggle, tagline, search, and navigation grouped by category.
- One URL per registry item (`/components/<id>`), numbered in reading order with previous and next links.
- Variants switch from a segmented pill inside the specimen, not from a side rail.
- Medium weight (500) carries emphasis. 600 is reserved for page titles and one headline per card. Never 700.
- Accent blue fills the single primary affirmative action. Prompt Composer send stays ink.
- Ninety-eight registry items (57 components and 41 blocks) with live specimens, usage, installation, and accessibility notes.

## Colors

Warm graphite neutrals carry structure. One accent blue marks the primary action, links, selection, and focus.

### Accent

- **Accent** (`oklch(0.57 0.185 257)` in both themes): Primary affirmative buttons (Approve, Continue, Save, Apply, Checkout), selected checkboxes and radios, links, and focus rings. White text on it meets AA.

### Neutral

- **Canvas** (`oklch(0.226 0.004 264)` dark, `oklch(0.975 0.001 260)` light): Page background. Specimens tint it 3% toward the text color.
- **Surface** (`oklch(0.26 0.006 271)`): Cards, panels, popovers, and the command palette.
- **Raised** (`oklch(0.293 0.006 271)`): Hover fills, chips, secondary buttons, selected rows, and the active nav item.
- **Border** (`oklch(0.315 0.006 268)`): Hairlines. Prefer tone and spacing first.
- **Border Strong** (`oklch(0.39 0.007 268)`): Focused fields, floating-menu outlines, idle send, and the segmented thumb ring.
- **Text** (`oklch(0.964 0.002 248)`): Headings and primary labels.
- **Muted** (`oklch(0.731 0.008 261)`): Body copy in dense surfaces and inactive navigation.
- **Subtle** (`oklch(0.62 0.01 264)`): Tertiary metadata only: numbers, timestamps, counts, captions, and placeholders.

### Status

- **Success** (`oklch(0.705 0.154 154)`), **Warning** (`oklch(0.746 0.156 56)`), **Danger** (`oklch(0.666 0.18 21)`). Badges use the color as text over a 14% tint of itself, at 11.5px / 500 in a pill.

**The One Primary Rule.** A surface has at most one accent-filled action. Secondary actions use a Raised fill with no border.

**The Ink Send Rule.** Prompt Composer send uses Text on Surface when it can submit, and Border Strong when idle. Never accent.

## Typography

**Sans:** Inter Variable (site). Distributed components inherit the consumer's sans font.  
**Mono:** Geist Mono Variable, for commands, code, numbers in the catalog, and shortcuts.

### Hierarchy

- **Display** (600, `1.75rem`, `-0.025em`): The overview headline only.
- **Title** (600, `1.25rem`, `-0.015em`): The component name, preceded by its mono reading-order number.
- **Section** (600, `0.84rem`): Code example, Installation, Accessibility, and category headings.
- **Body** (400, 13px / 18px): Descriptions and fields.
- **Emphasis** (500, 13px): Row titles, buttons, tabs, and labels.
- **Navigation** (400, 12.5px; 500 when active).
- **Caption** (400, 11–11.5px, Subtle): Group labels, metadata, and stage captions. Sentence case, no tracking.

## Layout

The desktop frame is a 272px sticky sidebar and a flexible main column, centered at 1280px with 1px side rules on a plain canvas. The main column holds one 960px document: header, specimen, then Code example, Installation, and Accessibility sections. Dashed hairlines separate the sections, and a previous/next pager ends the page. The overview page shows the intro, a live Prompt Composer specimen, and a grid of cards for every item, grouped by category.

Below 900px, a sticky top bar holds the brand, search, and a menu button. The menu opens the same grouped navigation as a full-screen drawer. Below 640px, the pager stacks and the header metadata hides. The page never scrolls horizontally.

Navigation: ⌘K or `/` opens the command palette from anywhere. It searches by name, category, and description, supports arrow keys and Enter, and routes to the item's URL.

## Elevation & Depth

Depth comes from tone. Cards are Surface on Canvas, and specimens are a 3% tint of Canvas. Lifted exceptions:

- **Floating menu / palette** (`0 0 0 1px var(--uai-border-strong), 0 10px 28px` black at 42%): Popovers, composer menus, and the command palette.
- **Segmented thumb** (`0 0 0 1px var(--uai-border-strong)`): The active pill.

## Shapes

- Specimens, cards, code blocks, and menus: 14px (12px compact).
- Rows, inputs, and nav items: 7–10px. Chips and tags: 5–6px.
- Buttons, badges, segmented controls, and the theme toggle: full pill.

## Motion

- Hover color and background: 120ms ease-out.
- Press: `scale(0.97)` (0.92–0.96 for icon buttons), 140ms `cubic-bezier(0.23, 1, 0.32, 1)`.
- Pop-in (menus, palette): from `scale(0.96)` and opacity 0, 180ms `cubic-bezier(0.16, 1, 0.3, 1)`, origin at the trigger.
- Expand: `grid-template-rows` 0fr → 1fr with opacity, 300ms `cubic-bezier(0.23, 1, 0.32, 1)`. Chevrons rotate in 180ms.
- Page enter: 4px fade-up, 280ms.
- Live labels (thinking, running, uploading) shimmer from Subtle to Text.
- Reduced motion removes transforms, pop-ins, and shimmers.

## Components

### Sidebar navigation

- **Groups:** One group per category, with a Subtle caption. Components come before blocks, and blocks carry a hairline "Block" tag.
- **Rows:** 29px, 7px corners, Muted text. Active rows get a Raised fill, Text color, and weight 500, and scroll to the center of the list on navigation.
- **Search:** A field-styled button with a ⌘K hint that opens the command palette.

### Segmented pills

- **Shape:** Full pill track with 2px inset on a 65% Raised tint. The thumb slides with `transform` and `width` in 200ms `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Active state:** Raised (dark) or Surface (light) thumb with a Border Strong ring. Labels go from Subtle to Text.
- **Uses:** Variant choice centered at the bottom of each specimen. The track scrolls horizontally when space runs out.

### Specimen

- **Shape:** 14px radius, a 3% tint of Canvas, and a 1px inset Border ring. The stage inside is transparent, with a minimum height of 440px.
- **Content:** The component centered. An optional Subtle caption sits top-left.

### Prompt Composer

Compact product chrome for writing, attaching, choosing a model, and sending. This is the visual authority for installed AI input, not the workbench prompt mock. Plus, model, and send stay the same across variants.

- **Rounded:** 14px card. Graphite Surface. 6px padding. Hairline border with no card shadow. 28px controls with 8px corners.
- **Pill:** Full pill on one line, 24px when the field expands or attachments appear. Same 28px controls with pill corners.
- **Ghost:** No fill, no shadow, transparent hairline at rest. For docks and custom shells. Focus and invalid restore a 14px hairline. 28px controls with 8px corners.
- **Compact:** 12px card, 4px padding, 24px controls with 6px corners. Field type is 12.5px / 16px. Model label is 11px. Use in sidebars.
- **Row:** One line of controls: ghost plus, textarea, 12px model label (11px in compact), ink send. When the prompt wraps, the textarea takes the full width and the controls move to a second row.
- **Plus:** Ghost control. No border. Hover uses Raised Graphite. Open state rotates the icon 45 degrees and keeps the raised fill.
- **Send:** Enabled and busy use Primary Ink fill with Graphite Surface glyph. Idle uses Border Strong fill with muted glyph. Press scale is `0.94`. Never accent.
- **Menu:** 14px radius, 4px padding, 280px max for sources and 176px for models. Visible 1px outline through box-shadow. Rows stack a 12.5px name over an 11.5px description. Raised Graphite marks hover and focus. Menus keep this size in compact.
- **Focus:** Stronger hairline on the card. Caret and text selection use Primary Ink. Ghost shows the hairline only while focused.
- **Error:** Danger border on the card. Keep the graphite surface, or the transparent ghost fill.
- **Disabled:** Preserve structure and reduce the complete composer to 55% opacity.

### Thinking

An inspectable activity disclosure for live AI work and completed evidence. It describes
observable actions without presenting private chain-of-thought.

- **Surface:** Flat 14px Graphite Surface with one Hairline Border. Error changes the
  border to Danger; other states keep the neutral border.
- **Header:** A compact status glyph, title, explicit state label, user-safe summary,
  total elapsed time, and disclosure chevron. The live title shimmers; the status reads as a tinted pill.
- **States:** Thinking uses restrained motion, Complete uses Success, and Error uses
  Danger. State meaning always appears in text as well as color and iconography.
- **Activity:** Expanded content is a chronological, divider-led list. Update, Tool,
  File, and Search entries pair a plain-language label with optional structured evidence
  and per-entry elapsed time. File paths and queries wrap inside the component.
- **Disclosure:** Users control expansion. Status updates do not collapse content or
  replace the activity history. New live entries use a polite activity log, and reduced
  motion removes the spinner.
- **Empty:** Live work waits for its first activity; completed and failed work explain
  when no activity was recorded.

### Approval Card

A human-in-the-loop checkpoint for consequential AI-proposed actions. It makes the
risk, evidence, affected resources, changes, and downstream impact understandable
before a person approves or rejects the action.

- **Surface:** Flat 14px Graphite Surface with a Hairline Border and no shadow.
  Critical risk changes the border to Danger. The card remains compact rather than
  becoming an oversized alert.
- **Risk:** Low, Medium, High, and Critical always appear as text with semantic
  iconography. Color reinforces meaning but never carries it alone.
- **Content:** Compact presents risk, action, consequence, and decisions. Detailed
  adds a divider-led description list composed from consumer-owned `ApprovalCardDetail`
  regions. Long names and evidence wrap within the card.
- **States:** Ready, Submitting, Approved, Rejected, and Error are controlled by the
  consumer. Submitting exposes busy state and disables duplicate decisions. Approved
  and Rejected are terminal results.
- **Critical confirmation:** Critical risk requires an explicit confirmation phrase.
  Approval stays disabled until the exact phrase matches; rejection remains available.
- **Actions:** Reject is a raised secondary pill with no border. Approve is an accent pill
  (danger when risk is critical). Both carry explicit labels; "Approving…" shimmers.
- **Error:** Preserve the action context and composed evidence, announce the failure,
  name the recovery, and keep the decision actions available for retry.
- **Preview variants:** Demonstrate Compact, Detailed, Critical, and Error scenarios.
  Decisions visibly progress through Submitting to their terminal result. Detailed
  preview stages grow with their content so evidence, actions, and the variant control
  are never clipped on mobile.

### Task List

An ordered progress surface for complete, active, and pending work without owning
task execution, persistence, or navigation.

- **Composition:** The root owns visual density and list chrome. Item, Title, and
  Description remain named regions, while each item owns its status and optional
  localized status label.
- **States:** Complete, Active, and Pending always include visible text. Complete mixes
  Success with Primary Ink for AA text contrast, Active uses Primary Ink, and Pending
  uses Muted Ink; color never carries meaning alone. The active item also exposes
  current-step semantics.
- **Variants:** Card is the 14px bordered default for project checklists. Timeline
  removes the container and connects circular markers for workflow progress. Compact
  uses a 12px surface and denser rows for sidebars and drawers.
- **Content:** Titles and descriptions wrap instead of truncating, so long or localized
  task names remain available. Status badges remain short and aligned to the trailing edge.
- **Motion:** Only the active marker spins, and reduced-motion preferences disable it.
  Static states do not animate.
- **Affordance:** Rows are read-only by default and do not show a chevron or imply an
  unavailable action. Consumers can compose links or controls into task content when needed.
- **Preview:** Demonstrate Card, Timeline, and Compact with the same release checklist
  so density and structure can be compared without changing the underlying state.

### Sign-in Card

A composed authentication form that keeps provider and credential paths coherent without
owning identity APIs, session persistence, routing, or account recovery.

- **Composition:** Header, Title, Description, Body, Providers, Provider, Divider, Fields,
  Field, Label, Input, Field Message, Options, Error, Submit, and Footer remain named
  replaceable regions. The root owns visual density, busy state, and accessibility IDs.
- **Variants:** Card uses a 14px bordered surface with 20px inset for dialogs and centered
  sign-in pages. Split uses the same surface with 24px inset and places providers beside
  credentials on wider screens, then returns to one column on mobile. Its divider uses the
  concise label `or` because both paths are already visible. Compact uses a 12px surface,
  14px inset, and 34px controls for embedded account prompts.
- **Providers and credentials:** Provider controls are native non-submit buttons. Email and
  password remain native inputs with programmatic labels, browser autocomplete, and consumer-
  owned validation. Password reveal exposes pressed state and never submits the form.
- **States:** Idle, Submitting, and Error are consumer-controlled. Submitting exposes form
  busy state and disables provider, field, reveal, and submit controls to prevent duplicate
  authentication work. Successful routing remains the application's responsibility.
- **Errors:** Global failures use an assertive alert and name recovery. Field errors use
  visible Danger text, border, `aria-invalid`, and an associated message; meaning never
  depends on color alone.
- **Preview:** Demonstrate Card, Split, and Compact with the same provider and credential
  content. The password `preview` completes the illustrative interaction; other values show
  recoverable error feedback.

### Sign-up Card

A composed account-creation form that keeps providers, identity fields, password guidance,
required consent, and verification handoff coherent without owning identity APIs, sessions,
email delivery, routing, or navigation.

- **Composition:** Header, Title, Description, Body, Providers, Provider, Divider, Fields,
  Field, Label, Input, Field Message, Password Guide, Password Requirement, Consent,
  Checkbox, Error, Submit, Verification, and Footer remain named replaceable regions. The
  root owns visual density, form busy state, and shared title and error IDs.
- **Variants:** Card uses a 14px bordered surface with 20px inset for account dialogs. Split
  uses the same surface with 24px inset and keeps provider and email paths visible side by
  side on wider screens, then returns to one column on mobile. Its divider uses the concise
  label `or`. Compact uses a 12px surface, 14px inset, and 34px controls for invitations and
  embedded onboarding.
- **Providers and fields:** Providers are native non-submit buttons. Name, email, and password
  remain native inputs with programmatic labels, browser autocomplete, and consumer-owned
  validation. Password reveal exposes pressed state and never submits the form.
- **Password guidance:** Requirements remain visible, state their met or unmet result in text
  for assistive technology, and are explicitly associated with the password input through
  `aria-describedby`. Error copy is associated separately so both references remain intact.
- **Consent:** Consent composes a native checkbox with visible terms and privacy links. The
  consuming application marks the checkbox required and owns the policy text and acceptance
  record; the component only supplies layout, focus, and disabled-state behavior.
- **States:** Idle, Submitting, Error, and Verification are consumer-controlled. Submitting
  exposes form busy state and disables providers, fields, consent, reveal, and submit controls
  to prevent duplicate account work. Verification replaces the form body with a polite status
  handoff and a consumer-owned recovery action.
- **Errors:** Global account-creation failures use an assertive alert. Field errors use visible
  Danger text, border, `aria-invalid`, and an associated message; meaning never depends on
  color alone.
- **Preview:** Demonstrate Card, Split, and Compact with the same provider, field, consent,
  and password-requirement content. A valid password advances to Verification; incomplete
  guidance demonstrates recoverable field and form errors without implying a real account.

### Password Recovery

A composed account-recovery workflow that keeps account lookup, email handoff, password
replacement, expired links, and completion feedback coherent without owning identity APIs,
email delivery, token validation, password persistence, routing, or navigation.

- **Composition:** Aside, Progress, Progress Item, Main, Header, Title, Description, Stage,
  Fields, Field, Label, Input, Field Message, Password Guide, Password Requirement, Error,
  Submit, Status, Actions, Action, and Footer remain named replaceable regions. The root owns
  the controlled step, visual variant, busy state, and shared title and error IDs.
- **Variants:** Card uses a 14px bordered surface with 20px inset for recovery dialogs. Split
  uses a two-region 14px surface: a raised progress rail and a 24px action panel on wider
  screens, returning to one column on mobile. Compact uses a 12px surface, 14px inset, and
  34px controls for account drawers and support prompts.
- **Workflow:** Request, Sent, Reset, Expired, and Success are consumer-controlled steps.
  Only the matching composed Stage renders. Idle, Submitting, and Error remain independent
  async states so the application can reflect backend work without changing the current step.
- **Privacy:** Sent copy must not confirm whether the submitted email belongs to an account.
  Email delivery, reset tokens, rate limits, account lookup, and navigation remain consumer-owned.
- **Passwords:** New-password inputs use browser autocomplete, optional reveal controls with
  pressed state, explicitly associated requirement guidance, and separately associated field
  errors so validation remains understandable without color.
- **Feedback:** Sent and Success use polite status announcements. Expired uses an assertive
  alert with a clear recovery action. Backend failures use the independent Error region.
  Submitting disables fields, reveal, action, and submit controls to prevent duplicate work.
- **Preview:** Demonstrate Card, Split, and Compact with the same email and recovery progress.
  The live specimen can request a link, open a reset form, preview expiry, validate the new
  password, and reach success without implying that a real email was sent.

### Coupon Field

A checkout-safe discount control for applying, replacing, and removing one coupon
without owning the surrounding checkout form or the commerce backend.

- **Composition:** The root owns the draft value, action rules, and accessibility IDs.
  Label, Control, Input, Apply, Feedback, Message, and Remove remain named replaceable regions.
- **Control:** A 14px Graphite Surface with a one-pixel Hairline Border and 4px inset.
  The text input and attached 34px action stay on one line and shrink without overflow.
- **Variants:** Rounded is the 14px default for checkout summaries. Pill uses a full
  capsule for promotional surfaces. Compact uses a 12px shell, 2px inset, and 28px
  controls for cart drawers. All three keep the same behavior and accessibility contract.
- **Actions:** Apply and Replace are accent pills with a quiet raised fill when disabled.
  Remove is a ghost pill beside feedback. "Checking this code…" shimmers.
- **States:** Idle, Applying, Applied, and Error are consumer-controlled. Applying
  exposes busy state and blocks duplicate work. Applied and Error keep the current
  coupon removable while a replacement is attempted.
- **Feedback:** Success uses a Success icon and polite status announcement. Error uses
  Danger border, icon, text, `aria-invalid`, and an assertive alert. Meaning never
  depends on color alone.
- **Checkout safety:** The component does not render a form. Enter applies a valid
  draft from the input, so the field can live inside an existing checkout form.
- **Preview:** Show a live order summary with `WELCOME20` applied. `SAVE20` is also
  accepted; other illustrative codes demonstrate recoverable error feedback. Switch
  Rounded, Pill, and Compact in one specimen without resetting coupon state.

### Quantity Picker

A limit-aware commerce control for changing one line item's quantity without owning
inventory checks, cart persistence, pricing, or the surrounding purchase form.

- **Composition:** The root owns the current value, direct-edit draft, limits, step
  behavior, and accessibility IDs. Label, Control, Decrease, Input, Increase, and
  Message remain named replaceable regions.
- **Control:** A 14px Graphite Surface with a one-pixel Hairline Border and 4px inset.
  The two raised 34px actions flank a centered tabular input and remain one compact row.
- **Variants:** Rounded is the 14px default for product details. Pill uses a full capsule
  shell and circular actions for cart lines. Compact uses a 12px shell, 2px inset, and
  28px actions for drawers. All three preserve the same behavior and keyboard contract.
- **Limits:** Minimum and maximum bounds disable only the action that cannot proceed.
  Direct input clamps to the configured range when it commits; invalid or empty drafts
  restore the current value.
- **Keyboard:** Enter commits direct input, Escape restores the current value, and native
  focus moves through Decrease, Input, and Increase. Every icon-only action has an
  explicit accessible name.
- **Focus:** Direct-input focus suppresses inherited outlines and strengthens only the
  shell. The stepper is a raised tonal fill with ghost buttons and no border.
- **Feedback:** Consumer-authored stock copy is associated with the input. Muted, Warning,
  and Danger tones reinforce meaning while the text and optional live-region role carry it.
- **Preview:** Demonstrate Rounded, Pill, and Compact on the same tote line. Quantity
  updates the canonical line total, while the stock message names the five-item limit.

### Cart Item

A composed commerce row that keeps product identity, selected options, availability,
quantity, price, and removal together without owning cart calculations or persistence.

- **Composition:** Media, Content, Header, Title, Description, Price, Options, Option,
  Availability, Actions, and Remove remain named replaceable regions. Quantity Picker
  is a registry dependency composed inside Actions instead of being reimplemented.
- **Layout:** Product media anchors a two-column row at 72px-96px. The content column
  keeps title and line price first, selected options and availability second, then
  quantity and removal after a Hairline Border. Long names and localized values wrap.
- **Variants:** Card uses a 14px bordered surface with 16px inset for full cart pages.
  Plain removes outer chrome and ends with a hairline for checkout review lists. Compact
  uses a 12px surface, 12px inset, 72px media, and tighter type for cart drawers. All
  three preserve the same semantic and keyboard contract.
- **Availability:** Available, Low, and Unavailable tones reinforce consumer-authored
  text. Meaning remains explicit in words and the consumer may opt into a live region.
- **Removal:** Remove is a native button and defaults to `type="button"`. Its controlled
  removing state disables duplicate actions, exposes `aria-busy`, and names the work in
  progress without removing the cart line before the application confirms persistence.
- **Preview:** Demonstrate Card, Plain, and Compact with the same tote, options, price,
  five-item limit, interactive quantity, and controlled removal feedback.

### Price Summary

A read-only order total that explains how subtotal, discounts, shipping, and taxes
produce the final amount without owning cart calculations or currency formatting.

- **Composition:** Header, Title, Description, List, Item, Total, and Note remain named
  replaceable regions. Consumers supply already-formatted labels and values; the component
  owns hierarchy, description-list semantics, and responsive alignment.
- **Rows:** Supporting amounts use 12px-12.5px type, tabular numerals, muted labels, and
  dotted leaders. The final amount sits after a stronger hairline and uses a larger,
  semibold tabular value. Discounts may use Success, but their label and signed value
  communicate meaning without color.
- **Variants:** Card uses a 14px bordered surface with 18px inset for checkout sidebars.
  Plain removes outer chrome for payment steps and existing panels. Compact uses a 12px
  surface, 12px inset, and tighter rhythm for cart drawers. All variants preserve the
  same content and semantic contract.
- **Overflow:** Long labels and localized formatted values wrap inside their column.
  Price rows never create page-level horizontal scrolling.
- **Preview:** Demonstrate Card, Plain, and Compact against the same realistic order so
  the switcher compares visual treatment rather than changing the data scenario.

### Order Status

A read-only fulfillment timeline that keeps order stages, carrier facts, and support
destinations visible without owning logistics data or polling behavior.

- **Composition:** Header, Title, Description, Badge, Progress, Step, Step Title, Step
  Description, Details, Detail, Actions, and Action remain named replaceable regions.
  Consumers compose fulfillment stages and supply links; the component owns hierarchy,
  ordered progress semantics, and responsive containment.
- **Progress:** Stages use a compact vertical track with 18px-22px outlined markers and
  a one-pixel connector. Complete, Current, Upcoming, and Needs attention appear as
  visible labels in addition to icon and color. Only Current exposes `aria-current="step"`.
- **Variants:** Card uses a 14px bordered surface with 18px inset for account pages.
  Plain removes outer chrome for confirmation layouts. Compact uses a 12px surface,
  12px inset, 18px markers, and tighter rhythm for drawers. All variants preserve the
  same content and semantic contract.
- **Facts and actions:** Carrier and tracking values use description-list semantics and
  wrap long identifiers. Primary and secondary links remain consumer-owned destinations
  with visible focus and 34px controls, reduced to 32px in Compact.
- **Preview:** Demonstrate Card, Plain, and Compact with the same in-transit order so the
  switcher compares visual treatment without implying live carrier data.

### App Header

A responsive application landmark that keeps product identity, primary navigation, search,
account actions, and mobile overflow together without owning routing or application data.

- **Composition:** Brand, Overflow, Nav, Nav Item, Search, Actions, Action, and Menu Button
  remain named replaceable regions. Consumers supply destinations, search handling, icons,
  and account-menu behavior; the root owns variant chrome and responsive disclosure state.
- **Navigation:** Primary destinations retain list semantics and the active destination uses
  `aria-current="page"`. Search uses a native search input with a persistent accessible label.
  Account controls are native buttons with explicit accessible names.
- **Responsive overflow:** At narrow widths, navigation and search move below the always-visible
  brand and account actions. The menu button exposes controlled and expanded state, and its
  action label changes between Open navigation and Close navigation.
- **Variants:** Bar is a 56px edge-to-edge application boundary with a bottom hairline.
  Floating is a 14px inset surface with restrained offset depth. Compact is a 44px, 12px
  surface with 28px controls for dense operations consoles. All preserve the same semantic
  and keyboard contract.
- **Preview:** Demonstrate Bar, Floating, and Compact with the same Atlas workspace navigation.
  The mobile preview keeps the overflow interactive so destinations and search remain reachable.

### Empty State

A composed blank-slate surface that explains why content is absent and offers a clear next
step without owning data detection, navigation, dialogs, or persistence.

- **Composition:** Media, Content, Header, Title, Description, Actions, Action, and Note remain
  named replaceable regions. The root owns labelling, placement chrome, and responsive
  containment; consumers own the empty condition, copy, icon meaning, and action behavior.
- **Hierarchy:** One quiet media tile leads into a concise title and practical explanation.
  Page may replace the tile with a large diagnostic code. The primary action follows
  immediately; supporting guidance stays visually subordinate. Long localized copy wraps
  inside a 52-character measure without truncation.
- **Variants:** Card uses a centered 14px bordered surface with generous inset for blank pages.
  Plain removes outer chrome for panels that already provide containment. Compact becomes a
  left-aligned 12px surface with a smaller media tile and 32px actions for sidebars and dense
  workspaces. Page becomes a transparent, wrapped full-page composition with 160px diagnostic
  media and 36px actions; it stacks naturally in narrow viewports. All variants preserve the
  same content and action contract.
- **Actions:** Primary actions are accent pills. Secondary actions are raised pills
  with no border. Buttons default to `type="button"`; destinations retain native anchor
  semantics. Empty State never invents navigation or async work.
- **Announcements:** Static empty content is not a live region by default. Consumers may add a
  status or alert role only when an empty state appears as the result of a user-triggered change.
  Decorative icons stay hidden; meaningful media keeps consumer-authored accessible text.
- **Preview:** Demonstrate Card, Plain, and Compact with the same project blank slate so the
  switcher compares placement. Page demonstrates a complete 404 recovery route with primary
  and secondary destinations.

### Install command

- **Shape:** 40px high with a 10px radius. The field uses the specimen tint with an inset Border ring.
- **Content:** Keep the command on one line and allow internal horizontal scrolling.
- **Action:** A 32px ghost copy button sits inside the field.

### Manual installation

- **Disclosure:** A "Manual installation" toggle under the CLI command expands with `grid-template-rows`. The closed body is inert.
- **Content:** Name the target file, load the actual source from the generated registry document, and provide a dedicated source-copy action.

### Command palette

- **Trigger:** ⌘K, Ctrl+K, `/`, or the sidebar search button.
- **Shape:** 560px wide, 14px radius, Surface fill, floating-menu outline, and a pop-in over a 42% black backdrop.
- **Rows:** 36px rows with icon, name, and category. The active row has a Raised fill and shows an Enter glyph.
- **Semantics:** A native modal `<dialog>` holding a combobox input and a listbox.

### Highlighted code

- **Renderer:** Use Fumadocs UI `DynamicCodeBlock` with Shiki TSX highlighting for the usage example and manual component source.
- **Type:** Use the code role (`0.74rem`, 1.7) and preserve token-level syntax color.
- **Overflow:** Contain scrolling inside the code region. Never allow highlighted code to widen the page.

## Do's and Don'ts

### Do:

- **Do** give every registry item its own URL and keep the sidebar, palette, and pager in one reading order.
- **Do** keep the catalog limited to the verified ninety-eight items.
- **Do** use dashed hairlines and tone, not boxes, to create hierarchy.
- **Do** place variant choice inside the specimen as a segmented pill.
- **Do** use highlighted TSX for both usage examples and manual source.
- **Do** reserve accent blue for one primary action per surface, plus selection, links, and focus.
- **Do** use ink send, 14px composer corners, and 28px ghost controls on Prompt Composer. Use ghost for docks and compact for sidebars.
- **Do** give plus and model menus a visible rounded outline and a compact width.
- **Do** keep Thinking disclosure user-controlled and preserve its chronological activity history across status changes.
- **Do** keep Approval Card risk, content density, and async status as independent dimensions.
- **Do** require typed confirmation before a critical action can be approved.
- **Do** keep Task List status visible in text and preserve ordered-list semantics across variants.
- **Do** keep Sign-in Card authentication state consumer-controlled and preserve native form semantics.
- **Do** keep Sign-up Card account-creation and verification state consumer-controlled, preserve
  native form semantics, and explicitly associate password guidance with its input.
- **Do** keep Password Recovery steps and async state consumer-controlled, preserve native form
  semantics, and avoid revealing whether a submitted email belongs to an account.
- **Do** keep Coupon Field async state consumer-controlled and safe inside checkout forms.
- **Do** keep Quantity Picker inventory and cart persistence consumer-controlled.
- **Do** compose Quantity Picker inside Cart Item instead of duplicating its behavior.
- **Do** keep Cart Item pricing, inventory, and removal persistence consumer-controlled.
- **Do** keep Price Summary calculation-free: consumers supply formatted labels and values.
- **Do** keep Order Status presentation-only: consumers supply fulfillment stages, facts, and links.
- **Do** keep App Header routing, search results, notifications, and account menus consumer-owned.
- **Do** keep Empty State detection, copy, destinations, and action behavior consumer-owned.
- **Do** expose meaningful variants from the component root and demonstrate each one.

### Don't:

- **Don't** turn the overview into a marketing page; it is an index with one live specimen.
- **Don't** add gradients, decorative illustrations, or large ambient shadows.
- **Don't** use weight 700, uppercase tracked labels, or bordered secondary buttons.
- **Don't** use fictional registry inventory to create density.
- **Don't** let command or code content create page-level horizontal overflow.
- **Don't** make closed disclosure content focusable or available to pointer interaction.
- **Don't** use mono for general prose.
- **Don't** paint Prompt Composer send with the accent.
- **Don't** give the ghost variant a card fill or drop shadow.
- **Don't** ship a square floating menu or a full-bleed slab over the preview.
- **Don't** present private chain-of-thought as Thinking activity; show only user-safe summaries and observable evidence.
- **Don't** hide approval risk in color alone or let a critical action bypass confirmation.
- **Don't** make Sign-in Card call an identity provider, store sessions, or navigate after success.
- **Don't** make Sign-up Card create identities, persist sessions or consent, send verification,
  or navigate after success.
- **Don't** make Password Recovery look up accounts, send email, validate reset tokens, persist
  passwords, or navigate after completion.
- **Don't** nest a form inside Coupon Field or hide coupon errors in color alone.
- **Don't** pass a product data object into Cart Item or let it calculate line totals.
- **Don't** make Price Summary calculate taxes, discounts, currency, or cart state.
- **Don't** make Order Status infer carrier events, poll logistics services, or hide stage meaning in color.
- **Don't** hide App Header navigation without an expanded menu control or replace link semantics with click handlers.
- **Don't** announce static Empty State content as a live region or make its media carry meaning without accessible text.
- **Don't** treat async states or preview scenarios as substitutes for visual variants.

## Beautiful UI polish pass

Every distributed item received the same polish pass. Where an older paragraph below
disagrees, these rules win.

- **Actions:** One accent pill per surface for the primary affirmative action. Secondary
  actions are raised pills with no border. Destructive confirms use solid danger. Icon
  controls are 28px ghosts with 8px corners. Prompt Composer send stays ink.
- **Status:** Tinted pills (14% tone fill, tone text, 11.5px / 500), optionally with a
  dot. Live labels (Thinking, Running, Uploading, Saving, Checking) shimmer.
- **Surfaces:** Tone before borders. Inner panels, wells, and code use Raised or Canvas
  insets. Outer cards keep a faint hairline. Rails and timelines use solid hairlines,
  not dotted ones.
- **Fields:** Canvas fill, Border Strong on focus, plus an accent focus ring, and a danger
  ring when invalid. Selected checkboxes, radios, range endpoints, and "today" use the
  accent.
- **Motion:** Sliding thumbs and indicators for tabs, toggles, and segmented controls.
  Fade-up with a stagger of 40ms or less for entering rows (first six only). Pop-in for
  menus and dialogs. `grid-template-rows` for expand.
- **Interaction states in source:** Inline styles cannot express `:hover`, so each root
  renders a small scoped `<style>` block (or uses Tailwind arbitrary classes, which require
  the consumer's Tailwind to scan `components/ui/uai`). Every animation has a
  `prefers-reduced-motion` fallback.

## Forms and usability

All eight form components use the the warm graphite tokens in light and dark themes, 13px field type, visible native keyboard focus, and consumer-composed content. New visual values live in the distributed source as inline styles. They use no entrance animation, so reduced motion does not require a separate path.

| Component | Visual variants | Interaction contract |
| --- | --- | --- |
| Form Field | outlined / filled / compact | Labels, descriptions, requirements, validation, and character counts. |
| Search Field | rounded / pill / compact | Clearable search with recent queries, loading, empty, and error feedback. |
| Filter Bar | toolbar / panel / compact | Composable filters, removable chips, result counts, and reset actions. |
| File Upload | dropzone / inline / compact | File selection and drag and drop with validation, progress, retry, and removal. |
| Date Range Picker | card / split / compact | Presets, date inputs, and a keyboard-navigable calendar for local date ranges. |
| Form Error Summary | card / plain / compact | A submission error summary with links that focus the matching fields. |
| Unsaved Changes Bar | bar / floating / compact | Persistent save and discard actions with busy, error, and page-exit warnings. |
| Step Indicator | horizontal / vertical / compact | Current, complete, optional, blocked, and error steps with explicit status text. |

Outlined fields have a 14px border; filled fields use the raised surface and compact fields reduce padding. Search uses a 14px shell, full pill, or 12px compact shell. Filter panels stack content over a raised surface; toolbars wrap controls in a horizontal row. Upload dropzones use a dashed 14px card with centered content; inline uses a horizontal row, and compact uses 12px corners. Date range Split places presets beside the calendar when space permits and wraps them above on narrow screens. Error text mixes 75% danger with primary ink to retain contrast in both themes. Error summaries use a danger border and textual errors; Plain removes the card fill. Unsaved bars remain in flow and stick to their containing scroll region; Floating adds an inset and shadow. Step indicators wrap horizontally, stack vertically, or use compact pills.

Backend search, upload transport, saves, validation policy, routing, and wizard navigation remain consumer-owned. File validation covers file type, size, and count before handing files to the application. Date inputs, presets, and day buttons share local-date bounds. Calendar navigation supports arrows, Home/End, Page Up/Down, and Shift for year changes. Unsaved state enables native beforeunload warnings by default; app-router transitions require the consuming application’s blocker.

## Navigation and layout

All five navigation components use the the warm graphite tokens in light and dark themes, 13px / 18px type, and consumer-composed content. New visual values live in the distributed source as inline styles.Only the floating Command Menu animates, and it skips the animation under reduced motion.

| Component | Visual variants | Interaction contract |
| --- | --- | --- |
| App Sidebar | panel / inset / compact | Nested navigation, collapsed mode, mobile disclosure, and active states. |
| Breadcrumb Trail | chevron / slash / contained | Hierarchy with label truncation, collapsed levels, and a compact back-link fallback. |
| Page Tabs | underline / pill / segmented | APG tabs with counts, page actions, and horizontal overflow. |
| Command Menu | panel / floating / compact | Combobox search over grouped commands with arrows, Home/End, Enter, and Escape. |
| Split Pane | card / flush / inset | A window splitter with keyboard resizing, pointer dragging, and saved proportions. |

App Sidebar Panel uses a bordered 14px card; Inset drops the border onto the raised surface and marks the active row with an outlined surface fill; Compact uses a 12px card, 28px rows, and 24px icon controls. Expanded width is 248px (216px compact) and collapsed width is 60px (48px compact). Active rows use primary ink at weight 550 on the raised surface. Breadcrumb separators use the strong border color; Contained wraps the trail in a 12px raised pill. Labels truncate at 160px by default. Page Tabs Underline uses a 2px ink indicator on a hairline; Pill fills the selected tab with ink; Segmented places the tab list in a 12px raised track with an outlined surface segment for the selected tab. Counts use 11px tabular figures. Command Menu Panel and Compact use bordered 14px and 12px cards. Floating follows the floating-menu rule: 14px corners, 4px padding, a visible outline, an offset shadow, and a pop-in from `scale(0.96)` in 180ms `cubic-bezier(0.23, 1, 0.32, 1)`. The active option uses the raised surface. Split Pane Card uses a bordered 14px card, Flush removes chrome, and Inset separates two 12px panes on the raised surface. The handle has a 12px hit area, a 1px line, and a 4×24px grip.

Routing, permissions, command execution, dialog placement, and global shortcuts remain consumer-owned. The sidebar and breadcrumb switch to their mobile forms with a media query that consumers can override. Split Pane persists proportions only when given a `storageKey`.

## Feedback and state

All six feedback components use the the warm graphite tokens in light and dark themes, 13px / 18px body type, visible native keyboard focus, and consumer-composed content. New visual values live in the distributed source as inline styles; the dialog pop-in and skeleton motion ship as a small scoped `<style>` block because they need keyframes, `::backdrop`, and a `prefers-reduced-motion` override.

| Component | Visual variants | Interaction contract |
| --- | --- | --- |
| Status Banner | card / tinted / bar | Information, success, warning, and error states with optional actions and dismissal. |
| Progress Summary | card / inline / compact | Progress, elapsed time, remaining work, and cancellation. |
| Inline Feedback | text / pill / outlined | Pending, success, and error messages beside a local action in a polite live region. |
| Confirmation Dialog | centered / sheet / compact | A native modal that explains impact, with optional typed confirmation. |
| Activity Timeline | rail / card / compact | Events, actors, timestamps, metadata, and grouped dates. |
| Skeleton Group | shimmer / pulse / static | Composable placeholders that match page structure without layout shift. |

Status banners use a 14px card with a tinted icon circle, a tinted 14px surface (10% tone mixed into the surface, 5% for information), or a full-width bar with a tinted bottom hairline. Information uses the accent. Progress bars are 6px (4px compact) pills filled with primary ink, success when complete, danger on failure, and 45% opacity when paused or cancelled; the percentage uses tabular numerals. Inline feedback stays plain text, or wraps the message in a raised pill or an outlined pill; errors mix 75% danger with primary ink. The confirmation dialog uses a 14px card (12px compact, 24px top corners for the bottom sheet), the visible floating outline `0 0 0 1px var(--uai-border-strong)` with an offset shadow, and a pop-in from `scale(0.96)` in 180ms `cubic-bezier(0.23, 1, 0.32, 1)`; the destructive action uses danger darkened with black, and turns `--uai-border-strong` while blocked. Timeline markers are 28px raised circles (16px compact) joined by a dotted hairline rail; Card wraps each date group in a 14px card. Skeleton shapes use the raised surface with a faint border inset, pill lines, 12px blocks, and 14px cards; shimmer and pulse stop under reduced motion, and Static never animates.

Banner copy, job control, the action behind inline feedback, the destructive operation, event data and formatting, and when to swap skeletons for content remain consumer-owned. Banners do not move focus after dismissal. Elapsed and remaining figures are consumer-formatted strings. Typed confirmation compares text exactly and resets when the dialog closes.

## Data display

All seven data display components use the warm graphite tokens in light and dark themes, 13px / 18px body type, tabular numerals for figures, visible native keyboard focus, and consumer-composed content. New visual values live in the distributed source as inline styles. Emphasis comes from tone, weight 500, and accent for the one primary action. 
| Component | Visual variants | Interaction contract |
| --- | --- | --- |
| Data Table Toolbar | toolbar / stacked / compact | Search, filters, column visibility, export, and bulk actions for selected rows. |
| Metric Card | card / plain / compact | A value with comparison, trend, and supporting context. |
| Description List | inline / stacked / grid | Labeled facts with responsive alignment and optional actions. |
| Comparison Table | bordered / plain / compact | Compare plans or products with sticky labels and highlighted differences. |
| Kanban Board | board / plain / compact | Columns, cards, keyboard movement, and empty states. |
| Calendar View | card / plain / compact | Day, week, and month layouts with event overflow. |
| Audit Log | card / timeline / compact | Actors, actions, resources, timestamps, filters, and event details. |

Toolbars wrap controls in a 14px card; Stacked places search above the controls on the raised surface, and Compact uses a 12px card with 24px controls. The column panel is a floating menu: 14px corners, 4px padding, the strong-border outline, an offset shadow, and a 180ms pop-in from `scale(0.96)` that is skipped under reduced motion. Bulk actions appear on a raised strip only while rows are selected. Metric values are 28px semibold (20px in Compact); trends are raised pills that pair an arrow with text, and success or danger color is mixed with ink and is never the only signal. Description lists wrap values below labels on narrow widths without media queries; Grid uses 12px cells. Comparison tables keep row labels and headers sticky, mark the recommended column with an ink pill, and label highlighted rows "Differs" with an inset ink rule. Kanban columns use raised surfaces in Board, divider rules in Plain, and 12px corners in Compact; a picked-up card gets an ink border and a soft shadow, and empty columns show a dashed placeholder. Calendar day cells mark today with an ink circle and collapse extra events into a "+N more" button; adjacent-month days use the canvas color. Audit events expand into a bordered description list; Timeline adds a hairline rail with dots.

Data fetching, filtering, sorting, export, selection, persistence of board order, event sources, and audit retention remain consumer-owned. Kanban order is a controlled map of column ids to card ids, and pointer dragging uses native HTML drag and drop without a library. Calendar dates are local calendar days with no timezone conversion; pass `today` to keep server and client output identical.

## Content and community

All five content components use the the warm graphite tokens in light and dark themes, 13px / 18px body type, visible native keyboard focus, and consumer-composed content. New visual values live in the distributed source as inline styles.Only the Reaction Bar picker and the Share Menu animate, and both skip the animation under reduced motion.

| Component | Visual variants | Interaction contract |
| --- | --- | --- |
| Author Card | card / inline / compact | Identity with an initials fallback, biography, profile links, and a follow toggle. |
| Comment | thread / card / compact | Nested replies, reactions, inline editing, moderation states, and timestamps. |
| Reaction Bar | pill / outlined / compact | Toggle reactions named with their counts, plus an add-reaction menu. |
| Share Menu | outlined / ghost / compact | Native sharing, copy-link feedback, and share channels in a floating menu. |
| Changelog Entry | timeline / card / compact | Release date, version, categories, and linked changes. |

Author Card uses a bordered 14px card with a 48px avatar, an inline row with a 40px avatar and no chrome, or a 12px compact card with a 32px avatar and 24px controls. Avatars are raised circles with a hairline inset and 600-weight initials. Follow is an ink pill while unpressed and an outlined raised pill with a check while pressed; its label stays "Follow". Profile links are 28px raised pills. Comment Thread has no chrome and joins replies with a dotted strong-border rail; Card wraps each comment in a 14px bordered card; Compact uses 24px avatars and controls. Comment actions are ghost 28px pills. Save follows the send rule: ink on the surface when it can submit, `--uai-border-strong` when the draft is empty. Moderation notices are 12px muted text with an icon, and removed comments are italic. Reaction Bar Pill uses raised pills, Outlined uses hairline pills, and Compact uses 24px hairline pills; a selected reaction uses the surface with a 1px ink ring and 600-weight count in tabular figures. The add-reaction control is a ghost 28px circle. Share Menu Outlined uses a strong-border pill trigger, Ghost has no chrome until open, and Compact uses a 24px trigger with 8px corners; the trigger icon turns into a check for two seconds after a copy. The reaction picker and share menu follow the floating-menu rule: 14px corners, 4px padding, a visible outline, an offset shadow, and a pop-in from `scale(0.96)` in 180ms `cubic-bezier(0.23, 1, 0.32, 1)`; the focused item uses the raised surface. Changelog Timeline places version and date in a 128px column beside a dotted rail and stacks below it on narrow widths; Card uses a 14px card and Compact a 12px card. Versions are monospace raised pills, and category badges are hairline pills with a 6px tone dot (success for added, warning for fixed, danger for security, muted for removed, ink for improved) beside a text label.

Follow persistence, comment storage, permissions, moderation policy, reaction counts, share destinations, link formatting, and release content remain consumer-owned. Reaction counts are passed in, including the current person's reaction. Native sharing appears only where `navigator.share` exists. Copy results are announced in a polite live region.

## Marketing and conversion

All six marketing components use the the warm graphite tokens in light and dark themes, 13px / 18px body type, visible native keyboard focus, and consumer-composed content. New visual values live in the distributed source as inline styles.Only Product Gallery animates: the zoom transform and the fullscreen pop-in ship as a small scoped `<style>` block and stop under reduced motion.

| Component | Visual variants | Interaction contract |
| --- | --- | --- |
| Announcement Bar | bar / card / pill | A campaign message with actions, dismissal, and remembered dismissal. |
| Pricing Toggle | segmented / pill / compact | An APG radio group for billing periods with savings labels and per-period prices. |
| Testimonial Card | card / editorial / compact | A quote with the person, role, organization, and an optional proof link. |
| Product Gallery | stacked / side / compact | Thumbnail selection, zoom, and a native fullscreen dialog with required alt text. |
| Trust Panel | card / plain / compact | Customer logos, a rating with a text equivalent, and certification badges. |
| Newsletter Form | inline / stacked / card | Email signup with consent, validation, pending, success, duplicate, and error states. |

Announcement Bar uses the raised surface with a bottom hairline, a bordered 14px card, or a 24px-radius floating pill with the visible outline and a soft offset shadow; its label is an ink pill and its action is a 28px ink pill. Pricing Toggle places options in a 12px raised track with an outlined surface segment (Segmented), fills the selected option with ink inside a full pill (Pill), or shrinks to a 10px track with 24px options (Compact); savings labels tint `currentColor` so they read on both selected and idle options. Testimonial Card uses a bordered 14px card with 15px quote type, an editorial 20px quote beside a 2px strong rule, or a 12px compact card with 13px quote type; avatars are 36px raised circles (28px compact). Product Gallery uses a 4:3 raised viewport with 14px corners (12px compact) and 64px thumbnails (48px compact) whose selection is a 2px ink ring; Side moves thumbnails into a 72px column and stacks below 560px. Overlay controls are 28px surface circles with the strong outline. The fullscreen dialog follows the floating rule: 14px corners, 4px padding, the visible outline, an offset shadow, and a pop-in from `scale(0.96)` in 180ms `cubic-bezier(0.23, 1, 0.32, 1)`. Trust Panel logos sit in 48px raised tiles (32px compact, outlined in Plain); stars use ink and the strong border, and badges are 28px outlined pills. Newsletter Form wraps the input and a 28px ink submit in a 14px shell (Inline and Card) or stacks a 36px field above a full-width button (Stacked); the submit turns `--uai-border-strong` while pending. Errors mix 75% danger with primary ink; success mixes 75% success with primary ink.

Campaign scheduling, billing logic and currency formatting, testimonial sourcing, media assets, the truth of trust claims, and email delivery remain consumer-owned. Announcement dismissal persists only when given a `storageKey`. Newsletter validation checks the email shape and consent; `onSubscribe` decides success, duplicate, or error.

## AI and automation

All six AI components use the the warm graphite tokens in light and dark themes, 13px / 18px body type, visible native keyboard focus, and consumer-composed content. New visual values live in the distributed source as inline styles. Emphasis comes from tone, weight 500, and accent for the one primary action. Motion runs through the Web Animations API and is skipped under `prefers-reduced-motion`: the citation pop-in, the streaming caret, the response dots, and the tool spinner.

| Component | Visual variants | Interaction contract |
| --- | --- | --- |
| Message | bubble / plain / compact | User, assistant, system, and tool messages with avatar, header, content, actions, and streaming state. |
| Citation | number / chip / underline | An inline marker that previews its source on hover, focus, or press and links to the destination. |
| Attachment | row / card / chip | File type or thumbnail, upload progress, failure with retry, and removal. |
| Tool Call | card / inline / compact | Queued, running, successful, and failed tool activity with an input and output disclosure. |
| Response Status | inline / pill / bar | Queued, streaming, stopped, complete, and failed responses with stop and retry. |
| Run Summary | card / plain / compact | Completed work with stats, changed artifacts, warnings, next steps, and actions. |

Message Bubble places user messages in a raised 14px bubble aligned to the end; Plain keeps every role left-aligned without bubbles; Compact uses 24px avatars, 12px bubbles, and 24px actions. Assistant avatars are ink circles; other roles use the raised surface. Tool messages use a bordered mono card, and system messages use muted ink. Streaming shows a 7×14px ink caret that blinks once per second. Citation markers are 18px raised pills with tabular numerals that fill with ink while open; Chip shows a source label, and Underline adds a dotted strong-border underline to the claim, tinted while open. The source preview follows the floating-menu rule: 14px corners, 4px padding, the strong-border outline, an offset shadow, and a 180ms pop-in from `scale(0.96)`; the destination link sits on a raised 10px row. Attachment Row is a bordered 14px row with a 36px tile; Card is a 176px tile with a 96px thumbnail and floating controls; Chip is a 12px pill with a 24px tile and 24px controls. Progress is a 4px ink bar, and failed attachments take a danger-tinted border with error text that mixes 75% danger with ink. Tool calls use a 14px card (12px compact) with a 28px raised status tile, a mono tool name, a muted summary, and raised mono payload blocks; Inline drops the card chrome and indents the payload under the name. Response Status Inline sits in text flow, Pill wraps it in a raised 999px pill, and Bar uses a bordered 14px row with actions at the end; Stop and Retry are 28px pills. Run summaries use a 14px card (12px compact) or no chrome in Plain, a 28px outcome tile, a hairline-divided stats grid with tabular figures, success, muted, and danger change markers, warning rows tinted 10% with warning color, and an ink primary action.

Message transport, streaming, and copy text; source retrieval and link targets; upload transport and file validation; tool execution and payload formatting; cancellation and regeneration; and run data remain consumer-owned. Wrap conversations in a `role="log"` container. Citation previews open below the marker without collision detection. Response Status restores focus to the replacement action, or to itself, when the focused Stop or Retry action disappears.

## Marketing sites

All eight marketing blocks are full page sections composed from Uai components. They use the warm graphite tokens in light and dark themes, 13px / 18px body type, visible native keyboard focus, and consumer-composed content. New visual values live in the distributed source as inline styles. Responsive layout ships as a small scoped `<style>` block of container queries, so a block stacks to one column whenever its own container is narrow, not only on small viewports.Only the FAQ chevron animates, and it stops under reduced motion.

| Block | Layout variants | Composes | Interaction contract |
| --- | --- | --- | --- |
| Hero Section | split / centered / framed | Trust Panel | Positioning copy, primary and secondary actions, proof, and product media. |
| Feature Showcase | alternating / stacked / cards | Description List | Benefits with copy, media, and supporting facts. |
| Pricing Section | cards / joined / compact | Pricing Toggle | Plans, a billing-period radio group, included and excluded limits, and purchase actions. |
| Testimonials Section | grid / featured / wall | Testimonial Card | Customer stories with people, roles, organizations, and a rating summary. |
| FAQ Section | list / cards / split | Search Field | Search over questions and answers with disclosure buttons and an empty state. |
| Call to Action | banner / centered / split | Trust Panel badges | One goal, supporting copy, two action priorities, and reassurance. |
| Waitlist Section | split / centered / card | Newsletter Form | Qualification fields, consent, duplicate handling, and a focused confirmation. |
| Contact Section | split / stacked / card | Status Banner | Contact options, availability, a message form with pending, success, and error states, and expectations. |

Section headings scale with the container: hero titles use `clamp(28px, 4.5cqi + 8px, 44px)` at weight 600 with -0.02em tracking, and section titles use `clamp(22px, 2.5cqi + 12px, 30px)`. Lead copy is 15px / 22px muted text. Primary actions are 36px ink pills with surface text; secondary actions are outlined surface pills in the hero and underlined text in the call to action. Media frames are raised 14px figures at 4:3 (16:9 when centered or stacked). Split, Framed, Alternating, and the two-column waitlist, FAQ, and contact layouts switch to columns at a 720px container width (640px for the call to action). Framed heroes, banner and split calls to action, waitlist cards, and contact cards use 14px cards; the framed hero and banner use the raised surface. Pricing Cards are 14px cards with the featured plan ringed in ink; Joined draws one 14px frame with 1px hairline dividers and lifts the featured plan onto the raised surface; Compact uses 12px cards, 22px prices, and 28px actions. The featured badge is a 20px ink pill. Excluded limits use a minus icon in the strong border color. Testimonial Wall flows compact cards through CSS columns; Featured gives one editorial story the wider column. FAQ items sit on hairline dividers or in 14px cards; the empty state is a dashed 14px panel. The waitlist confirmation tints the surface with 8% success and a 35% success hairline, and its title mixes 75% success with ink. Contact options are 12px tiles with 28px icon wells, and availability uses an 8px dot with a soft success halo beside text.

Copy, imagery, plans and prices, billing, testimonials, question content, signup storage, message delivery, and support hours remain consumer-owned. Blocks never fetch data. Pricing, waitlist, and contact state stays inside the block; applications receive the billing period, the signup, or the form data through callbacks.

## Application surfaces

All seven application blocks are product workflows composed from Uai components. They use the warm graphite tokens in light and dark themes, 13px / 18px body type, visible native keyboard focus, and consumer-composed content. New visual values live in the distributed source as inline styles. Each layout variant maps onto the variants of the components it composes, so a block changes as one unit. Layout reflows with `flex-wrap` and `auto-fit` grids instead of media queries: sidebars, asides, and filter columns wrap above the main column when space runs out.The blocks add no motion of their own; dialogs and menus keep the motion of the components they compose.

| Block | Layout variants | Composes | Interaction contract |
| --- | --- | --- | --- |
| Dashboard Shell | split / inset / compact | App Sidebar, Breadcrumb Trail, Metric Card | Global navigation, page hierarchy, actions, key figures, and panels. |
| Settings Page | stacked / split / compact | Form Field, Unsaved Changes Bar, Confirmation Dialog | Grouped settings, validation, a save state, and a guarded danger zone. |
| Profile Page | sidebar / stacked / compact | Author Card, Description List, Activity Timeline | Identity, account actions, contact details, and recent activity. |
| Team Management | table / cards / compact | Data Table Toolbar, Confirmation Dialog, Empty State | Member search, invitations, roles, access status, and confirmed removal. |
| Notification Center | panel / page / compact | Page Tabs, Empty State | Date groups, read state, filters, per-item toggles, and bulk actions. |
| Billing Portal | overview / stacked / compact | Status Banner, Progress Summary, Description List, Confirmation Dialog | Plan, usage, payment method, invoices, alerts, and cancellation. |
| Search Results | list / sidebar / compact | Search Field, Filter Bar, Empty State, Skeleton Group | Query, filters, sort, ranked results, empty and loading states, and pagination. |

Page titles are 20px / 26px semibold with -0.015em tracking (16px in Compact); section and panel titles are 13–14px semibold. Page sections and panels are 14px bordered surface cards with 16–20px padding; Compact uses 12px cards, 12px padding, and 24px controls. Block actions are 28px pills: primary actions use ink with surface text, secondary actions use the surface with a strong-border outline, and destructive actions mix 75% danger with ink. Dashboard Split places a panel sidebar beside a borderless main column; Inset sets an inset sidebar and a 14px main card on a 22px raised frame. Settings Stacked uses one card per group; Split places each group's heading in a column beside its fields over hairline dividers; danger groups use a 35% danger hairline and danger-tinted titles. Profile Sidebar keeps a 300px identity aside; Stacked places identity above the details grid. Team Table joins member rows into one 14px frame with 1px hairline gaps; Cards tiles members as 14px cards. Avatars are raised circles with a hairline inset and initials. Status pills are 20px strong-border hairlines. Unread notifications sit on the raised surface with an 8px ink dot and 550-weight titles; read items are transparent. Billing Overview tiles sections in an auto-fit grid and lets invoices span the row; prices are 28px tabular figures. Invoice tables scroll horizontally below 440px. Search results sit on hairline dividers; matched terms use a 12% ink tint at weight 550. The current page in pagination is an ink pill. Sidebar search places a 240px filter panel beside the results, and Compact hides result snippets.

Routing, data loading, persistence, permissions, saving, invitations, role changes, removal, notification delivery, payments, invoices, ranking, and remote search remain consumer-owned. Blocks never fetch data. The only state a block owns is local interaction: the read state of an uncontrolled notification item and the current page of an uncontrolled pagination.

## Data and operations

All seven operations blocks compose existing Uai components inside graphite chrome in light and dark themes, with 13px / 18px body type, tabular numerals for figures, and visible native keyboard focus. Block-owned regions (record lists, result and preview tables, the column mapping, the group-by and report option pills, and the bar chart) use inline styles. Each block maps its layout variant onto the variants of the components it composes, so one switch keeps the whole surface consistent. Checked option pills are accent-tinted. Motion comes only from composed components (the confirmation dialog pop-in and the column menu) and stops under reduced motion.

| Block | Layout variants | Interaction contract |
| --- | --- | --- |
| Resource Manager | split / stacked / compact | Record list with arrow-key focus, an inspector, an edit form, archive, and confirmed deletion. |
| Data Explorer | workbench / stacked / compact | Saved views as tabs, a SQL query form, a scrollable results table, export, and a row-count status. |
| Import Workflow | wizard / sidebar / compact | File selection, labelled column mapping, validation banner, preview table, and import progress. |
| Approval Queue | grouped / board / compact | Queue totals, filters, a group-by radio group, and approval cards in labelled groups. |
| Audit Log Viewer | sidebar / stacked / compact | Filters with date presets beside or above expandable events, export, and a result count. |
| Incident Dashboard | overview / split / compact | Severity, a status banner, metrics, an update form, a timeline, impact, and responders. |
| Report Builder | sidebar / stacked / compact | Metric, dimension, visualization, and export-format pills; filters; a bar, column, or number canvas. |

Block titles are 18px semibold (15px compact) with a muted description. Block actions are 28px pills (24px compact): primary uses ink on the surface, secondary uses the strong-border outline. Split, Workbench, and Sidebar layouts place the secondary column beside the main one with flex wrap and stack it below on narrow widths without media queries. Panels, lists, query forms, and canvases use 14px cards (12px compact); settings and query forms sit on the raised surface. The inspected record and checked option pills use ink and the strong border rather than color. Result and preview tables use a raised header row, hairline row rules, and right-aligned tabular figures; invalid preview cells tint 8% danger and carry danger text mixed 75% with ink. Approval Queue Board turns groups into raised 14px columns. Severity dots pair danger, warning, or strong border with the written level. Report bars are 12px (8px compact) ink fills on a raised track; columns are 140px tall (96px compact).

Record persistence, query execution, file parsing and transport, decision handling, audit retention, incident data and paging, report queries, and export generation remain consumer-owned. Blocks keep only presentation state: the inspected record, the current import step, and the group-by choice, each controlled or uncontrolled.

## Authentication and onboarding blocks

All three onboarding blocks are account workflows composed from Uai components. They use the warm graphite tokens in light and dark themes, 13px / 18px body type, visible native keyboard focus, and consumer-composed content. New visual values live in the distributed source as inline styles. Responsive layout ships as a small scoped `<style>` block of container queries, so a block stacks to one column whenever its own container is narrow.The blocks add no motion of their own.

| Block | Layout variants | Composes | Interaction contract |
| --- | --- | --- | --- |
| Code Verification | card / split / compact | Status Banner, Inline Feedback | Segmented one-time code with autofill, paste, and arrow and Backspace movement; invalid, expired, and verified states; a resend countdown; and alternate methods. |
| Onboarding Wizard | sidebar / stacked / compact | Step Indicator, Status Banner | Ordered steps with native and custom validation, optional steps, reachable earlier steps, a controllable current step for resuming, and a focused completion. |
| Workspace Setup | card / split / compact | Form Field, Status Banner, Description List (preview) | Name with a derived URL slug, an invitation list, initial settings as native choices, a live summary, and creation errors. |

Block titles are 20px / 26px semibold with -0.015em tracking (16px / 22px in Compact). Card and Split shells are 14px bordered surface cards; Compact uses a 12px card with 16px padding and 28px actions. Code boxes are 44×48px 12px-radius inputs with 20px semibold tabular figures (36×40px, 8px radius, 18px in Compact); empty boxes use the strong border, filled boxes an ink border, invalid boxes the danger border, and verifying boxes the raised surface. Code Split places the heading beside the form at a 640px container width and left-aligns the boxes. The resend action is an underlined text button that turns muted and shows `in m:ss` while the countdown runs. Alternate methods are 28px outlined pills above a hairline. Wizard Sidebar places a vertical Step Indicator in a 220px column at a 720px container width; Stacked uses the horizontal indicator; Compact uses its compact pills. Wizard footers sit on a hairline with Back pushed to the start; Skip is a muted text button. The wizard completion and the code and workspace confirmations tint the surface with success. Workspace Card and Compact separate sections with hairlines; Split draws each section as a 14px inset-hairline card and keeps a 280px sticky raised summary beside the form at a 760px container width. Invitations are 28px raised pills with a 28px remove control. Settings choices are 12px inset-hairline tiles with ink-accented native inputs.

Authentication, code delivery and checking, rate limits, persistence of wizard progress, workspace creation, URL availability, and invitation delivery remain consumer-owned. Blocks never fetch data. The only state a block owns is local interaction: entered code characters, the verification status and countdown, registered steps and the furthest reached step, and the workspace draft.

## Commerce blocks

All six commerce blocks are product workflows composed from Uai commerce, form, and feedback components. They use the warm graphite tokens in light and dark themes, 13px / 18px body type, visible keyboard focus, and consumer-composed content. New visual values live in the distributed source as inline styles, and responsive layout ships as a small scoped `<style>` block of container queries, so each block stacks to one column whenever its own container is narrow.
| Block | Layout variants | Composes | Interaction contract |
| --- | --- | --- | --- |
| Product Detail | split / stacked / compact | Product Gallery, Quantity Picker | Gallery, native radio option groups, availability status, compare-at price, a purchase form with a pending add-to-cart action, and delivery facts. |
| Product Listing | grid / sidebar / list | Filter Bar | Category links, filters, a live result count, a native sort select, product cards with a stretched name link, and pagination links. |
| Cart Drawer | side / sheet / compact | Cart Item, Quantity Picker, Coupon Field, Price Summary | A native modal drawer with focus management, cart lines, quantities, a discount code, totals, checkout, and continue shopping. |
| Checkout | split / single / compact | Step Indicator, Price Summary, Status Banner | Ordered steps with native validation, edit and continue focus handoff, a payment slot, place order with pending and error states, and a confirmation. |
| Order Tracking | split / stacked / compact | Order Status, Description List | A delivery estimate, fulfillment progress, shipment events with an earlier-events disclosure, delivery details, and support links. |
| Subscription Management | split / stacked / compact | Pricing Toggle, Description List, Confirmation Dialog | Current plan and status, usage meters, a change-plan radio form with billing periods, payment facts, and confirmed cancellation. |

Block titles are 600 weight with -0.015em tracking: product and listing titles use `clamp(20px, 2cqi + 12px, 26px)`, and checkout, tracking, and subscription titles use 22px (18px in compact layouts). Panels and step sections are 14px cards on the surface with a 1px hairline (12px cards and 12px padding in compact layouts); the current checkout step raises its hairline to the strong border. Split layouts switch to two columns at a 720px container width (760px for checkout, sidebar listing, and subscription), and the checkout summary and listing sidebar stick to the top. Primary actions are ink pills: 44px for add to cart, 40px for checkout and drawer actions, 36px for plan changes, and 32px or 28px in compact layouts. Secondary actions are outlined surface pills or underlined text. Option values are 32px pills with a 20px swatch; the checked value rings in ink on the raised surface, and sold-out values stay visible at 50% opacity with a strike-through. Category and page links use the graphite pill selection. Availability and subscription status use an 8px or 6px colored dot beside text. Usage meters are 6px bars in ink that turn warning at 80%. The payment slot is a dashed 14px panel on the raised surface with a lock note. The checkout confirmation tints the surface with 8% success and a 35% success hairline. The cart drawer slides 24px in from the right edge (from the bottom for the sheet, with 24px top corners) over 220ms `cubic-bezier(0.23, 1, 0.32, 1)`; the drawer, the event disclosure chevron, and the pending spinners stop under reduced motion.

Products, prices, inventory, cart storage, discount validation, taxes, shipping rates, payment processing, order and shipment data, plan catalogs, and billing remain consumer-owned. Blocks never fetch data and never render card inputs: the checkout payment region is a slot for a payment provider's hosted fields. Blocks own only local interaction state — open drawers, the current checkout step, the selected plan and billing period, disclosure state, and pending flags — and hand form data, quantities, codes, plans, and order placement to callbacks.

## Content and community blocks

All six content and community blocks are reading and discussion surfaces composed from Uai components. They use the warm graphite tokens in light and dark themes, 13px / 18px body type, visible native keyboard focus, and consumer-composed content. New visual values live in the distributed source as inline styles. Article Page, Documentation Page, and Public Profile ship a small scoped `<style>` block of container queries, so their columns stack whenever their own container is narrow; Changelog Page, Comment Thread, and Community Feed reflow with `flex-wrap` and `auto-fill` grids. Each layout variant maps onto the variants of the components it composes.The blocks add no motion of their own; the share menu and reaction picker keep the pop-in of the components they compose, and it stops under reduced motion.

| Block | Layout variants | Composes | Interaction contract |
| --- | --- | --- | --- |
| Article Page | centered / sidebar / compact | Author Card, Share Menu | Category, title, byline, reading time, a text size radio group, sharing, content, and related reading. |
| Documentation Page | columns / stacked / compact | App Sidebar, Breadcrumb Trail | Site navigation, an in-page table of contents with the current section, page actions, linkable sections, and a pager. |
| Changelog Page | timeline / cards / compact | Changelog Entry, Filter Bar, Empty State | Releases grouped by month, category and product area selects, a match count, reset, and an empty result. |
| Comment Thread | threaded / cards / compact | Comment, Reaction Bar | Sort order, a composer, nested replies, reactions, and visible, hidden, flagged, and removed states. |
| Community Feed | list / cards / compact | Author Card, Reaction Bar, Empty State | Filter pills, posts with authors, tags, reactions, and reply counts, an empty state, and numbered pagination. |
| Public Profile | sidebar / banner / compact | Author Card, Activity Timeline | Identity, links, follow toggle, follower counts, pinned work, and recent activity. |

Page titles are 28px / 34px semibold with -0.015em tracking (20px in Compact); the article title scales with `clamp(26px, 3cqi + 12px, 36px)` at -0.02em. Lead copy is 15px / 22px muted text. Article content reads at 14px / 22px, 16px / 26px, or 18px / 30px from the text size control, capped at 68ch; documentation prose is 14px / 22px with raised inline code and 12px code blocks. Headers sit on a dotted strong-border rule. Text size and sort controls are raised 999px tracks with a surface thumb ringed by the strong border; feed filters are 28px pills, ink when selected. Article Sidebar places a 240px related-reading card beside the content at 760px; Documentation Columns places a 220px inset sidebar, the content, and a 180px table of contents at 980px, and moves the contents above the article between 720px and 980px. The current table of contents link uses ink text and a 1px ink rule over a hairline track. Releases, posts, comments, profile sections, and pager links are 14px cards (12px in Compact); List and Threaded variants drop the card for dotted dividers or spacing. Public Profile Sidebar keeps a 280px sticky aside; Banner spans identity across the top on a raised 56px band. Counts are 16px tabular semibold values over 12px muted labels. Composer send buttons are 28px ink circles that fall back to the strong border while empty.

Content storage, rendering of rich text, moderation policy, routing, search indexing, follower data, and sharing destinations remain consumer-owned. Blocks never fetch data and never sort or filter arrays themselves; they own the text size, active section, filter, sort, and page selections, each controlled or uncontrolled, and hide filtered releases from their own props.

## AI and automation blocks

All four AI blocks compose the AI components (Message, Citation, Attachment, Tool Call, Response Status, Run Summary, Prompt Composer, Thinking, Approval Card, Task List, and Progress Summary) into complete agent surfaces. They use the warm graphite tokens in light and dark themes, 13px / 18px body type, visible keyboard focus, and consumer-composed content. New visual values live in the distributed source as inline styles. Responsive layout ships as a small scoped `<style>` block of container queries, so a block stacks to one column whenever its own container is narrow. Each layout variant maps onto the variants of the components it composes, so one switch changes the whole surface. Send stays ink; approve and other primary actions are accent pills. Live states shimmer and entering rows fade up.

| Block | Layout variants | Composes | Interaction contract |
| --- | --- | --- | --- |
| Conversation Thread | chat / document / compact | Message, Citation, Response Status, Prompt Composer | A scrollable message log that stays pinned to the newest turn, cited claims, a response status with Stop and Retry, a composer, and a source list. |
| Research Session | split / stacked / compact | Progress Summary, Task List, Thinking, Citation, Response Status | Overall progress, a research plan, a search activity log, a cited synthesis, and the sources read. |
| File Analysis | split / stacked / compact | Attachment, Progress Summary, Citation | Analysed files with per-file extraction progress and retry, overall extraction status, and findings that cite a page or cell. |
| Agent Run | split / stacked / compact | Thinking, Tool Call, Task List, Approval Card, Run Summary, Response Status | A run status, an activity log of thinking and tool calls, task progress, blocking approvals, and the final summary. |

Block titles are 18px / 24px semibold with -0.01em tracking (15px / 20px in Compact), with a muted description. Panels are 14px bordered surface cards with 16px padding (12px cards and 12px padding in Compact); Agent Run sections are unframed and use 12px muted 550-weight headings because their contents already carry card chrome. Conversation Chat uses bubble messages, number citations, a pill status, and the rounded composer; Document uses plain messages, underlined citations, and an inline status; Compact uses compact messages, an inline status, and the compact composer. The log caps at 520px (360px compact) and scrolls inside the block. Conversation sources sit in a 220–260px column beside the thread at a 760px container width; Research Split and Agent Run Split place a second column beside the main one at 760px; File Analysis Split places files beside findings at 720px. Source rows use an 18px raised index pill that matches the citation number. Research Split shows the plan as a timeline task list, Stacked as a card list with chip citations and a bar status, and Compact as a compact list. File Analysis Split lists files as rows, Stacked as 176px cards, and Compact as chips. Findings are 10px raised tiles (8px compact) with an 8px tone dot and a written label: Note uses the strong border, Review uses warning, and Risk uses danger with label text mixed 75% danger with ink. Agent Run Split and Stacked use card tool calls, detailed approvals, and a card summary; Compact uses compact tool calls, compact approvals, a compact summary, and a pill status.

Model calls, streaming transport, search, retrieval, file parsing and extraction, tool execution, approval handling, cancellation, regeneration, and run data remain consumer-owned. Blocks never fetch data. The only state a block owns is the log's pinned scroll position; message, status, task, approval, and summary state come from props.
