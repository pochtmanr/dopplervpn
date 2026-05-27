"use client";

import { useState, useEffect } from "react";

interface ObfuscatedEmailProps {
  user: string;
  domain: string;
  className?: string;
  separator?: string;
}

export function ObfuscatedEmail({
  user,
  domain,
  className,
  separator = " [at] ",
}: ObfuscatedEmailProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(true);
  }, []);

  if (!revealed) {
    return (
      <span className={className}>
        {user}
        <span aria-hidden>{separator}</span>
        {domain}
      </span>
    );
  }

  return (
    <a href={`mailto:${user}@${domain}`} className={className} rel="nofollow">
      {user}@{domain}
    </a>
  );
}
