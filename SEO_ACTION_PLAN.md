# RadAI Copilot — SEO & Ranking Action Plan
_Prepared as an honest, practical roadmap — not a "guaranteed #1" promise. Nobody can honestly promise that, and you should be skeptical of anyone who does._

## 1. What was actually fixed in this update (code-level)

1. **Duplicate live domain (biggest issue found).** Your app is live at both
   `https://radai.alottt.com` and `https://radiology-ai-psi.vercel.app` with
   *identical* content. Search engines can treat two fully live, crawlable
   copies of the same site as duplicate content, which splits whatever
   ranking signal you're building instead of consolidating it on one URL.
   - Fixed with a permanent 301 redirect (`vercel.json`) sending every request
     on the `.vercel.app` host to `radai.alottt.com`.
   - Added a client-side fallback redirect in `index.html` in case the host
     redirect doesn't apply immediately after deploy (DNS/edge cache).
   - **Action for you:** after deploying, in Google Search Console check if
     `radiology-ai-psi.vercel.app` has any indexed URLs (Search Console →
     add it as a second property → Coverage). If any show up, use **Removals**
     to request temporary removal so old copies drop out faster than waiting
     for a natural re-crawl.

2. **`/signin` no longer indexable.** It's an app screen, not content — it was
   eating crawl budget and diluting topical relevance. Now disallowed in
   `robots.txt`.

3. **Breadcrumb structured data** added to `/features`, `/pricing`, and every
   blog post. This is what makes Google show the little `Home > Blog > Post`
   trail in results and helps Google understand your site hierarchy — a small
   but real relevance signal.

Everything else — per-page titles/descriptions/canonicals, the JSON-LD
(SoftwareApplication, FAQPage, BlogPosting), the sitemap, and the 13 separate
indexable pages — was already in solid shape from your last update. That
work was correct; the gap was the duplicate-domain issue above.

## 2. The honest picture on why you're not ranking yet

Indexing and ranking are different problems:

- **Indexing** = "does Google know this page exists and have a copy of it."
  Your sitemap + robots.txt + per-page metadata mean this is basically solved
  now that the duplicate-domain issue is fixed.
- **Ranking** = "does Google think this page deserves to appear above
  radai.com, RSNA's journal, or an established teleradiology brand for a
  given search." This is a *competition* problem, not a technical one, and it
  is **not something any code change can solve**. The sites you listed as
  references (radai.com, RSNA AI journal, radrocket.ai, etc.) have years of
  domain age, hundreds/thousands of backlinks, established brand-name search
  volume, and continuous content output. A brand-new domain — even a
  technically perfect one — realistically takes **3–6 months minimum** of
  consistent content + backlinks to start ranking for anything competitive,
  and 6–12+ months to challenge established players for head terms like
  "radiology AI" or "radiology reporting software."

What you *can* realistically win sooner: **long-tail, specific searches**
where competition is thinner — e.g. "AI radiology reporting software India,"
"teleradiology reporting tool for radiologists," "structured radiology
report template generator," "voice dictation radiology report software" —
rather than head terms like "radiology AI."

## 3. Immediate actions in Search Console / Bing Webmaster (you do these, no code needed)

1. **Google Search Console** (search.google.com/search-console)
   - Confirm `radai.alottt.com` is the verified property (it already has the
     verification meta tag).
   - Sitemaps → submit `https://radai.alottt.com/sitemap.xml` again after
     this deploy.
   - URL Inspection → request indexing individually for `/`, `/features`,
     `/pricing`, `/blog`, and each blog post URL. This is the fastest way to
     get first-crawl on new/changed pages — don't just wait for it.
   - Check **Coverage/Pages** report weekly for the first month; it'll tell
     you exactly which URLs are indexed vs excluded and why.
2. **Bing Webmaster Tools** (bing.com/webmasters) — separate from Google,
   often ignored, and meaningfully easier to rank in early since there's less
   competition. Verify the domain and submit the same sitemap. Bing also
   powers Copilot/ChatGPT-style answer surfaces in some contexts, so it's
   worth the 10 minutes.
3. **Google Business Profile** — if RadAI/Alottt has any physical
   presence/registered address (you already list Jalgaon and Pune addresses
   in your structured data), create a Business Profile. This helps local +
   brand-name search presence and is free.

## 4. Backlinks — what's realistic and how to actually get them

I can't fabricate or "add" backlinks into your codebase — a backlink is, by
definition, a link from *someone else's* site, so it has to be earned or
placed externally. Anyone who says they can bundle you "all proper
backlinks" as a deliverable is either doing manual outreach (real, but takes
time) or selling low-quality/spammy links that can get you a Google penalty.
Here's the legitimate path, roughly in order of ROI for a niche B2B medical
SaaS like this:

**A. Directories relevant to your actual category (do these first — low effort, real domains):**
- Product Hunt (launch RadAI Copilot as a product)
- G2, Capterra, GetApp, SaaSHub, AlternativeTo — B2B software directories;
  radiologists/hospital admins do search these when evaluating tools
- Slashdot/SourceForge software listings
- Indian startup directories: YourStory, Inc42 company listings, Tracxn
- AI tool directories: There's An AI For That, Futurepedia, AI Tool Guru
- Healthcare-tech directories: HIMSS Marketplace-style listings, Health IT
  vendor directories if you can find India-focused ones

**B. Content-driven backlinks (slower, but this is what actually moves the needle long-term):**
- Guest posts on radiology/teleradiology blogs, health-tech blogs, and
  Indian med-tech publications — offer to write about structured reporting,
  reporting turnaround time, or AI-in-radiology topics with a natural link
  back
- Get listed in "best AI tools for radiologists" / "best teleradiology
  software" roundup articles that other sites already publish — reach out
  to the authors directly
- Answer relevant questions on Reddit (r/radiology, r/medicine), Doximity,
  and radiology-specific forums/Discords with genuine, non-spammy answers
  that link back only when truly relevant — this also builds real brand
  awareness among the exact people who'd use the product
- LinkedIn: radiologist/teleradiology groups and your own founder posts,
  linked back to the site — LinkedIn content from a real person tends to
  outperform brand posts for a B2B medical product

**C. What NOT to do:**
- Don't buy backlink packages ("500 backlinks for $10") — these are almost
  always spam-network links and are a real risk of a Google manual action
  against your domain, which is much harder to undo than just waiting for
  organic growth.
- Don't do reciprocal link farms or unrelated-niche link exchanges.

## 5. Content roadmap (this is the actual ranking engine, more than any technical tweak)

You have 9 solid blog posts already. To seriously compete you need sustained
output, not a one-time batch — aim for **2–4 new posts a month** targeting
specific, answerable questions your buyers actually search, e.g.:
- "radiology report turnaround time benchmark [your target hospitals/region]"
- "CT vs MRI reporting template differences"
- "how AI mistake detection works in radiology reporting"
- comparison-style posts (careful and factual) like "structured vs free-text
  reporting software comparison"
- India-specific searches: "teleradiology reporting software India,"
  "radiology reporting outsourcing India"

Each post should follow the same pattern your existing ones already use
(FAQ schema, clear H1/H2 structure, internal links to `/features` and
`/pricing`) — that consistency is good and should continue.

## 6. Performance / Core Web Vitals (secondary, but worth doing eventually)

This site is a client-rendered React SPA (no server-side rendering), which
your last update already flagged. Google can index JS-rendered pages
reasonably well today, so this isn't blocking indexing — but pre-rendering
or SSR would give faster first paint for both users and crawlers, and is
the next real technical upgrade once the content/backlink work above is
underway. Happy to help with that as a dedicated follow-up (it's a bigger,
higher-risk change than what's in this update, so it's intentionally not
bundled in here per your note about not touching what's already working).

## 7. Summary — what to do, in order

1. Deploy this update (fixes the duplicate-domain split).
2. Re-submit sitemap + request indexing in GSC (10 minutes).
3. Set up Bing Webmaster Tools (10 minutes).
4. Submit to Product Hunt, G2, AlternativeTo, and 3–4 relevant directories
   this week (few hours total).
5. Start the guest-post/roundup outreach in parallel (ongoing).
6. Keep publishing 2–4 blog posts/month targeting long-tail radiology-AI
   searches.
7. Re-evaluate rankings honestly at the 60–90 day mark — that's the earliest
   realistic point to expect movement on non-branded terms, given the
   competition you listed.
