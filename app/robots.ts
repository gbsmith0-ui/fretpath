import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/plan/'],
    },
    sitemap: 'https://fretpath.app/sitemap.xml',
  }
}