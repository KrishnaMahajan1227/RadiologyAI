import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock, HelpCircle } from 'lucide-react';
import { SiteHeader } from '../components/landing/SiteHeader';
import { SiteFooter } from '../components/landing/SiteFooter';
import { SEO } from '../components/seo/SEO';
import { BLOG_POSTS, getPostBySlug } from '../data/blogPosts';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function BlogPostPage({ onGetStarted }: { onGetStarted: () => void }) {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 antialiased overflow-x-hidden">
      <SEO
        path={`/blog/${post.slug}`}
        title={`${post.metaTitle} | RadAI Copilot Blog`}
        description={post.metaDescription}
        ogImage={post.heroImage}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.metaDescription,
            image: post.heroImage,
            datePublished: post.publishedDate,
            dateModified: post.updatedDate,
            author: { '@type': 'Organization', name: 'RadAI Copilot', url: 'https://radai.alottt.com' },
            publisher: {
              '@type': 'Organization',
              name: 'Alottt.com',
              logo: { '@type': 'ImageObject', url: 'https://radai.alottt.com/favicon.svg' },
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': `https://radai.alottt.com/blog/${post.slug}` },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: post.faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
        ]}
      />

      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0d1c36_0%,_#03070f_60%)]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gold-500/[0.05] blur-3xl" />
      </div>

      <SiteHeader onGetStarted={onGetStarted} />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-400 hover:text-gold-300 transition-colors mb-6">
          <ArrowLeft size={14} /> Back to blog
        </Link>

        <span className="text-[0.68rem] font-bold uppercase tracking-wider text-gold-300">{post.category}</span>
        <h1 className="mt-2 font-display font-bold text-white leading-[1.15] tracking-tight text-[1.9rem] sm:text-[2.4rem]">
          {post.title}
        </h1>

        <div className="mt-4 flex items-center gap-4 text-[0.8rem] text-slate-500">
          <span className="flex items-center gap-1.5"><Calendar size={13} /> {formatDate(post.publishedDate)}</span>
          <span className="flex items-center gap-1.5"><Clock size={13} /> {post.readTime}</span>
        </div>

        <div className="mt-8 rounded-2xl overflow-hidden border border-white/10">
          <img
            src={post.heroImage}
            alt={post.heroImageAlt}
            width={1200}
            height={675}
            loading="eager"
            className="w-full h-auto object-cover"
          />
        </div>

        <p className="mt-8 text-[1.02rem] leading-[1.85] text-slate-300">{post.intro}</p>

        {post.sections.map((section) => (
          <div key={section.heading} className="mt-10">
            <h2 className="font-display font-bold text-white text-[1.35rem] leading-snug mb-4">{section.heading}</h2>
            {section.paragraphs.map((para, i) => (
              <p key={i} className="text-[0.95rem] leading-[1.85] text-slate-400 mb-4">{para}</p>
            ))}
            {section.bullets && (
              <ul className="space-y-2.5 mt-4">
                {section.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[0.9rem] leading-relaxed text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0 mt-2" /> {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {/* FAQ */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <h2 className="font-display font-bold text-white text-[1.2rem] mb-5 flex items-center gap-2.5">
            <HelpCircle size={18} className="text-gold-400" /> Frequently asked
          </h2>
          <div className="space-y-5">
            {post.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-display font-semibold text-white text-[0.92rem] mb-1.5">{f.q}</h3>
                <p className="text-[0.85rem] leading-relaxed text-slate-400">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 text-[0.95rem] leading-[1.85] text-slate-400">{post.conclusion}</p>

        {/* Inline CTA */}
        <div className="mt-10 rounded-2xl border border-gold-400/25 bg-gold-400/[0.05] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 justify-between">
          <div>
            <p className="font-display font-semibold text-white text-[1rem] mb-1">Try RadAI Copilot on your own cases</p>
            <p className="text-[0.83rem] text-slate-400">10 free AI-generated reports, no card required.</p>
          </div>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 bg-gold-gradient text-navy-950 font-semibold text-[0.85rem] px-5 py-3 rounded-lg hover:shadow-gold hover:-translate-y-0.5 transition-all duration-200 shrink-0"
          >
            Start free <ArrowRight size={15} />
          </button>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <h2 className="font-display font-bold text-white text-[1.3rem] mb-6">More on reporting workflow</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:border-gold-400/25 transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-navy-900">
                    <img
                      src={p.heroImage}
                      alt={p.heroImageAlt}
                      width={500}
                      height={280}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-gold-300">{p.category}</span>
                    <h3 className="mt-1.5 font-display font-semibold text-white text-[0.95rem] leading-snug group-hover:text-gold-200 transition-colors">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
