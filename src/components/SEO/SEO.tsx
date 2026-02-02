import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  noindex?: boolean
  nofollow?: boolean
}

const defaultSEO: Required<Omit<SEOProps, 'image' | 'url' | 'type' | 'author' | 'publishedTime' | 'modifiedTime' | 'noindex' | 'nofollow'>> = {
  title: 'GèreTonDjai - Gère ton argent comme un boss, en Nouchi !',
  description: 'Application de gestion de dépenses intelligente pour les Ivoiriens. Saisie vocale, reconnaissance du Nouchi, conseiller IA Woro, analyses avancées. 100% gratuit et disponible hors ligne.',
  keywords: 'gestion dépenses, argent, Côte d\'Ivoire, Nouchi, mobile money, Orange Money, MTN Money, Wave, épargne, budget, finances personnelles, application ivoirienne, PWA, hors ligne'
}

const baseUrl = import.meta.env.VITE_APP_URL || 'https://geretondjai.com'
const defaultImage = `${baseUrl}/og-image.jpg`

export function SEO({
  title,
  description,
  keywords,
  image = defaultImage,
  url,
  type = 'website',
  author = 'Sam_k',
  publishedTime,
  modifiedTime,
  noindex = false,
  nofollow = false
}: SEOProps) {
  const location = useLocation()
  const currentUrl = url || `${baseUrl}${location.pathname}`

  useEffect(() => {
    // Update document title
    document.title = title ? `${title} | GèreTonDjai` : defaultSEO.title

    // Meta tags
    const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Basic SEO
    updateMetaTag('description', description || defaultSEO.description)
    updateMetaTag('keywords', keywords || defaultSEO.keywords)
    updateMetaTag('author', author)
    updateMetaTag('robots', `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`)

    // Open Graph
    updateMetaTag('og:title', title || defaultSEO.title, 'property')
    updateMetaTag('og:description', description || defaultSEO.description, 'property')
    updateMetaTag('og:image', image, 'property')
    updateMetaTag('og:url', currentUrl, 'property')
    updateMetaTag('og:type', type, 'property')
    updateMetaTag('og:site_name', 'GèreTonDjai', 'property')
    updateMetaTag('og:locale', 'fr_CI', 'property')

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title || defaultSEO.title)
    updateMetaTag('twitter:description', description || defaultSEO.description)
    updateMetaTag('twitter:image', image)
    updateMetaTag('twitter:creator', '@geretondjai')

    // Additional meta tags
    updateMetaTag('theme-color', '#f48c25')
    updateMetaTag('apple-mobile-web-app-capable', 'yes')
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default')
    updateMetaTag('apple-mobile-web-app-title', 'GèreTonDjai')

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', currentUrl)

    // Structured Data (JSON-LD)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebApplication',
      name: title || defaultSEO.title,
      description: description || defaultSEO.description,
      url: currentUrl,
      image: image,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web, iOS, Android',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'XOF'
      },
      author: {
        '@type': 'Person',
        name: author
      },
      ...(publishedTime && { datePublished: publishedTime }),
      ...(modifiedTime && { dateModified: modifiedTime })
    }

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Add new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(structuredData)
    document.head.appendChild(script)
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, noindex, nofollow, currentUrl, location.pathname])

  return null
}

