import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { SiteHeader } from '../components/landing/SiteHeader';
import { SiteFooter } from '../components/landing/SiteFooter';
import { SEO } from '../components/seo/SEO';
import { BLOG_POSTS } from '../data/blogPosts';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 antialiased overflow-x-hidden">
      <SEO
        path="/blog"
        title="Blog | RadAI Copilot — AI Radiology Reporting Insights"
        description="Practical, no-fluff articles on AI radiology reporting, structured reporting best practices, and teleradiology workflow — written for practicing radiologists."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'RadAI Copilot Blog',
          url: 'https://radai.alottt.com/blog',
          description: 'Practical articles on AI radiology reporting, structured reporting, and teleradiology workflow for practicing radiologists.',
          blogPost: BLOG_POSTS.map((p) => ({
            '@type': 'BlogPosting',
            headline: p.title,
            url: `https://radai.alottt.com/blog/${p.slug}`,
            datePublished: p.publishedDate,
            dateModified: p.updatedDate,
          })),
        }}
      />

      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0d1c36_0%,_#03070f_60%)]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gold-500/[0.05] blur-3xl" />
      </div>

      <SiteHeader onGetStarted={() => {}} />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-4 text-center">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold-400 mb-3">RadAI Copilot Blog</p>
        <h1 className="font-display font-bold text-white leading-[1.1] tracking-tight text-[2.1rem] sm:text-[2.8rem]">
          Reporting workflow, from people who build for it.
        </h1>
        <p className="mt-5 text-[1rem] leading-[1.8] text-slate-400 max-w-xl mx-auto">
          Practical articles on AI-assisted reporting, structured reporting practice, and
          teleradiology workflow — no vendor fluff, grounded in what actually happens during a
          reporting day.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid gap-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group grid sm:grid-cols-[280px_1fr] gap-0 sm:gap-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-gold-400/25 transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-[16/10] sm:aspect-auto sm:h-full overflow-hidden bg-navy-900">
                <img
                  src={post.heroImage}
                  alt={post.heroImageAlt}
                  width={560}
                  height={350}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col">
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-gold-300 mb-2">{post.category}</span>
                <h2 className="font-display font-semibold text-white text-[1.15rem] leading-snug mb-2 group-hover:text-gold-200 transition-colors">
                  {post.title}
                </h2>
                <p className="text-[0.85rem] leading-relaxed text-slate-400 mb-4 flex-1">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-[0.75rem] text-slate-500">
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(post.publishedDate)}</span>
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {post.readTime}</span>
                  <span className="ml-auto flex items-center gap-1 text-gold-400 font-semibold group-hover:gap-2 transition-all">
                    Read <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
