---
name: Uai
description: A precise registry browser for source-owned AI interface patterns.
colors:
  accent-light: "oklch(0.56 0.19 257)"
  accent-dark: "oklch(0.64 0.19 257)"
  canvas-light: "oklch(0.975 0.002 255)"
  surface-light: "oklch(1 0 0)"
  surface-raised-light: "oklch(0.955 0.003 255)"
  border-light: "oklch(0.88 0.006 255)"
  border-strong-light: "oklch(0.76 0.01 255)"
  text-light: "oklch(0.19 0.008 255)"
  muted-light: "oklch(0.48 0.012 255)"
  canvas-dark: "oklch(0.12 0.006 255)"
  surface-dark: "oklch(0.175 0.007 255)"
  surface-raised-dark: "oklch(0.22 0.008 255)"
  border-dark: "oklch(0.29 0.01 255)"
  border-strong-dark: "oklch(0.4 0.012 255)"
  text-dark: "oklch(0.965 0.003 255)"
  muted-dark: "oklch(0.68 0.012 255)"
  success: "oklch(0.72 0.18 145)"
  warning: "oklch(0.77 0.15 83)"
  danger: "oklch(0.7 0.19 27)"
typography:
  title:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 590
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  navigation:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 520
    lineHeight: 1.4
  detail:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.74rem"
    fontWeight: 400
    lineHeight: 1.5
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
  catalog-item-active:
    backgroundColor: "{colors.surface-raised-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.pill}"
    height: "34px"
  preview-stage:
    backgroundColor: "{colors.surface-dark}"
    rounded: "16px"
    minHeight: "480px"
  segmented-pill:
    backgroundColor: "{colors.surface-dark}"
    rounded: "{rounded.pill}"
    height: "28px"
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
  install-command:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.muted-dark}"
    rounded: "{rounded.md}"
    height: "36px"
  install-details-toggle:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.interactive}"
    height: "36px"
  highlighted-code:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
---

# Design System: Uai

## Overview

**Creative North Star: "The Registry Workbench"**

Uai has two visual layers. The registry workbench is a precise developer tool: a dense catalog rail, graphite surfaces, and dotted hairlines. Distributed components are product chrome. They follow the compact Beautiful UI language: 14px surfaces, 28px ghost controls, ink send, and raised menus.

Graphite surfaces and dotted hairline dividers create workbench structure without decorative containers. Catalog selection uses a quiet graphite pill. Cobalt marks keyboard focus only on the workbench. It does not paint send controls on installed components.

**Key Characteristics:**

- Dense catalog navigation with a stable 312px desktop rail.
- One Components destination with no global documentation search or parallel docs shell.
- Flat graphite workbench surfaces separated by dotted hairlines.
- Numbered titles, 16px preview stages, and floating inverted variant pills.
- Compact type with mono reserved for commands, shortcuts, and code.
- Cobalt reserved for focus. Ink send on Prompt Composer.
- User-controlled Thinking disclosure with chronological, observable activity evidence.
- Semantic, evidence-led approval states with typed confirmation for critical actions.
- Seven real registry items, highlighted TSX, install commands, and accessibility notes in one workbench.

## Colors

The palette uses cool neutrals for structure and one cobalt signal for interaction.

### Primary

- **Cobalt Signal** (`oklch(0.64 0.19 257)` in dark mode): Marks keyboard focus on the workbench. Do not use it for catalog selection or tabs.

### Neutral

- **Graphite Canvas** (`oklch(0.12 0.006 255)`): Forms the dark application background.
- **Graphite Surface** (`oklch(0.175 0.007 255)`): Holds inputs, preview stages, commands, and raised controls.
- **Raised Graphite** (`oklch(0.22 0.008 255)`): Creates tonal hover and selected catalog pills.
- **Hairline Border** (`oklch(0.29 0.01 255)`): Separates navigation, states, and content regions as dotted rules.
- **Primary Ink** (`oklch(0.965 0.003 255)`): Carries headings and high-priority labels.
- **Muted Ink** (`oklch(0.68 0.012 255)`): Carries descriptions, metadata, and inactive navigation. Keep AA contrast; do not dim further.

### Status

- **Success** (`oklch(0.72 0.18 145)`): Confirms accessible or complete states.
- **Warning** (`oklch(0.77 0.15 83)`): Marks states that need attention.
- **Danger** (`oklch(0.7 0.19 27)`): Marks validation and component errors.

**The Sparse Signal Rule.** Use cobalt only for keyboard focus on the workbench. Do not use it as a decorative fill, catalog selection, or tab underline.

**The Ink Send Rule.** Prompt Composer send uses Primary Ink on Graphite Surface when the field can submit. Idle send uses Border Strong. Do not paint send cobalt.

## Typography

**Display Font:** Geist Variable with a system sans-serif fallback  
**Body Font:** Geist Variable with a system sans-serif fallback  
**Label/Mono Font:** Geist Mono Variable with a system monospace fallback

**Character:** The compact sans-serif hierarchy reads as product infrastructure. Mono identifies commands and machine-facing values without overtaking the interface.

### Hierarchy

- **Title** (590, `1.25rem`, 1.2, `-0.025em`): Names the selected component as `01 Prompt Composer` using the catalog index. Mobile may tighten to `1.2rem`.
- **Body** (400, `0.8125rem`, `18px`): Describes components and interactive fields.
- **Navigation** (400-520, `0.8125rem`, 1.4): Supports the Components destination, segmented pills, and dense catalog scanning.
- **Label** (520-560, `0.66rem`-`0.72rem`, up to `0.055em` tracking): Names categories, dock controls, and stage captions.
- **Detail** (400, `0.74rem`, 1.5): Carries Usage and Accessibility explanations and lists.
- **Mono** (400, `0.72rem`, 1): Shows install commands and shortcuts.
- **Code** (400, `0.74rem`, 1.7): Shows Shiki-highlighted TSX in Code and Usage.

**The Utility Type Rule.** Reserve mono for commands, code, shortcuts, and the Uai wordmark.

## Layout

The product exposes one Components destination. The root navigation contains only that destination and omits global documentation search; component search remains local to the catalog rail.

The desktop shell uses a fixed 312px catalog rail and a flexible workbench. The global header spans both regions. The workbench scrolls independently when its content exceeds the viewport. A fixed install dock begins at `left: 312px`, while the workbench reserves 60px of bottom clearance so content is never covered.

Preview and Code share a compact segmented pill beside the numbered title. Content starts with 28px-32px horizontal padding on desktop. Each registry item renders inside one 16px-radius preview stage on Graphite Surface. Prompt Composer stays within a 420px frame inside that stage so menus read at product scale. Compact uses a 280px frame. Ghost sits on a dock strip inside the stage. Variant switchers float at the bottom center of the stage as inverted pills.

At widths less than 900px, the catalog rail becomes a native component selector and the fixed dock moves to `left: 0`. The workbench reserves 112px of bottom clearance for the dock's stacked mobile footprint. At widths less than 640px, details form one column and horizontal padding becomes 16px. Commands and code scroll inside their own regions; the page never creates horizontal overflow.

Spacing follows a compact 4px foundation. Common gaps use 8px, 12px, 16px, 24px, and 32px.

## Elevation & Depth

Uai is flat by default. Tonal surface changes and one-pixel borders create depth. Prompt Composer cards stay flat and border-defined. Two lifted exceptions exist: the fixed install dock, and floating composer menus.

### Shadow Vocabulary

- **Floating menu** (`0 0 0 1px var(--uai-border-strong), 0 10px 28px color-mix(in oklab, black 42%, transparent)`): A 1px outline that follows the 14px radius, plus an offset drop shadow. The outline is the rounded border. Do not ship a square menu.
- **Fixed dock depth** (`0 -18px 44px color-mix(in oklab, black 22%, transparent)`): Separates persistent chrome from scrolling workbench content.

**The Divider-Led Rule.** Prefer dotted hairlines (≈2px mark / 4px gap using `--uai-border`) on the rail edge, header, and dock top before solid borders or elevation. Reserve wide shadows for the dock and for floating menus.

**The Floating Menu Rule.** Menus open from the control that spawned them. They use 14px corners, 4px padding, a visible outline, and a pop-in from `scale(0.96)` in 180ms `cubic-bezier(0.23, 1, 0.32, 1)`. Remove the animation when reduced motion is requested.

## Shapes

Controls use small radii to keep the tool precise. Compact workbench controls use 5px-8px corners. Interactive dock and source-copy controls use the intentional 7px radius. Highlighted Usage code uses 8px.

Distributed prompt chrome is larger and softer: the composer card and floating menus use 14px corners. Composer controls use 8px corners in the rounded and ghost variants and the pill radius in the pill variant. Compact uses a 12px card and 6px / 24px controls. Menu rows use 8px corners. File chips use 6px, or the pill radius in the pill variant.

Borders are one pixel. Workbench focused fields may add a cobalt inset line. Prompt Composer focus uses a stronger hairline (`--uai-border-strong`) on the card, not a cobalt ring.

## Components

### Catalog rail

- **Width:** 312px on desktop.
- **Inventory:** Show the seven verified registry items; do not create placeholder rows to increase density.
- **Rows:** Category rows are 32px; component rows are 34px. Both use full pill corners.
- **Active state:** Raised Graphite pill fill with Primary Ink text and muted icons. No cobalt border, no status dot.
- **Hover:** Quieter Graphite Surface fill, gated to fine-pointer hover media.
- **Mobile:** Replace the rail with a full-width native select.

### Root navigation

- **Brand:** Pair the mono `uai` wordmark with the three-part modular `u` mark. The
  mark inherits Primary Ink in the header and keeps the same silhouette in the favicon.
- **Destination:** Show one Components link.
- **Search:** Do not render global documentation search. The rail's component search remains available on desktop.
- **Chrome:** Use a dotted bottom rule on the Fumadocs header. Press scale is `0.97` on links and theme controls.

### Segmented pills

- **Shape:** Full pill track with a 3px inset, hairline border, and sliding active thumb.
- **Active state:** Inverted fill — near-white on dark, Primary Ink on light — with contrasting label color.
- **Motion:** Thumb moves with `transform` and `width` in 180ms `cubic-bezier(0.23, 1, 0.32, 1)`. Press scale is `0.97`.
- **Uses:** Preview/Code in the workbench header; Prompt Composer and Thinking variant switchers inside the preview stage.

### Preview stage

- **Shape:** One 16px-radius specimen well per registry item on Graphite Surface over Graphite Canvas. Min-height ≈480px.
- **Content:** Center the component. Optional 12px captions sit in the corners. Do not stack multiple comparison grids as the default.
- **Variants:** When a component has real variants, float a segmented pill at the bottom center of the stage. Crossfade the canvas with opacity (and optional 2px blur) for 160ms.

### Prompt Composer

Compact product chrome for writing, attaching, choosing a model, and sending. This is the visual authority for installed AI input, not the workbench prompt mock. Plus, model, and send stay the same across variants.

- **Rounded:** 14px card. Graphite Surface. 6px padding. Hairline border with no card shadow. 28px controls with 8px corners.
- **Pill:** Full pill on one line, 24px when the field expands or attachments appear. Same 28px controls with pill corners.
- **Ghost:** No fill, no shadow, transparent hairline at rest. For docks and custom shells. Focus and invalid restore a 14px hairline. 28px controls with 8px corners.
- **Compact:** 12px card, 4px padding, 24px controls with 6px corners. Field type is 12.5px / 16px. Model label is 11px. Use in sidebars.
- **Row:** One line of controls: ghost plus, textarea, 12px model label (11px in compact), ink send. When the prompt wraps, the textarea takes the full width and the controls move to a second row.
- **Plus:** Ghost control. No border. Hover uses Raised Graphite. Open state rotates the icon 45 degrees and keeps the raised fill.
- **Send:** Enabled and busy use Primary Ink fill with Graphite Surface glyph. Idle uses Border Strong fill with muted glyph. Press scale is `0.94`. Never cobalt.
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
  total elapsed time, and disclosure chevron. Cobalt appears only on keyboard focus.
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
- **Actions:** Reject is a bordered secondary action. Approve uses Primary Ink on
  Graphite Surface. Both are 32px controls with 8px corners and explicit labels. Do
  not use cobalt as an action fill.
- **Error:** Preserve the action context and composed evidence, announce the failure,
  name the recovery, and keep the decision actions available for retry.
- **Preview variants:** Demonstrate Compact, Detailed, Critical, and Error scenarios.
  Decisions visibly progress through Submitting to their terminal result. Detailed
  preview stages grow with their content so evidence, actions, and the variant control
  are never clipped on mobile.

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
- **Actions:** Apply and Replace use Primary Ink on Graphite Surface with 10px corners.
  Remove is a quiet text action beside feedback. Coupon actions never use cobalt.
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

### Install command

- **Shape:** 8px radius with a one-pixel border.
- **Content:** Keep the command on one line and allow internal horizontal scrolling.
- **Action:** Keep the copy button attached to the command field.

### Install dock

- **Position:** Fix to the viewport bottom, offset 312px from the left on desktop and 0 on mobile.
- **Resting height:** Keep a 60px desktop strip with the details toggle and install command. On mobile, stack both controls inside the dock and reserve 112px in the workbench.
- **Toggle:** Use a 7px interactive radius and explicit Show details / Hide details copy.
- **Depth:** Use the fixed dock shadow from Elevation & Depth; do not apply this shadow to ordinary surfaces.

### Details drawer

- **Disclosure:** Reveal Usage and Accessibility before the install strip. Keep the drawer `aria-hidden` and inert while closed.
- **Motion:** Transition max-height for 220ms and opacity for 160ms with ease-out timing. Remove both transitions when reduced motion is requested.
- **Desktop:** Split Usage and Accessibility into equal columns and cap the open drawer to the viewport-safe region.
- **Mobile:** Stack the panels, constrain code inside its own scroll area, and keep the drawer within the viewport.

### Highlighted code

- **Renderer:** Use Fumadocs UI `DynamicCodeBlock` with Shiki TSX highlighting for both Code and Usage.
- **Type:** Use the code role (`0.74rem`, 1.7) and preserve token-level syntax color.
- **Overflow:** Contain scrolling inside the code region. Never allow highlighted code to widen the page.

## Do's and Don'ts

### Do:

- **Do** preserve the 312px catalog and flexible workbench split on desktop.
- **Do** keep the product focused on its single Components destination and verified seven-item catalog.
- **Do** use dotted hairlines to create hierarchy.
- **Do** present each component in one rounded preview stage with floating variant pills when needed.
- **Do** keep Usage and Accessibility attached to the install dock as an accessible disclosure.
- **Do** use highlighted TSX for both source views and Usage examples.
- **Do** keep cobalt rare and limited to focus.
- **Do** use ink send, 14px composer corners, and 28px ghost controls on Prompt Composer. Use ghost for docks and compact for sidebars.
- **Do** give plus and model menus a visible rounded outline and a compact width.
- **Do** keep Thinking disclosure user-controlled and preserve its chronological activity history across status changes.
- **Do** keep Approval Card risk, content density, and async status as independent dimensions.
- **Do** require typed confirmation before a critical action can be approved.
- **Do** keep Coupon Field async state consumer-controlled and safe inside checkout forms.
- **Do** keep Price Summary calculation-free: consumers supply formatted labels and values.
- **Do** keep Order Status presentation-only: consumers supply fulfillment stages, facts, and links.
- **Do** expose meaningful variants from the component root and demonstrate each one.

### Don't:

- **Don't** replace the workbench with a marketing hero or card grid.
- **Don't** add gradients, decorative illustrations, or large ambient shadows.
- **Don't** use fictional registry inventory to create density.
- **Don't** reintroduce documentation routes, a global docs search, or a second content shell.
- **Don't** let command or code content create page-level horizontal overflow.
- **Don't** make closed disclosure content focusable or available to pointer interaction.
- **Don't** use mono for general prose.
- **Don't** paint Prompt Composer send cobalt.
- **Don't** give the ghost variant a card fill or drop shadow.
- **Don't** ship a square floating menu or a full-bleed slab over the preview.
- **Don't** present private chain-of-thought as Thinking activity; show only user-safe summaries and observable evidence.
- **Don't** hide approval risk in color alone or let a critical action bypass confirmation.
- **Don't** nest a form inside Coupon Field or hide coupon errors in color alone.
- **Don't** make Price Summary calculate taxes, discounts, currency, or cart state.
- **Don't** make Order Status infer carrier events, poll logistics services, or hide stage meaning in color.
- **Don't** treat async states or preview scenarios as substitutes for visual variants.
