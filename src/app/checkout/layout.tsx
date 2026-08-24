import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { GaConsent } from "@/components/analytics/ga-consent";
import { CookieConsent } from "@/components/cookie-consent";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Subscribe — Doppler VPN",
  robots: { index: false, follow: false },
};

/**
 * /checkout is its own root layout — it is not under [locale] and gets none of
 * that layout's providers. It had no analytics at all, which put a hole in the
 * middle of the revenue funnel: `begin_checkout` fires on /account and
 * `purchase` on /[locale]/checkout/success, with the page between them
 * invisible.
 *
 * Consent still governs it. The banner writes to localStorage on the same
 * origin, so a visitor who already chose on the marketing site keeps that
 * choice here; `CookieConsent` is mounted so someone who lands on /checkout
 * first can still make one. Only the `cookie` namespace is passed to the
 * client — this route is not localized (see `<html lang="en">`) and shipping
 * the full message bundle would be ~276 KB for one banner.
 */
export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const cookieMessages = { cookie: messages.cookie };

  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body className="min-h-screen bg-zinc-950 text-white antialiased">
        {children}
        <NextIntlClientProvider locale="en" messages={cookieMessages}>
          <CookieConsent />
        </NextIntlClientProvider>
        <GaConsent />
      </body>
    </html>
  );
}
