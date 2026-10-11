import React, { useEffect } from 'react';
import { SEO_METADATA_MAP, BASE_CANONICAL_URL } from './tools/seoMetadata';

interface SEOHeadProps {
  currentPath: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ currentPath }) => {
  useEffect(() => {
    // Normalize path (lowercase, strip trailing slash unless root)
    const normalized = currentPath === '/' ? '/' : currentPath.toLowerCase().replace(/\/$/, '');
    const seo = SEO_METADATA_MAP[normalized] || SEO_METADATA_MAP['/'];

    if (!seo) return;

    // 1. Update Document Title
    document.title = seo.title;

    // Helper to set/update a <meta> tag
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // 2. Meta Description & Keywords
    setMetaTag('name', 'description', seo.description);
    setMetaTag('name', 'keywords', seo.keywords.join(', '));

    // 3. Open Graph Tags
    setMetaTag('property', 'og:title', seo.title);
    setMetaTag('property', 'og:description', seo.description);
    setMetaTag('property', 'og:url', seo.canonical || `${BASE_CANONICAL_URL}${normalized}`);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'ATON TECH Solutions');

    // 4. Twitter Tags
    setMetaTag('name', 'twitter:title', seo.title);
    setMetaTag('name', 'twitter:description', seo.description);

    // 5. Canonical Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = seo.canonical || `${BASE_CANONICAL_URL}${normalized}`;

    // 6. Dynamic Schema.org JSON-LD (WebApplication + FAQPage)
    let jsonLdScript = document.getElementById('dynamic-tool-jsonld') as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'dynamic-tool-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    const jsonLdData: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          '@id': `${seo.canonical}#webapp`,
          'name': seo.title,
          'url': seo.canonical,
          'description': seo.description,
          'applicationCategory': 'UtilitiesApplication',
          'operatingSystem': 'Any (Browser-based)',
          'browserRequirements': 'Requires JavaScript. Requires HTML5.',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD'
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'ATON TECH Solutions',
            'url': BASE_CANONICAL_URL
          }
        }
      ]
    };

    // Add FAQPage Schema if FAQs exist for rich snippets in Google search results
    if (seo.faqs && seo.faqs.length > 0) {
      (jsonLdData['@graph'] as Record<string, unknown>[]).push({
        '@type': 'FAQPage',
        'mainEntity': seo.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      });
    }

    jsonLdScript.textContent = JSON.stringify(jsonLdData);
  }, [currentPath]);

  return null;
};

export default SEOHead;
