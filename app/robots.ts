import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.aimealwise.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // Protect admin and API routes from crawling
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
