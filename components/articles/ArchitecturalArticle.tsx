import type { ReactNode } from "react";

interface SpecItem {
  label: string;
  value: string;
}

interface ArchitecturalArticleProps {
  eyebrow: string;
  title: string;
  summary: string;
  heroImage: string;
  narrative: string[];
  specs: SpecItem[];
  quote: string;
  credits: Array<{ label: string; value: string }>;
  gallery: {
    main: string;
    detail: string;
    skyline: string;
  };
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="text-sm tracking-[0.2em] text-neutral-600">{children}</h2>;
}

export function ArchitecturalArticle({
  eyebrow,
  title,
  summary,
  heroImage,
  narrative,
  specs,
  quote,
  credits,
  gallery
}: ArchitecturalArticleProps) {
  return (
    <article className="bg-stone-50 text-neutral-900 antialiased">
      <section aria-label="Project hero" className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 lg:px-10 lg:pt-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="mb-4 text-xs tracking-[0.24em] text-neutral-600">{eyebrow}</p>
            <h1 className="text-4xl font-medium leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-700 sm:text-base">{summary}</p>
          </div>
          <figure className="lg:col-span-7">
            <img src={heroImage} alt={`${title} hero view`} className="h-[40vh] w-full object-cover sm:h-[52vh] lg:h-[68vh]" />
          </figure>
        </div>
      </section>

      <section className="border-t border-black/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-10 lg:py-16">
          <SectionHeading>Project Narrative</SectionHeading>
          <div className="space-y-6 text-base leading-relaxed text-neutral-800 sm:text-lg lg:col-span-9">
            {narrative.map((paragraph) => (
              <p key={paragraph.slice(0, 20)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          <SectionHeading>Technical Profile</SectionHeading>
          <dl className="mt-8 grid gap-px bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
            {specs.map((spec) => (
              <div key={spec.label} className="bg-stone-50 p-5">
                <dt className="text-xs uppercase tracking-[0.18em] text-neutral-500">{spec.label}</dt>
                <dd className="mt-2 text-base">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <SectionHeading>Spatial Sequence</SectionHeading>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          <figure className="lg:col-span-8">
            <img src={gallery.main} alt="Urban plaza with tower facades" className="h-full min-h-[18rem] w-full object-cover" />
          </figure>
          <figure className="lg:col-span-4">
            <img src={gallery.detail} alt="Architectural detail of facade" className="h-full min-h-[18rem] w-full object-cover" />
          </figure>
          <figure className="lg:col-span-5">
            <img src={gallery.skyline} alt="Skyline with high-rise buildings" className="h-full min-h-[16rem] w-full object-cover" />
          </figure>
          <blockquote className="flex items-center border border-black/10 bg-stone-100 p-6 lg:col-span-7">
            <p className="text-lg leading-relaxed text-neutral-800">{quote}</p>
          </blockquote>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-white/50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm sm:px-6 lg:grid-cols-3 lg:px-10">
          {credits.map((item) => (
            <p key={item.label}>
              <span className="text-neutral-500">{item.label}: </span>
              {item.value}
            </p>
          ))}
        </div>
      </footer>
    </article>
  );
}
