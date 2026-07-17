# RadAI Copilot — SEO / Multi-Page Update

## What changed and why

Your site had exactly **one** crawlable URL (`/`) — a single-page app with
no router, so every "page" was really just an anchor (`#pricing`,
`#platform`...) on one long landing page. Google can only index real,
separate URLs, which is why nothing besides the homepage was ever showing
up in Search Console.

This update adds real routing (`react-router-dom`) and splits the site into
distinct, indexable pages, each with its own `<title>`, meta description,
canonical tag and JSON-LD:

- `/` — Home (unchanged content, now links out to the pages below)
- `/features` — deep-dive feature page (new, unique content — not a copy of Home)
- `/pricing` — dedicated pricing + billing FAQ page (new, unique content)
- `/blog` — blog index
- `/blog/ai-radiology-reporting-software-guide`
- `/blog/structured-radiology-reporting-best-practices`
- `/blog/teleradiology-workflow-efficiency`

All new pages share the same header/footer, dark navy + gold visual style,
and typography as your existing site — nothing was redesigned. Images used
on the new pages are real, watermark-free photos from Pexels (free for
commercial use under the Pexels License, no attribution required); swap
them for your own photography whenever you'd like, they're just `<img src>`
URLs in the page files.

## How to apply this

1. Unzip this archive **into the root of your existing project**, letting
   it overwrite the matching files (`package.json`, `src/App.tsx`,
   `src/main.tsx`, `src/components/landing/LandingPage.tsx`,
   `public/sitemap.xml`). Everything else here is a new file, nothing else
   in your project is touched.
2. Install the one new dependency this needs:
   ```
   npm install
   ```
   (`react-router-dom` was added to `package.json`; this pulls it in.)
3. `npm run dev` to check locally, then `npm run build` as usual.
4. **Important for hosting:** because these are now real routes handled by
   the browser (not the server), your host needs to serve `index.html` for
   any path so refreshing `/features` or `/blog/...` directly doesn't
   404. I've included both:
   - `public/_redirects` — works on Netlify and Cloudflare Pages automatically
   - `vercel.json` — works on Vercel automatically
   If you're on a different host (e.g. plain Nginx/Apache), it needs an
   equivalent "fallback to index.html" rewrite rule — let me know your host
   and I can write that config too.
5. After deploying, go to **Google Search Console → Sitemaps** and
   resubmit `https://radai.alottt.com/sitemap.xml` (now lists all 7 URLs),
   then use **URL Inspection → Request Indexing** on `/features`,
   `/pricing`, `/blog`, and each blog post to speed up first crawl.

## Adding more blog posts later

Everything lives in `src/data/blogPosts.ts` — add a new object to the
`BLOG_POSTS` array (slug, title, sections, FAQs) and it automatically gets
its own page at `/blog/<slug>`, shows up on `/blog`, and is picked up by
the sitemap generation pattern already used for the three posts included
here (just add the URL to `public/sitemap.xml` the same way).

## One honest limitation to know about

This is still a client-rendered React app (no server-side rendering).
Modern Google crawls and indexes JS-rendered pages like this reasonably
well, which is what actually gets you indexed at all — but if you want
the fastest possible indexing and the best Core Web Vitals for
first-time/crawler visits, the next real upgrade is pre-rendering or SSR
(e.g. via Vite's prerender plugins or moving to Next.js). Happy to help
with that as a follow-up if rankings need a further push once these pages
are indexed.
