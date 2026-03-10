import React from 'react';
import { useData } from '../context/DataContext';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { companySettings } = useData();

  if (!companySettings) {
    return <>{children}</>;
  }

  const primary = companySettings.themePrimaryColor || '#2563EB'; // default blue-600 equivalent
  const secondary = companySettings.themeSecondaryColor || '#0B2240'; // default navy
  const structure = companySettings.themeStructure || 'default';

  const customCSS = `
    :root {
      --color-primary: ${primary};
      --color-secondary: ${secondary};
    }
    
    /* Global Primary Overrides (replacing standard blue accents) */
    .bg-blue-600, .hover\\:bg-blue-600:hover, .bg-\\[\\#0A62A7\\] { background-color: var(--color-primary) !important; }
    .text-blue-600, .hover\\:text-blue-600:hover, .group-hover\\:text-blue-600:hover { color: var(--color-primary) !important; }
    .border-blue-600 { border-color: var(--color-primary) !important; }
    .ring-blue-600, .focus\\:ring-\\[\\#0A62A7\\]:focus { --tw-ring-color: var(--color-primary) !important; }
    
    .from-blue-700 { --tw-gradient-from: var(--color-primary) var(--tw-gradient-from-position) !important; --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
    .text-blue-700 { color: var(--color-primary) !important; }
    .bg-blue-700, .hover\\:bg-blue-700:hover { background-color: var(--color-primary) !important; }
    .bg-blue-50 { background-color: color-mix(in srgb, var(--color-primary) 10%, transparent) !important; }

    /* Global Secondary Overrides (replacing dark navy blocks like Footer, NavBar, Hero gradient) */
    .bg-\\[\\#0B2240\\] { background-color: var(--color-secondary) !important; }
    .text-\\[\\#0B2240\\] { color: var(--color-secondary) !important; }
    .border-\\[\\#0B2240\\] { border-color: var(--color-secondary) !important; }

    /* Structural Theme Variations */
    ${structure === 'modern' ? `
      /* Modern theme structure: pill shapes, extreme soft rounded corners everywhere, slight drop shadows */
      .rounded-xl, .rounded-2xl, .rounded-3xl, .rounded-lg { border-radius: 2rem !important; }
      .shadow-sm { box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1) !important; }
    ` : ''}

    ${structure === 'minimal' ? `
      /* Minimal theme structure: completely sharp boxes, flat UI, wireframe style borders */
      .rounded-xl, .rounded-2xl, .rounded-3xl, .rounded-lg, .rounded-full, .rounded-md { border-radius: 0px !important; }
      .shadow-md, .shadow-xl, .shadow-sm, .shadow-lg { box-shadow: none !important; }
      .border { border-width: 1px !important; }
    ` : ''}
    
    ${structure === 'bold' ? `
      /* Bold theme structure: thick brutalist borders, extra padding, strong black shadows */
      .border, .border-b, .border-t { border-width: 3px !important; border-color: #000 !important; }
      .rounded-xl, .rounded-2xl, .rounded-3xl, .rounded-lg { border-radius: 4px !important; }
      .shadow-sm, .shadow-md, .shadow-xl, .shadow-lg { box-shadow: 6px 6px 0px 0px rgba(0,0,0,1) !important; }
      button, .font-bold { font-weight: 900 !important; letter-spacing: -0.05em !important; }
      h1, h2, h3 { font-weight: 900 !important; letter-spacing: -0.05em !important; text-transform: uppercase !important; }
    ` : ''}

    ${structure === 'ios' ? `
      /* Apple iOS 26 Glassmorphism: heavy blurs, translucent white backgrounds, large border radius */
      body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Arial, sans-serif !important; }
      .bg-white { background-color: rgba(255, 255, 255, 0.65) !important; backdrop-filter: blur(30px) saturate(180%) !important; -webkit-backdrop-filter: blur(30px) saturate(180%) !important; }
      .rounded-xl, .rounded-2xl, .rounded-3xl, .rounded-lg { border-radius: 20px !important; }
      .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl { box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07) !important; }
      .border-slate-100, .border { border-color: rgba(255, 255, 255, 0.3) !important; border-width: 1px !important; }
      button { font-weight: 600 !important; letter-spacing: -0.02em !important; }
    ` : ''}

    ${structure === 'macos' ? `
      /* macOS Sequoia: subtle structured shadows, distinct crisp borders, standard radiuses */
      body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif !important; }
      .rounded-xl, .rounded-2xl, .rounded-3xl, .rounded-lg { border-radius: 12px !important; }
      .shadow-sm, .shadow-md, .shadow-xl, .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255,255,255,0.7) !important; }
      .bg-white { background-color: #ffffff !important; }
      .border { border-color: rgba(0,0,0,0.1) !important; }
    ` : ''}

    ${structure === 'material' ? `
      /* Google Material You: completely flat, heavily rounded pill shapes, off-white backgrounds */
      body { font-family: 'Roboto', 'Inter', sans-serif !important; }
      .rounded-xl, .rounded-2xl, .rounded-3xl, .rounded-lg { border-radius: 28px !important; }
      .shadow-sm, .shadow-md, .shadow-xl, .shadow-lg { box-shadow: none !important; }
      .border { border-width: 0 !important; }
      .bg-white { background-color: #fef7ff !important; } /* M3 tonal surface */
      .bg-slate-50 { background-color: #f3edf7 !important; }
      button { border-radius: 100px !important; text-transform: none !important; font-weight: 500 !important; }
    ` : ''}

    ${structure === 'neumorphic' ? `
      /* Neumorphism Soft UI: drop shadows mimic extrusion from background, no borders */
      .bg-white, .bg-slate-50, body { background-color: #e0e5ec !important; }
      .shadow-sm, .shadow-md, .shadow-xl, .shadow-lg { 
        box-shadow: 9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5) !important; 
      }
      .bg-white:active, button:active {
        box-shadow: inset 6px 6px 12px rgba(163,177,198,0.6), inset -6px -6px 12px rgba(255,255,255, 0.5) !important;
      }
      .border { border-width: 0 !important; }
      .rounded-xl, .rounded-2xl, .rounded-3xl, .rounded-lg { border-radius: 30px !important; }
    ` : ''}
  `;

  return (
    <>
      <style>{customCSS}</style>
      {children}
    </>
  );
};
