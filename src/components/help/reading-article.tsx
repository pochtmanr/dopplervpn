import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";

export type ReadingSection = {
  id: string;
  title: string;
  content: string;
  links?: { href: string; label: string }[];
};

export function ReadingArticle({
  articleId,
  title,
  updated,
  intro,
  sections,
}: {
  articleId?: string;
  title: string;
  updated: string;
  intro: string;
  sections: ReadingSection[];
}) {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Section className="min-h-screen">
          <article id={articleId} className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-text-primary mb-4">
              {title}
            </h1>
            <p className="text-text-muted mb-8">{updated}</p>
            <p className="text-text-muted text-lg leading-relaxed mb-8">{intro}</p>
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="mb-8 scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">
                  {section.title}
                </h2>
                <p className="text-text-muted leading-relaxed whitespace-pre-line">{section.content}</p>
                {section.links && section.links.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          className="text-accent-teal underline underline-offset-4"
                          rel="noopener noreferrer"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>
        </Section>
      </main>
      <Footer />
    </>
  );
}
