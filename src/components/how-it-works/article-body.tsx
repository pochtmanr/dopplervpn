import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Element, Text } from "hast";
import { headingId } from "@/lib/how-it-works";
import { CHARTS } from "./charts/registry";

/**
 * Server-rendered markdown for the /how-it-works articles. The prose recipe is
 * the blog's (components/blog/blog-content.tsx) minus its `dark:prose-invert`,
 * which DESIGN.md forbids: every colour below is a theme token, so `.light`
 * flips the page on its own.
 *
 * A fenced block whose language is `chart` renders a chart from ./charts by id:
 *   ```chart
 *   protocol-timeline
 *   ```
 */

const PROSE =
  "prose prose-lg max-w-none text-start " +
  "prose-headings:font-display prose-headings:font-semibold prose-headings:text-text-primary prose-headings:tracking-tight prose-headings:scroll-mt-28 " +
  "prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-5 " +
  "prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-3 " +
  "prose-p:text-text-muted prose-p:leading-relaxed " +
  "prose-a:text-accent-teal-light prose-a:underline-offset-4 prose-a:decoration-accent-teal/40 hover:prose-a:decoration-accent-teal " +
  "prose-strong:text-text-primary prose-em:text-text-muted " +
  "prose-li:text-text-muted prose-li:marker:text-accent-teal " +
  "prose-blockquote:border-s-4 prose-blockquote:border-accent-teal prose-blockquote:bg-overlay/5 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-e-xl prose-blockquote:not-italic prose-blockquote:text-text-muted prose-blockquote:font-normal [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none " +
  "prose-code:text-accent-teal-light prose-code:bg-overlay/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none " +
  "prose-pre:bg-bg-secondary prose-pre:text-text-primary prose-pre:border prose-pre:border-overlay/10 prose-pre:rounded-xl " +
  "prose-hr:border-overlay/15";

function textOf(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textOf).join("");
  if (children && typeof children === "object" && "props" in children) {
    return textOf((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function chartIdOf(node: Element | undefined): string | null {
  const code = node?.children[0];
  if (!code || code.type !== "element" || code.tagName !== "code") return null;
  const cls = code.properties.className;
  if (!Array.isArray(cls) || !cls.includes("language-chart")) return null;
  return code.children
    .map((c) => (c as Text).value ?? "")
    .join("")
    .trim();
}

/**
 * Internal links are written locale-free in the markdown ("/tools") and get the
 * page's locale prefix here, so a translated article needs no link rewriting.
 */
export function ArticleBody({ markdown, locale }: { markdown: string; locale: string }) {
  return (
    <div className={PROSE}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => <h2 id={headingId(textOf(children))}>{children}</h2>,
          pre: ({ node, children }) => {
            const id = chartIdOf(node);
            if (id === null) return <pre>{children}</pre>;
            const Chart = CHARTS[id];
            if (!Chart) throw new Error(`how-it-works: unknown chart id "${id}"`);
            return <Chart />;
          },
          table: ({ children }) => (
            <div className="not-prose my-10 overflow-x-auto rounded-xl border border-overlay/15">
              <table className="w-full text-start text-sm sm:text-base border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-overlay/5 text-xs uppercase tracking-wider">{children}</thead>,
          th: ({ children }) => (
            <th className="px-4 py-3 text-start font-semibold border-b border-overlay/15 text-text-primary">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 align-top text-text-muted border-b border-overlay/10 [&_strong]:text-text-primary">
              {children}
            </td>
          ),
          a: ({ href = "", children }) => {
            const external = /^https?:\/\//.test(href);
            const target = href.startsWith("/") ? `/${locale}${href}` : href;
            return (
              <a href={target} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
