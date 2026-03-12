"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TranslationEditor } from "./translation-editor";
import { getFlagUrl } from "@/lib/languages";

const ALL_LOCALES = [
  { code: "en", name: "English", countryCode: "us" },
  { code: "he", name: "Hebrew", countryCode: "il" },
  { code: "ru", name: "Russian", countryCode: "ru" },
  { code: "es", name: "Spanish", countryCode: "es" },
  { code: "pt", name: "Portuguese", countryCode: "br" },
  { code: "fr", name: "French", countryCode: "fr" },
  { code: "zh", name: "Chinese", countryCode: "cn" },
  { code: "de", name: "German", countryCode: "de" },
  { code: "fa", name: "Farsi", countryCode: "ir" },
  { code: "ar", name: "Arabic", countryCode: "sa" },
  { code: "hi", name: "Hindi", countryCode: "in" },
  { code: "id", name: "Indonesian", countryCode: "id" },
  { code: "tr", name: "Turkish", countryCode: "tr" },
  { code: "vi", name: "Vietnamese", countryCode: "vn" },
  { code: "th", name: "Thai", countryCode: "th" },
  { code: "ms", name: "Malay", countryCode: "my" },
  { code: "ko", name: "Korean", countryCode: "kr" },
  { code: "ja", name: "Japanese", countryCode: "jp" },
  { code: "tl", name: "Filipino", countryCode: "ph" },
  { code: "ur", name: "Urdu", countryCode: "pk" },
  { code: "sw", name: "Swahili", countryCode: "ke" },
];

interface Translation {
  locale: string;
  title: string;
  excerpt: string;
  content: string;
  image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  updated_at: string;
}

interface TranslationGridProps {
  postId: string;
  translations: Translation[];
}

export function TranslationGrid({
  postId,
  translations,
}: TranslationGridProps) {
  const router = useRouter();
  const [translating, setTranslating] = useState<string | null>(null);
  const [batchTranslating, setBatchTranslating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0, failed: 0 });
  const [completedLocales, setCompletedLocales] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const translationMap = new Map(translations.map((t) => [t.locale, t]));

  async function translateOne(locale: string): Promise<boolean> {
    const res = await fetch("/api/admin/ai/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, locale }),
    });
    return res.ok;
  }

  async function handleTranslate(locale: string) {
    setTranslating(locale);
    setError(null);

    try {
      const ok = await translateOne(locale);
      if (!ok) {
        setError(`Failed to translate to ${locale}`);
        return;
      }
      router.refresh();
    } catch {
      setError(`Failed to translate to ${locale}`);
    } finally {
      setTranslating(null);
    }
  }

  async function handleTranslateAll() {
    const missing = ALL_LOCALES
      .filter((loc) => loc.code !== "en" && !translationMap.has(loc.code))
      .map((loc) => loc.code);

    if (missing.length === 0) return;

    setBatchTranslating(true);
    setBatchProgress({ done: 0, total: missing.length, failed: 0 });
    setCompletedLocales(new Set());
    setError(null);

    let done = 0;
    let failed = 0;

    for (const locale of missing) {
      try {
        const ok = await translateOne(locale);
        if (ok) {
          done++;
          setCompletedLocales((prev) => new Set([...prev, locale]));
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
      setBatchProgress({ done, total: missing.length, failed });
    }

    if (failed > 0) {
      setError(`${failed} translation(s) failed`);
    }

    setBatchTranslating(false);
    router.refresh();
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) return "Just now";
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // If editing a specific locale, show the editor
  if (editing) {
    const existing = translationMap.get(editing);
    return (
      <TranslationEditor
        postId={postId}
        locale={editing}
        localeName={
          ALL_LOCALES.find((l) => l.code === editing)?.name || editing
        }
        initial={existing || null}
        onClose={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    );
  }

  const missingCount = ALL_LOCALES.filter(
    (loc) => loc.code !== "en" && !translationMap.has(loc.code)
  ).length;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Translate All button */}
      {missingCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-sm text-text-muted">
            {missingCount} language{missingCount !== 1 ? "s" : ""} missing
          </p>
          <button
            onClick={handleTranslateAll}
            disabled={batchTranslating || translating !== null}
            className="px-4 py-2 bg-accent-teal/20 text-accent-teal rounded-lg text-sm font-medium hover:bg-accent-teal/30 transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
          >
            {batchTranslating
              ? `Translating ${batchProgress.done}/${batchProgress.total}...`
              : `Translate All (${missingCount})`}
          </button>
        </div>
      )}

      {/* Batch progress bar */}
      {batchTranslating && batchProgress.total > 0 && (
        <div className="space-y-2">
          <div className="w-full bg-overlay/5 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-accent-teal rounded-full transition-all duration-300"
              style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-text-muted">
            {batchProgress.done} of {batchProgress.total} completed
            {batchProgress.failed > 0 && `, ${batchProgress.failed} failed`}
          </p>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden sm:block bg-bg-secondary border border-overlay/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-overlay/10">
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Language
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Title Preview
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Updated
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-overlay/5">
              {ALL_LOCALES.map((loc) => {
                const trans = translationMap.get(loc.code);
                const isSource = loc.code === "en";
                const hasTranslation = !!trans;
                const isTranslating = translating === loc.code || (batchTranslating && !hasTranslation && loc.code !== "en");
                const justCompleted = batchTranslating && completedLocales.has(loc.code);

                return (
                  <tr
                    key={loc.code}
                    className="hover:bg-overlay/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img src={getFlagUrl(loc.countryCode)} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {loc.name}
                          </p>
                          <p className="text-xs text-text-muted">{loc.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isSource ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Source
                        </span>
                      ) : justCompleted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          Done
                        </span>
                      ) : isTranslating && !hasTranslation ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-teal/10 text-accent-teal border border-accent-teal/20 animate-pulse">
                          Translating...
                        </span>
                      ) : hasTranslation ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted max-w-xs truncate">
                      {trans?.title || "\u2014"}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {trans ? formatDate(trans.updated_at) : "\u2014"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isSource ? (
                          <span className="text-xs text-text-muted">
                            Edit in post
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditing(loc.code)}
                              className="text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                            >
                              {hasTranslation ? "Edit" : "Manual"}
                            </button>
                            <button
                              onClick={() => handleTranslate(loc.code)}
                              disabled={isTranslating || translating !== null || batchTranslating}
                              className="text-sm text-accent-teal hover:text-accent-teal-light transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {isTranslating
                                ? "Translating..."
                                : hasTranslation
                                  ? "Re-translate"
                                  : "AI Translate"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {ALL_LOCALES.map((loc) => {
          const trans = translationMap.get(loc.code);
          const isSource = loc.code === "en";
          const hasTranslation = !!trans;
          const isTranslating = translating === loc.code || (batchTranslating && !hasTranslation && loc.code !== "en");
          const justCompleted = batchTranslating && completedLocales.has(loc.code);

          const statusBadge = isSource ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400">
              Source
            </span>
          ) : justCompleted ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400">
              Done
            </span>
          ) : isTranslating && !hasTranslation ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent-teal/10 text-accent-teal animate-pulse">
              Translating...
            </span>
          ) : hasTranslation ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400">
              Done
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-500/10 text-yellow-400">
              Missing
            </span>
          );

          return (
            <div
              key={loc.code}
              className="bg-bg-secondary border border-overlay/10 rounded-lg p-3 hover:bg-overlay/5 transition-colors"
            >
              {/* Row 1: flag + name + status */}
              <div className="flex items-center gap-2.5">
                <img src={getFlagUrl(loc.countryCode)} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-text-primary">{loc.name}</span>
                  <span className="text-xs text-text-muted ml-1.5">{loc.code}</span>
                </div>
                {statusBadge}
              </div>

              {/* Row 2: title preview + actions */}
              <div className="flex items-center justify-between mt-1.5 ml-[30px]">
                <p className="text-xs text-text-muted truncate flex-1 mr-2">
                  {trans?.title || "\u2014"}
                </p>
                {isSource ? (
                  <span className="text-[11px] text-text-muted shrink-0">Edit in post</span>
                ) : (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditing(loc.code)}
                      className="px-2 py-0.5 text-xs text-text-muted hover:text-text-primary hover:bg-overlay/10 rounded-md transition-colors cursor-pointer"
                    >
                      {hasTranslation ? "Edit" : "Manual"}
                    </button>
                    <button
                      onClick={() => handleTranslate(loc.code)}
                      disabled={isTranslating || translating !== null || batchTranslating}
                      className="px-2 py-0.5 text-xs text-accent-teal hover:bg-accent-teal/10 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isTranslating ? "..." : hasTranslation ? "Redo" : "AI"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
