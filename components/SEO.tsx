
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
}

const NHFG_SEO_CONFIG: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'New Holland Financial Group | Premium Life Insurance & Real Estate',
    description: 'Protect your legacy with NHFG. Specializing in life insurance (fast approval, no medical questions), final expense, IUL, annuities, and real estate services in Alabama and nationwide.'
  },
  '/about': {
    title: 'About Us | New Holland Financial Group',
    description: 'Learn about the mission of NHFG to revolutionize the financial services industry through technology and elite advisor support.'
  },
  '/life-insurance': {
    title: 'Life Insurance Solutions | NHFG',
    description: 'Explore our comprehensive life insurance products and underwriting support for elite financial advisors.'
  },
  '/real-estate': {
    title: 'Real Estate & Mortgage Services | NHFG',
    description: 'State-of-the-art tools for real estate agents and mortgage brokers. Closing deals faster with NHFG.'
  },
  '/join': {
    title: 'Join Our Team | Advisor Onboarding',
    description: 'Start your journey with NHFG. Submit your application and join the premier network of financial advisors.'
  },
  '/contact': {
    title: 'Contact Us | New Holland Financial Group',
    description: 'Get in touch with the NHFG team for support, partnership opportunities, or general inquiries.'
  },
  '/advisors': {
    title: 'Expert Financial Advisors | New Holland Financial Group',
    description: 'Meet our team of licensed financial advisors specializing in life insurance, real estate, and investment strategies.'
  },
  '/group-benefits': {
    title: 'Group Benefits & Employee Insurance | NHFG',
    description: 'Comprehensive group benefits solutions for businesses, including health, dental, vision, and retirement programs.'
  },
  '/auto-insurance': {
    title: 'Auto & Commercial Vehicle Insurance | NHFG',
    description: 'Protect your vehicles with NHFG auto insurance. Coverage for personal cars, commercial fleets, and specialty vehicles.'
  },
  '/investments': {
    title: 'Investment Products & Wealth Management | NHFG',
    description: 'Grow and protect your wealth with our curated investment strategies, securities, and professional wealth management.'
  },
  '/securities': {
    title: 'Securities & Market Analysis | NHFG',
    description: 'Access advanced securities analysis and professional market insights from New Holland Financial Group.'
  }
};

export const SEO: React.FC<SEOProps> = ({ title, description }) => {
  const location = useLocation();

  useEffect(() => {
    const fetchLocalizedSEO = async (lat?: number, lon?: number) => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('q') || '';
        
        let url = `/api/seo/localize?q=${encodeURIComponent(query)}`;
        if (lat && lon) url += `&lat=${lat}&lon=${lon}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('SEO Localization failed');
        
        const data = await response.json();
        
        // --- Apply Metadata ---
        const finalTitle = title || data.title;
        const finalDescription = description || data.description;
        
        document.title = finalTitle;
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', finalDescription);
        }

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', finalTitle);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', finalDescription);

        // Update Keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords && data.keywords) {
          metaKeywords.setAttribute('content', data.keywords.join(', '));
        }

        // --- Canonical URL ---
        const primaryDomain = 'https://www.newhollandfinancial.com';
        const canonicalUrl = `${primaryDomain}${location.pathname}`;
        let canonicalTag = document.querySelector('link[rel="canonical"]');
        if (!canonicalTag) {
          canonicalTag = document.createElement('link');
          canonicalTag.setAttribute('rel', 'canonical');
          document.head.appendChild(canonicalTag);
        }
        canonicalTag.setAttribute('href', canonicalUrl);

      } catch (err) {
        const config = NHFG_SEO_CONFIG[location.pathname] || NHFG_SEO_CONFIG['/'];
        document.title = title || config.title;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', description || config.description);
        }
      }
    };

    // Try to get precise location first
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchLocalizedSEO(pos.coords.latitude, pos.coords.longitude),
        () => fetchLocalizedSEO(), // Fallback to IP if permission denied
        { timeout: 5000 }
      );
    } else {
      fetchLocalizedSEO();
    }

  }, [location.pathname, title, description]);

  return null;
};
