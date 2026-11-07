<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Product-page recommendations use a browser-safe catalog selector and a shared grid after reviews; exclude the current item and combine catalog sales ranking with Christmas categories to avoid extra requests.
- Storefront is a mobile-first checkout flow: `/` store → `/produto/$id` → `/checkout` (data + address sheets) → `/resumo` → `/pagamento`. Why: mirrors the reference screen sequence.
- Catalog and store identity live in `src/lib/catalog.ts`; unknown business details stay `null` and render as pending. Why: never invent legal/company data.
- Checkout state is client-side in `src/lib/checkout.tsx` (sessionStorage). Why: no backend/orders persistence yet.
- Payments go through `src/lib/payments/` (provider interface + server-only TriboPay adapter). The adapter stays unimplemented until official TriboPay docs are supplied; never fabricate PIX codes or paid states. Why: real payments must be server-verified.
- Never reuse third-party marketplace brands (logos, names, legal info) in the UI. Why: the store must not present itself as another company's property.
