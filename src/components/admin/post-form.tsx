"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./image-uploader";
import { CURATED_TAG_SLUGS } from "@/lib/blog-tags";

interface Tag {
  id: string;
  slug: string;
  name: string;
}

interface PostFormProps {
  mode: "create" | "edit";
  postId?: string;
  initialData?: {
    slug: string;
    author_name: string;
    status: string;
    published_at: string | null;
    image_url: string | null;
    title: string;
    excerpt: string;
    content: string;
    image_alt: string | null;
    meta_title: string | null;
    meta_description: string | null;
    og_title: string | null;
    og_description: string | null;
    tag_ids: string[];
  };
  availableTags: Tag[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function PostForm({
  mode,
  postId,
  initialData,
  availableTags,
}: PostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSeo, setShowSeo] = useState(false);
  const [slugManual, setSlugManual] = useState(mode === "edit");
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [extractUrl, setExtractUrl] = useState("");

  const [form, setForm] = useState({
    slug: initialData?.slug || "",
    author_name: initialData?.author_name || "Doppler Team",
    status: initialData?.status || "draft",
    published_at: initialData?.published_at?.slice(0, 16) || new Date().toISOString().slice(0, 16),
    image_url: initialData?.image_url || "",
    title: initialData?.title || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    image_alt: initialData?.image_alt || "",
    meta_title: initialData?.meta_title || "",
    meta_description: initialData?.meta_description || "",
    og_title: initialData?.og_title || "",
    og_description: initialData?.og_description || "",
    tag_ids: initialData?.tag_ids || [],
  });

  // Auto-generate slug from title (only in create mode, if not manually edited)
  useEffect(() => {
    if (mode === "create" && !slugManual && form.title) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, mode, slugManual]);

  function updateField(field: string, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTag(tagId: string) {
    setForm((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  }

  async function handleAiRewrite() {
    if (!form.content) return;
    setAiLoading("rewrite");
    setError(null);

    try {
      const res = await fetch("/api/admin/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: form.content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "AI rewrite failed");
        return;
      }
      updateField("content", data.content);
    } catch {
      setError("AI rewrite failed. Check your OpenAI API key.");
    } finally {
      setAiLoading(null);
    }
  }

  async function handleExtractUrl() {
    if (!extractUrl) return;
    setAiLoading("extract");
    setError(null);

    try {
      const res = await fetch("/api/admin/ai/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: extractUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "URL extraction failed");
        return;
      }
      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        excerpt: data.excerpt || prev.excerpt,
        content: data.content || prev.content,
        slug: prev.slug || slugify(data.title || ""),
        meta_title: data.meta_title || prev.meta_title,
        meta_description: data.meta_description || prev.meta_description,
        og_title: data.og_title || prev.og_title,
        og_description: data.og_description || prev.og_description,
      }));
      setExtractUrl("");
    } catch {
      setError("URL extraction failed. Check the URL and try again.");
    } finally {
      setAiLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      image_url: form.image_url || null,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
    };

    try {
      const url =
        mode === "create"
          ? "/api/admin/posts"
          : `/api/admin/posts/${postId}`;

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }

      if (mode === "create") {
        router.push(`/admin-dvpn/posts/${data.id}`);
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!postId || !confirm("Delete this post? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/admin-dvpn/posts");
      }
    } catch {
      setError("Failed to delete post.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6 sm:space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* URL Extract */}
      <div className="bg-bg-secondary border border-overlay/10 rounded-lg p-4 space-y-3">
        <label className="block text-sm font-medium text-text-muted">
          Generate from URL (Perplexity, news article, etc.)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={extractUrl}
            onChange={(e) => setExtractUrl(e.target.value)}
            placeholder="https://www.perplexity.ai/page/..."
            className="flex-1 bg-bg-primary border border-overlay/10 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal transition-colors"
          />
          <button
            type="button"
            onClick={handleExtractUrl}
            disabled={!extractUrl || aiLoading !== null}
            className="px-4 py-2.5 bg-accent-teal/20 text-accent-teal rounded-lg text-sm font-medium hover:bg-accent-teal/30 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {aiLoading === "extract" ? "Extracting..." : "Extract & Generate"}
          </button>
        </div>
      </div>

      {/* Image Upload */}
      <ImageUploader
        currentUrl={form.image_url || null}
        onUpload={(url) => updateField("image_url", url)}
      />

      {/* Title */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-muted">
          Title (English)
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          required
          placeholder="How to Protect Your Privacy Online"
          className="w-full bg-bg-secondary border border-overlay/10 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal transition-colors"
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-muted">
          Slug
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">/blog/</span>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true);
              updateField("slug", e.target.value);
            }}
            required
            placeholder="how-to-protect-your-privacy"
            className="flex-1 bg-bg-secondary border border-overlay/10 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal transition-colors"
          />
        </div>
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-muted">
          Excerpt (English)
        </label>
        <textarea
          value={form.excerpt}
          onChange={(e) => updateField("excerpt", e.target.value)}
          required
          rows={3}
          placeholder="A brief summary of the article..."
          className="w-full bg-bg-secondary border border-overlay/10 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal transition-colors resize-y"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-text-muted">
            Content — Markdown (English)
          </label>
          <button
            type="button"
            onClick={handleAiRewrite}
            disabled={!form.content || aiLoading !== null}
            className="text-xs px-3 py-1.5 bg-accent-teal/20 text-accent-teal rounded-lg hover:bg-accent-teal/30 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {aiLoading === "rewrite" ? "Rewriting..." : "AI Rewrite & Fix Typos"}
          </button>
        </div>
        <textarea
          value={form.content}
          onChange={(e) => updateField("content", e.target.value)}
          required
          rows={20}
          placeholder="Write your article content in Markdown..."
          className="w-full bg-bg-secondary border border-overlay/10 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal transition-colors resize-y font-mono text-sm"
        />
      </div>

      {/* Image Alt */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-muted">
          Image Alt Text (English)
        </label>
        <input
          type="text"
          value={form.image_alt}
          onChange={(e) => updateField("image_alt", e.target.value)}
          placeholder="Descriptive alt text for the featured image"
          className="w-full bg-bg-secondary border border-overlay/10 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal transition-colors"
        />
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-muted">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-full bg-bg-secondary border border-overlay/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-teal transition-colors"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Author */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-muted">
            Author
          </label>
          <input
            type="text"
            value={form.author_name}
            onChange={(e) => updateField("author_name", e.target.value)}
            className="w-full bg-bg-secondary border border-overlay/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-teal transition-colors"
          />
        </div>

        {/* Published Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-muted">
            Publish Date
          </label>
          <input
            type="datetime-local"
            value={form.published_at}
            onChange={(e) => updateField("published_at", e.target.value)}
            className="w-full bg-bg-secondary border border-overlay/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-teal transition-colors"
          />
        </div>
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-muted">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.filter((tag) => CURATED_TAG_SLUGS.includes(tag.slug)).map((tag) => {
              const selected = form.tag_ids.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors cursor-pointer ${
                    selected
                      ? "bg-accent-teal/20 border-accent-teal/40 text-accent-teal"
                      : "bg-bg-secondary border-overlay/10 text-text-muted hover:border-overlay/20"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SEO Section (collapsible) */}
      <div className="border border-overlay/10 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSeo(!showSeo)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <span>SEO & Open Graph</span>
          <svg
            className={`w-4 h-4 transition-transform ${showSeo ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showSeo && (
          <div className="p-4 border-t border-overlay/10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs text-text-muted">Meta Title</label>
                <input
                  type="text"
                  value={form.meta_title}
                  onChange={(e) => updateField("meta_title", e.target.value)}
                  maxLength={70}
                  placeholder="SEO title (max 70 chars)"
                  className="w-full bg-bg-primary border border-overlay/10 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-text-muted">OG Title</label>
                <input
                  type="text"
                  value={form.og_title}
                  onChange={(e) => updateField("og_title", e.target.value)}
                  maxLength={70}
                  placeholder="Open Graph title"
                  className="w-full bg-bg-primary border border-overlay/10 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs text-text-muted">Meta Description</label>
                <textarea
                  value={form.meta_description}
                  onChange={(e) => updateField("meta_description", e.target.value)}
                  maxLength={160}
                  rows={2}
                  placeholder="SEO description (max 160 chars)"
                  className="w-full bg-bg-primary border border-overlay/10 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-text-muted">OG Description</label>
                <textarea
                  value={form.og_description}
                  onChange={(e) => updateField("og_description", e.target.value)}
                  maxLength={200}
                  rows={2}
                  placeholder="Open Graph description"
                  className="w-full bg-bg-primary border border-overlay/10 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal resize-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-overlay/10">
        <div>
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              Delete post
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin-dvpn/posts")}
            className="flex-1 sm:flex-none px-4 py-2.5 text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-accent-teal text-white rounded-lg text-sm font-medium hover:bg-accent-teal-light transition-colors disabled:opacity-50 cursor-pointer text-center"
          >
            {saving
              ? "Saving..."
              : mode === "create"
                ? "Create Post"
                : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
