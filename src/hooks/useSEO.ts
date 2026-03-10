
import { useEffect } from 'react';

interface UseSEOOptions {
  title: string;
  description?: string;
  canonicalPath?: string;
  structuredData?: Record<string, any> | Record<string, any>[];
}

export function useSEO({ title, description, canonicalPath, structuredData }: UseSEOOptions) {
  useEffect(() => {
    // Title tag (max ~60 chars)
    const trimmedTitle = title.length > 60 ? `${title.slice(0, 57)}...` : title;
    document.title = trimmedTitle;

    // Meta description (max ~160 chars)
    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      const descValue = description.length > 160 ? `${description.slice(0, 157)}...` : description;
      if (metaDesc) {
        metaDesc.content = descValue;
      } else {
        const m = document.createElement('meta');
        m.name = 'description';
        m.content = descValue;
        document.head.appendChild(m);
      }
    }

    // Canonical tag
    if (canonicalPath) {
      const canonicalHref = `${window.location.origin}${canonicalPath}`;
      let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalHref);
    }

    // Structured data (JSON-LD)
    const scriptId = structuredData ? `jsonld-${(canonicalPath || title).replace(/[^a-z0-9]/gi, '-')}` : undefined;
    if (scriptId) {
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = scriptId;
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(structuredData);
    }

    // No cleanup for meta/canonical (they can stay). Cleanup JSON-LD if needed on unmount/change.
    return () => {
      if (scriptId) {
        const existing = document.getElementById(scriptId);
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
      }
    };
  }, [title, description, canonicalPath, JSON.stringify(structuredData)]);
}
