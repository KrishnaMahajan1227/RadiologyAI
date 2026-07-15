# RadAI Copilot — Freemium / Subscription Update

Ye ZIP sirf woh files hai jo naya freemium system add karne ke liye badli ya
banayi gayi hain. Baaki poora project waise ka waisa hai — bas in files ko
apne existing project ke same paths par overwrite/copy kar dena.

## Kya add hua hai

1. **10 free reports per user** — har naye ya existing user ko 10 free AI
   report generations milte hain (existing `profiles.reports_generated`
   counter hi reuse kiya hai, koi naya counter nahi banaya).
2. **10 ke baad lock** — AI se report generate karna (Generate / Regenerate /
   Disease-format), naya macro banana, macro use karna (`/trigger`), aur naya
   template banana — sab lock ho jaate hain jab tak user upgrade na kare.
   Pehle se save kiye hue reports, cases, macros, templates, settings — sab
   kaam karte rehte hain, kuch bhi delete/hide nahi hota.
3. **Notification shuru se hi** — Dashboard ke top par, Sidebar me, aur
   Settings → "Billing & Plan" me hamesha dikhta hai ki free plan me kitne
   reports bache hain, aur paid plan me kya milega.
4. **Demo account = unlimited** — `mahajankrishna2212@gmail.com` par koi
   restriction nahi lagta, chahe wo kitne bhi reports generate kare.
5. **Pricing** — Monthly ₹780/user, Yearly ₹7,800/user (~2 months free),
   Enterprise = "Contact Sales". Landing page par naya "Pricing" section aur
   nav link add kiya gaya hai.
6. **Payment abhi manual hai** — "Upgrade Now" click karne par UPI ID
   (`mahajankrishna2212@oksbi`) aur email/WhatsApp contact dikhta hai taaki
   abhi ke liye manually payment le sako aur plan activate kar sako. Automatic
   payment gateway (Razorpay/Stripe etc.) baad me integrate karna hoga — jab
   karoge tab bas `src/lib/subscription.ts` aur `profiles.plan` /
   `profiles.plan_expires_at` ko update karne wala backend/webhook jodna hoga.

## Files in this ZIP

- `src/lib/subscription.ts` — **NEW**. Saari limit/pricing logic yahin
  centralised hai (`FREE_REPORT_LIMIT`, `DEMO_ACCOUNT_EMAIL`, `PRICING`,
  helper functions).
- `src/components/subscription/UpgradeModal.tsx` — **NEW**. Pricing modal
  (Free / Pro / Enterprise cards + manual UPI payment info).
- `src/components/subscription/UsageBanner.tsx` — **NEW**. Dashboard ke top
  wala usage banner.
- `src/types/index.ts` — Profile type me `plan`, `plan_expires_at`,
  `is_unlimited` fields add kiye.
- `src/components/dashboard/Dashboard.tsx` — UsageBanner mount kiya.
- `src/components/layout/Sidebar.tsx` — Sidebar me compact usage/upgrade
  widget add kiya.
- `src/components/reports/ReportWorkspace.tsx` — Report generate/regenerate/
  disease-format/macro-use ko 10-report limit se gate kiya.
- `src/components/macros/MacrosPage.tsx` — Naya macro banane ko gate kiya.
- `src/components/templates/TemplatesPage.tsx` — Naya template banane ko
  gate kiya.
- `src/components/settings/SettingsPage.tsx` — "Billing & Plan" section add
  kiya.
- `src/components/landing/LandingPage.tsx` — Pricing section, nav link, FAQ
  entry add kiya.
- `supabase/migrations/20260715120000_add_subscription_plan_fields.sql` —
  **NEW migration**. `profiles` table me `plan`, `plan_expires_at`,
  `is_unlimited` columns add karta hai, aur demo account ko unlimited flag
  karta hai (existing + future signup dono ke liye).

## Apply karne ka tarika

1. In sab files ko apne project me **same relative paths** par copy/overwrite
   kar do (e.g. `src/lib/subscription.ts` → apke project ke
   `src/lib/subscription.ts` par).
2. Naya migration Supabase par run/deploy kar do:
   ```
   supabase db push
   ```
   (ya jo bhi tarika already project me migrations deploy karne ke liye use
   ho raha hai).
3. `npm run build` / `npm run dev` chala ke check kar lena.

Free-tier limit badalna ho (10 se kam/zyada) to sirf ek jagah change karna
hoga: `src/lib/subscription.ts` me `FREE_REPORT_LIMIT`. Pricing badalne ke
liye wahi file me `PRICING.monthly` / `PRICING.yearly`.
