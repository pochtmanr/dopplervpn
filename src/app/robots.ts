import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin-dvpn", "/api/", "/checkout"],
      },
    ],
    sitemap: "https://www.dopplervpn.org/sitemap.xml",
  };
}
