"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isRtlLocale } from "@/i18n/routing";
import { isHowItWorksLocale } from "@/i18n/how-it-works-locales";
import { isSecurityLocale } from "@/i18n/security-locales";
import { isVpnProtocolsLocale } from "@/i18n/vpn-protocols-locales";
import { BlogInlineCta } from "./blog-inline-cta";
import { PLUS_PROSE_TOKENS } from "@/app/[locale]/design-lab/plus-recipes";

const SITE = "https://www.dopplervpn.org";

/**
 * Translations keep link targets byte-identical, so a Russian post still links
 * to /en/vless-vpn. Point our own site pages at the reader's locale when that
 * page exists in it. Blog links stay as written: a given post may not be
 * translated into this locale, and that URL would 404.
 */
function localizeHref(href: string | undefined, locale: string): string | undefined {
  if (!href || locale === "en") return href;
  const m = /^(?:https:\/\/www\.dopplervpn\.org)?\/en(\/[^?#]*)?([?#].*)?$/.exec(href);
  if (!m) return href;
  const path = m[1] ?? "";
  const available = path.startsWith("/blog")
    ? false
    : path.startsWith("/how-it-works")
      ? isHowItWorksLocale(locale)
      : path.startsWith("/security")
        ? isSecurityLocale(locale)
        : path.startsWith("/vpn-protocols")
          ? isVpnProtocolsLocale(locale)
          : true;
  return available ? `/${locale}${path}${m[2] ?? ""}` : href;
}

function isExternal(href: string | undefined): boolean {
  return !!href && href.startsWith("http") && !href.startsWith(SITE);
}

interface BlogContentProps {
  content: string;
  locale: string;
  /** Calm+ preview, decided on the server page. */
  plus?: boolean;
}

/** Calm+ preview: the same prose on the tonal ramp (plus-recipes.tsx). */
const PLUS_PROSE = `prose prose-lg dark:prose-invert max-w-none text-start ${PLUS_PROSE_TOKENS}`;

// Find the source line (1-indexed) of the Nth ATX-style H2 in markdown,
// ignoring headings inside fenced code blocks. Returns null if fewer exist.
function findNthH2Line(markdown: string, n: number): number | null {
  const lines = markdown.split("\n");
  let inFence = false;
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s{0,3}(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^\s{0,3}##\s+\S/.test(line) && !/^\s{0,3}###/.test(line)) {
      count++;
      if (count === n) return i + 1;
    }
  }
  return null;
}

export function BlogContent({ content, locale, plus = false }: BlogContentProps) {
  const isRtl = isRtlLocale(locale);
  const thirdH2Line = useMemo(() => findNthH2Line(content, 3), [content]);

  return (
    <article
      dir={isRtl ? "rtl" : "ltr"}
      className={
        plus
          ? PLUS_PROSE
          : `
        prose prose-lg dark:prose-invert max-w-none
        text-start

        /* Headings */
        prose-headings:font-semibold prose-headings:text-text-primary prose-headings:tracking-tight
        prose-h2:text-3xl sm:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-6
        prose-h3:text-2xl sm:prose-h3:text-3xl prose-h3:mt-12 prose-h3:mb-4
        prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3

        /* Body text */
        prose-p:text-text-muted prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6

        /* Links */
        prose-a:text-accent-teal prose-a:font-medium prose-a:underline prose-a:underline-offset-4
        prose-a:decoration-accent-teal/40 hover:prose-a:decoration-accent-teal
        prose-a:transition-colors

        /* Bold / emphasis */
        prose-strong:text-text-primary prose-strong:font-semibold
        prose-em:text-text-muted

        /* Lists */
        prose-ul:my-6 prose-ol:my-6
        prose-li:text-text-muted prose-li:text-lg prose-li:leading-relaxed
        prose-li:mb-2 prose-li:marker:text-accent-teal

        /* Blockquotes */
        prose-blockquote:border-s-4 prose-blockquote:border-accent-teal
        prose-blockquote:bg-overlay/5 prose-blockquote:py-4 prose-blockquote:px-6
        prose-blockquote:rounded-e-xl prose-blockquote:not-italic
        prose-blockquote:text-text-muted prose-blockquote:my-8

        /* Code */
        prose-code:text-accent-teal-light prose-code:bg-overlay/10
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-base
        prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-bg-secondary prose-pre:border prose-pre:border-overlay/10
        prose-pre:rounded-xl prose-pre:my-8

        /* Images */
        prose-img:rounded-2xl prose-img:my-10

        /* Horizontal rules */
        prose-hr:border-overlay/20 prose-hr:my-12
      `
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className={plus ? "my-10 overflow-x-auto rounded-2xl bg-(--c-card)" : "my-10 overflow-x-auto rounded-xl border border-overlay/15"}>
              <table className="w-full text-start text-base border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={plus ? "bg-(--c-inset) text-[13px]" : "bg-overlay/8 text-sm uppercase tracking-wider"}>
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th
              className={
                plus
                  ? "px-5 py-3.5 font-bold text-(--c-text) whitespace-nowrap"
                  : "px-5 py-3.5 font-semibold border-b border-overlay/15 text-text-primary whitespace-nowrap"
              }
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={plus ? "px-5 py-3.5 text-(--c-muted) border-t border-(--c-separator)" : "px-5 py-3.5 text-text-muted border-b border-overlay/8"}>
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className={plus ? undefined : "transition-colors hover:bg-overlay/5"}>{children}</tr>
          ),
          a: ({ href, children }) => (
            <a
              href={localizeHref(href, locale)}
              target={isExternal(href) ? "_blank" : undefined}
              rel={isExternal(href) ? "noopener noreferrer" : undefined}
              className={
                plus
                  ? "text-(--c-accent) font-semibold underline underline-offset-4 decoration-(--c-accent)/40 hover:decoration-(--c-accent) transition-colors"
                  : "text-accent-teal font-medium underline underline-offset-4 decoration-accent-teal/40 hover:decoration-accent-teal transition-colors"
              }
            >
              {children}
            </a>
          ),
          h2: ({ node, children, ...props }) => {
            const isThirdH2 =
              thirdH2Line !== null &&
              node?.position?.start.line === thirdH2Line;
            return (
              <>
                <h2 {...props}>{children}</h2>
                {isThirdH2 && <BlogInlineCta plus={plus} />}
              </>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
