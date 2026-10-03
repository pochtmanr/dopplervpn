"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface ShareButtonsProps {
  url: string;
  title: string;
  imageUrl?: string | null;
  /** Calm+ preview, decided on the server page. */
  plus?: boolean;
}

export function ShareButtons({ url, title, plus = false }: ShareButtonsProps) {
  const t = useTranslations("blog");
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      color: "hover:bg-[#0088cc]/20 hover:text-[#0088cc]",
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: "hover:bg-overlay/10 hover:text-text-primary",
    },
    {
      name: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      color: "hover:bg-[#25D366]/20 hover:text-[#25D366]",
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: "hover:bg-[#1877F2]/20 hover:text-[#1877F2]",
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: "hover:bg-[#0A66C2]/20 hover:text-[#0A66C2]",
    },
    {
      name: "Reddit",
      href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm6.066 13.27c.025.153.038.31.038.468 0 2.387-2.779 4.32-6.206 4.32-3.426 0-6.206-1.934-6.206-4.32 0-.159.013-.315.038-.468a1.616 1.616 0 01-.576-1.232c0-.892.724-1.616 1.616-1.616.448 0 .853.184 1.144.48 1.128-.726 2.68-1.192 4.412-1.24l.752-3.534.005-.024a.363.363 0 01.432-.282l2.496.532a1.152 1.152 0 012.176.508 1.15 1.15 0 01-1.15 1.15 1.152 1.152 0 01-1.126-.922l-2.218-.473-.67 3.14c1.704.06 3.226.526 4.336 1.24.291-.298.697-.484 1.147-.484.892 0 1.616.724 1.616 1.616 0 .487-.217.923-.56 1.22zM9.06 12.768c-.636 0-1.152.516-1.152 1.152s.516 1.152 1.152 1.152 1.152-.516 1.152-1.152-.516-1.152-1.152-1.152zm5.88 0c-.636 0-1.152.516-1.152 1.152s.516 1.152 1.152 1.152 1.152-.516 1.152-1.152-.516-1.152-1.152-1.152zm-4.86 3.384c.492.492 1.182.732 1.92.732s1.428-.24 1.92-.732a.36.36 0 01.504.504c-.612.612-1.452.948-2.424.948s-1.812-.336-2.424-.948a.36.36 0 01.504-.504z"/>
        </svg>
      ),
      color: "hover:bg-[#FF4500]/20 hover:text-[#FF4500]",
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className={plus ? "mt-8 pt-6 border-t border-(--c-separator)" : "mt-8 pt-6 border-t border-overlay/10"}>
      <p className={plus ? "text-[13px] font-semibold text-(--c-tert) mb-3" : "text-sm font-medium text-text-muted mb-3"}>{t("share")}</p>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={
              plus
                ? "inline-flex h-10 items-center gap-2 rounded-full bg-(--c-inset) px-4 text-sm font-bold text-(--c-muted) transition-colors hover:bg-(--c-accent-tint) hover:text-(--c-accent)"
                : `inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-overlay/10 text-text-muted text-sm transition-colors ${link.color}`
            }
            title={`${t("share")} ${link.name}`}
          >
            {link.icon}
            <span className="hidden sm:inline">{link.name}</span>
          </a>
        ))}
        <button
          onClick={copyLink}
          className={
            plus
              ? `inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors cursor-pointer ${
                  copied
                    ? "bg-(--c-accent-tint) text-(--c-accent)"
                    : "bg-(--c-inset) text-(--c-muted) hover:bg-(--c-accent-tint) hover:text-(--c-accent)"
                }`
              : `inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all duration-200 cursor-pointer ${
                  copied
                    ? "border-accent-teal/30 bg-accent-teal/10 text-accent-teal"
                    : "border-overlay/10 text-text-muted hover:bg-overlay/10 hover:text-text-primary"
                }`
          }
          title={t("copyLink")}
        >
          {copied ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H8.25m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m6 10.375a2.625 2.625 0 0 1-2.625-2.625" />
            </svg>
          )}
          <span className="hidden sm:inline">
            {copied ? t("copied") : t("copyLink")}
          </span>
        </button>
      </div>
    </div>
  );
}
