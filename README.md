# Pixel Path Replay Studio

MASTER PROMPT — PIXEL-ACCURATE APPLICATION RECONSTRUCTION

PROJECT MISSION

You are acting as a Principal Frontend Engineer, Senior UI/UX Reconstruction Specialist, Full-Stack Software Architect, and Mobile Application Engineer.

Your mission is to recreate an existing application using the screenshots and visual references attached to this project.

The attached screenshots are the ONLY source of truth for the application's visual appearance, screen structure, content, navigation sequence, and user experience.

You must reproduce the application as accurately as technically possible.

This is a visual and functional reconstruction task.

This is NOT a redesign.
This is NOT a creative interpretation.
This is NOT a modernization.
This is NOT an opportunity to introduce your own design decisions.

The objective is to reproduce what is shown in the provided references.

1. REFERENCE IMAGE AUTHORITY

All attached screenshots must be inspected before implementation.

The references follow a sequential naming convention:

img001
img002
img003
img004
img005
...
imgNNN

The numerical order is mandatory.

You must interpret the screenshots in ascending numerical order, without skipping, rearranging, or grouping them arbitrarily.

The sequence represents the intended progression of the application's screens and user experience.

IMPORTANT:

img001 is the first reference.

img002 is the second reference.

img003 is the third reference.

Continue in numerical order until the final available image.

Never assume that two screenshots represent the same screen unless the visual evidence supports that conclusion.

Treat every screenshot as an independent reference that must be examined.

Pay attention to transitions between screens.

Identify repeated interface elements.

Identify differences between screen states.

Identify navigation and interaction patterns.

Preserve the original sequence of the user journey.

Do not invent missing screenshots or assume what an unavailable screen should look like.

If an image is missing, unreadable, duplicated, or ambiguous, document the issue instead of inventing its contents.

2. SCREEN-BY-SCREEN VISUAL RECONSTRUCTION

For EVERY screenshot, carefully reproduce:

Overall layout.

Screen dimensions and proportions.

Content positioning.

Horizontal and vertical spacing.

Margins and padding.

Typography.

Font sizes.

Font weights.

Line heights.

Letter spacing.

Text alignment.

Background colors.

Surface colors.

Gradients.

Borders.

Border radii.

Shadows.

Buttons.

Input fields.

Icons.

Images.

Illustrations.

Navigation elements.

Dividers.

Cards.

Overlays.

Modals.

Bottom navigation.

Status indicators.

Progress indicators.

Animations, when visually evident.

Do not simplify the interface.

Do not substitute complex visual elements with generic components.

Do not use placeholder icons when the original assets are available.

Do not approximate the logo.

Do not introduce additional visual decorations.

Every element must have a corresponding justification in the provided references.

The result must prioritize screenshot-level visual fidelity over personal design preferences.

3. LOGO AND BRAND ASSET PRESERVATION

The original logo has been provided among the project attachments.

Use the exact original logo asset.

Mandatory requirements:

Do not redraw the logo.

Do not regenerate it using AI.

Do not replace it with text.

Do not change its proportions.

Do not alter its colors.

Do not apply unauthorized effects.

Do not distort its aspect ratio.

Do not use a similar-looking alternative.

Preserve the original asset and reproduce its position, size, and appearance according to the screenshots.

The same preservation principle applies to all provided brand assets.

4. STRICT MOBILE-FIRST DEVELOPMENT

The application is designed primarily for mobile devices.

Mobile is the primary development target.

Prioritize the exact dimensions, proportions, and behavior shown in the screenshots.

Requirements:

Correct mobile viewport handling.

Accurate responsive scaling.

Correct safe-area handling.

Appropriate touch targets.

Mobile-compatible navigation.

No accidental horizontal overflow.

No desktop layout assumptions.

No unnecessary desktop elements.

Preserve the original mobile experience.

Do not redesign the application for desktop.

Desktop compatibility must not compromise mobile fidelity.

Test the application using a mobile viewport throughout development.

5. FUNCTIONAL RECONSTRUCTION

Do not build a collection of static screenshots.

Reconstruct the actual interface and its interactions.

Identify and implement the behaviors that can be inferred directly from the references:

Navigation between screens.

Button interactions.

Form inputs.

Selection states.

Toggles.

Progression between steps.

Back navigation.

Modal behavior.

Loading states, if shown.

Success and error states, if shown.

User input persistence during the relevant flow.

When a screenshot shows an element that appears interactive, inspect the surrounding sequence to understand its intended behavior.

Do not invent complex business rules that cannot be established from the references.

If a behavior is unclear, document the uncertainty.

The application must remain functional rather than merely visually convincing.

6. EXACT CONTENT PRESERVATION

Reproduce all visible content as shown.

This includes:

Titles.

Subtitles.

Paragraphs.

Labels.

Button text.

Placeholder text.

Navigation labels.

Informational messages.

Numeric values.

Progress indicators.

Legal text.

Any visible microcopy.

Preserve the original language.

Do not translate the content.

Do not rewrite copy for marketing purposes.

Do not invent new promotional messages.

Do not replace original text with generic filler.

If text is unreadable, report it rather than fabricating it.

7. COMPONENT ARCHITECTURE

Build the application using reusable components where appropriate, but never allow architectural decisions to compromise visual fidelity.

Recommended engineering principles:

Consistent reusable components.

Clear separation of UI and business logic.

Maintainable folder organization.

Centralized design tokens where appropriate.

Reusable form elements.

Consistent navigation architecture.

Type-safe implementation where supported.

However, these architectural principles must never justify changing the appearance or behavior established by the screenshots.

Do not create unnecessary abstraction.

Do not introduce excessive dependencies.

Do not use a new UI library simply because it is convenient.

Use the existing project configuration and technology whenever an existing project is available.

8. TRIBOPAY PAYMENT INTEGRATION — PREPARATION ONLY

The application will eventually integrate with TriboPay for payment processing.

At this stage, your responsibility is to prepare a clean integration architecture without activating real payment processing.

Do not invent TriboPay endpoints, API methods, authentication headers, webhook formats, or request payloads.

Do not assume undocumented API behavior.

Do not make real payment requests.

Do not collect or store payment credentials.

Do not create fake successful payment confirmations.

Prepare the project for a future secure integration using the following architecture:

A. Payment service layer

Create a dedicated and isolated payment service layer.

Suggested logical organization:

payments/

payment-provider/

tribopay/

payment-types/

payment-status/

These are organizational suggestions, not mandatory directory names. Respect the existing project architecture.

B. Provider abstraction

Prepare a provider interface that can later support:

Payment creation.

Payment status retrieval.

Payment cancellation, if supported.

Payment notifications.

Webhook processing.

Only implement actual provider methods after the official TriboPay documentation has been supplied and verified.

C. Backend-first security

All future operations involving private API credentials must occur server-side.

Never expose secret API keys in frontend code.

Never place private credentials in VITE_ variables or other client-exposed environment variables.

Prepare environment variable placeholders without real credentials.

For example:

TRIBOPAY_API_BASE_URL=
TRIBOPAY_API_KEY=
TRIBOPAY_WEBHOOK_SECRET=

These are placeholders only. Their exact names and requirements must be reconciled with official documentation.

D. Payment states

Prepare a typed internal payment-state model.

Possible internal states:

pending

processing

paid

failed

cancelled

expired

Do not assume these are official TriboPay status values. Implement a verified mapping only after documentation is available.

E. Webhooks

Prepare a secure server-side webhook architecture.

Future requirements:

Signature verification according to official documentation.

Idempotent event processing.

Duplicate notification protection.

Payment status reconciliation.

Server-side validation.

Secure event logging.

Protection against unauthorized payment confirmation.

Never trust a frontend success screen as proof of payment.

F. Checkout interface

Reproduce the checkout interface only according to the supplied screenshots.

Do not add payment methods that are not shown in the references.

Do not change the original checkout design.

If a payment action cannot yet connect to a real provider, clearly isolate it as an integration placeholder.

9. DATABASE AND BACKEND PREPARATION

Do not create an entirely new backend simply to make the interface appear functional.

First identify the actual requirements of the application.

Separate:

Frontend presentation.

Application state.

Business logic.

Backend services.

Database access.

Payment infrastructure.

If a database is required but not yet configured, document the proposed data model without inventing production data or claiming that persistence is active.

Do not expose secrets.

Do not implement real payment processing before the official TriboPay integration specifications are available.

10. PROHIBITED ACTIONS

The following actions are strictly prohibited unless explicitly authorized:

Redesigning any screen.

Changing the logo.

Changing brand colors.

Replacing typography.

Adding new sections.

Removing visible elements.

Inventing additional screens.

Changing the sequence of screens.

Adding unnecessary animations.

Adding generic dashboard components.

Adding unnecessary navigation.

Rewriting visible copy.

Changing the checkout experience.

Inventing payment methods.

Activating real payment processing.

Creating fake backend responses that appear to be real.

Replacing the intended visual identity with a template.

When in doubt, follow the screenshot.

When a screenshot conflicts with your design preferences, the screenshot always wins.

11. QUALITY ASSURANCE AND SCREENSHOT COMPARISON

After implementing the application, compare every recreated screen against its corresponding reference.

Perform a sequential validation:

img001 → recreated screen 001
img002 → recreated screen 002
img003 → recreated screen 003
...
imgNNN → recreated screen NNN

Evaluate:

Layout accuracy.

Element positioning.

Typography.

Colors.

Dimensions.

Spacing.

Logo fidelity.

Asset fidelity.

Content accuracy.

Interaction consistency.

Identify and correct discrepancies that can be verified directly against the screenshots.

Do not declare the reconstruction 100% faithful without performing the comparison.

If any discrepancy remains, list it transparently.

12. EXECUTION STRATEGY

Follow this exact sequence:

PHASE 1 — REFERENCE AUDIT
Inspect all attached screenshots and assets.
Identify the complete sequence.
Document the screens and their relationships.

PHASE 2 — STRUCTURE PLANNING
Determine the necessary application architecture.
Identify reusable components.
Identify navigation and interaction requirements.
Prepare the TriboPay integration boundary.

PHASE 3 — IMPLEMENTATION
Reconstruct the screens in numerical order.
Use the original logo and assets.
Implement only evidenced interactions.
Maintain mobile-first fidelity.

PHASE 4 — PAYMENT PREPARATION
Prepare isolated payment service architecture.
Do not activate real payments.
Wait for official TriboPay documentation.

PHASE 5 — VALIDATION
Compare every screen with the original references.
Test navigation and forms.
Test mobile responsiveness.
Identify missing assets and incomplete behaviors.

PHASE 6 — FINAL REPORT
Provide:

Screens implemented.

Screens still missing.

Interactions implemented.

Assets reused.

Remaining visual discrepancies.

Backend requirements.

TriboPay integration readiness.

Environment variables required.

Any unresolved assumptions.

FINAL DIRECTIVE

You are reproducing an existing application from visual evidence.

You are not authorized to invent a different product.

The attached screenshots, in their numerical order, define the target application.

The original logo and provided assets must be preserved.

The mobile experience is the primary reference.

TriboPay must be architecturally prepared but not activated.

Accuracy, completeness, consistency, and technical integrity take priority over implementation speed.

Begin by inspecting ALL attachments and mapping the complete img001-to-imgNNN sequence.

Do not start implementation until you have identified the complete reference sequence and confirmed that the available assets have been inspected.

The reference audit is complete. You are now authorized to begin implementation.

Follow the exact img001-to-imgNNN sequence previously established.

Recreate every screen in order, preserving all visual details, original assets, logo, content, spacing, typography, and interactions.

Do not introduce elements that are not supported by the references.

Implement the complete mobile experience, then validate each screen against its corresponding reference.

TriboPay remains in preparation mode only. No real payment processing or undocumented API integration is authorized.

Work systematically, test the application, and report any incomplete elements or deviations. Do not claim completion until all available references have been addressed.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pixel-path-replay-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7963d5c3-bffb-47e1-9b1c-37aac4c3557a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
