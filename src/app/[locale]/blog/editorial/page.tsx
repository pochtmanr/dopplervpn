import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import { COMPANY, SITE_URL } from "@/lib/facts";
import { Fragment } from "react";
// Calm+ (design-lab/home-preview.tsx; CALM_PLUS_PREVIEW=0 turns it off).
import { calmPlusPreview, PlusPageShell } from "../../design-lab/home-preview";

/** Shipped classes, and the Calm+ preview's: a reading column on the tonal ramp. */
const C = calmPlusPreview
  ? {
      article: "max-w-3xl mx-auto space-y-6 text-[18px] leading-[1.75] text-(--c-muted)",
      h1: "font-display text-3xl sm:text-4xl font-bold leading-tight text-(--c-text)",
      h2: "pt-4 font-display text-2xl font-bold text-(--c-text)",
      link: "font-semibold text-(--c-accent) underline underline-offset-4 decoration-(--c-accent)/40 hover:decoration-(--c-accent)",
    }
  : {
      article: "max-w-3xl mx-auto space-y-6 text-text-primary",
      h1: "text-3xl sm:text-4xl font-semibold",
      h2: "text-2xl font-semibold",
      link: "text-accent-teal underline",
    };
const Scope = calmPlusPreview ? PlusPageShell : Fragment;

export const metadata: Metadata = {
  title: "Jerry and our editorial standards",
  description: "How Doppler publishes, checks and corrects articles written under the Jerry editorial pen name.",
  alternates: { canonical: `${SITE_URL}/en/blog/editorial`, languages: { en: `${SITE_URL}/en/blog/editorial`, "x-default": `${SITE_URL}/en/blog/editorial` } },
};
export default async function EditorialPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  setRequestLocale(locale);
  return <><Navbar /><Scope><main className="min-h-screen pt-20"><Section>
    <article className={C.article}>
      <h1 className={C.h1}>Jerry and our editorial standards</h1>
      <p>Jerry is Doppler’s editorial pen name for articles about privacy, security and practical VPN use. Doppler VPN, published by {COMPANY.legalName}, is responsible for these articles.</p>
      <p>The name represents a consistent editorial perspective. It does not identify a verified individual security engineer, and personal experience, tests or professional credentials should never be inferred from it.</p>
      <h2 className={C.h2}>Evidence and useful explanations</h2>
      <p>Our standard is to distinguish facts, attributed claims, uncertainty and opinion. Articles should explain how a security issue works, who it affects, practical steps and the limits of those steps. A VPN’s benefits depend on the threat you are trying to address.</p>
      <h2 className={C.h2}>Automation and accountability</h2>
      <p>We use AI tools to assist with drafting and translation. Doppler remains accountable for the content. Automation is not evidence of original testing, independent research or personal experience.</p>
      <h2 className={C.h2}>Corrections</h2>
      <p>If an article contains an error or lacks important context, <Link href="/en/support" className={C.link}>contact Doppler support</Link> with the article URL and supporting evidence.</p>
      <p><Link href="/en/blog" className={C.link}>Return to the blog</Link></p>
    </article>
  </Section></main></Scope><Footer /></>;
}
