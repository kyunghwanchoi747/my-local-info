import { MetadataRoute } from 'next';

export const dynamic = "force-static";

const baseUrl = 'https://my-local-info-b82.pages.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
