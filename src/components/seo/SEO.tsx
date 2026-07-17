import { useEffect } from 'react';

const SITE_URL = 'https://radai.alottt.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SEOProps {
  /** Full page title. Keep it under ~60 characters where possible. */
  title: string;
  /** Meta description shown in search results. Aim for ~150–160 characters. */
  description: string;
  /** Path only, e.g. "/blog/structured-radiology-reporting". */
  path: string;
  ogImage?: string;
  /** One or more schema.org JSON-LD objects for this specific page. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Sets document.title + meta description/canonical/OG/Twitter tags and
 * injects page-specific JSON-LD for each route. This is what makes every
 * route in this SPA look like a distinct, real page to search engines
 * instead of every URL sharing the same static <head> from index.html.
 *
 * Renders nothing — call it once near the top of each page component.
 */
export function SEO({ title, description, path, ogImage = DEFAULT_OG_IMAGE, jsonLd }: SEOProps) {
  useEffect(() => {
    const fullUrl = `${SITE_URL}${path}`;
    const previousTitle = document.title;
    document.title = title;

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', fullUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    let canonicalEl = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    const previousCanonical = canonicalEl.getAttribute('href');
    canonicalEl.setAttribute('href', fullUrl);

    const injectedScripts: HTMLScriptElement[] = [];
    if (jsonLd) {
      const entries = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      entries.forEach((data) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.seoInjected = 'true';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
        injectedScripts.push(script);
      });
    }

    return () => {
      document.title = previousTitle;
      if (previousCanonical) canonicalEl?.setAttribute('href', previousCanonical);
      injectedScripts.forEach((s) => s.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, ogImage, JSON.stringify(jsonLd)]);

  return null;
}
