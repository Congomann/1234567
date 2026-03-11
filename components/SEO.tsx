
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
  }
};

export const SEO: React.FC<SEOProps> = ({ title, description }) => {
  const location = useLocation();

  useEffect(() => {
    const config = NHFG_SEO_CONFIG[location.pathname] || NHFG_SEO_CONFIG['/'];
    
    // Update Title
    const finalTitle = title || config.title;
    document.title = finalTitle;

    // Update Meta Description
    const finalDescription = description || config.description;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', finalDescription);
    }

    // Update OG Title/Description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', finalTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', finalDescription);

  }, [location.pathname, title, description]);

  return null; // This component doesn't render anything
};
