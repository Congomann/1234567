import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const CookiePolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen pt-40 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 font-bold text-sm mb-8 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#0B2240] tracking-tight mb-4">
            Cookie Policy
          </h1>
          <p className="text-slate-500 font-medium">
            Effective Date: September 13, 2026<br/>
            Last Updated: September 13, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-12">
          
          <section>
            
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>New Holland Financial Group (“NHFG,” “we,” “us,” or “our”) may use cookies and similar technologies on our website to provide functionality, improve website performance, understand website usage, and maintain security.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">What Are Cookies?</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>Cookies are small text files that may be stored on your device when you visit a website.</p>
              <p>Cookies can allow a website to recognize your browser and remember certain information.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">How We May Use Cookies</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>We may use cookies and similar technologies for purposes including:</p>
              <p className="pl-4 border-l-2 border-blue-500">Website functionality</p>
              <p className="pl-4 border-l-2 border-blue-500">Security</p>
              <p className="pl-4 border-l-2 border-blue-500">Session management</p>
              <p className="pl-4 border-l-2 border-blue-500">Remembering preferences</p>
              <p className="pl-4 border-l-2 border-blue-500">Website analytics</p>
              <p className="pl-4 border-l-2 border-blue-500">Performance monitoring</p>
              <p className="pl-4 border-l-2 border-blue-500">Understanding how visitors use our website</p>
              <p className="pl-4 border-l-2 border-blue-500">Improving website content and functionality</p>
              <p className="pl-4 border-l-2 border-blue-500">Troubleshooting technical issues</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">Types of Cookies</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p dangerouslySetInnerHTML={{ __html: `<strong>Essential Cookies</strong>` }}></p>
              <p>These cookies may be necessary for the website to operate properly.</p>
              <p>They may support functions such as security, navigation, forms, authentication, or other essential website functionality.</p>
              <p dangerouslySetInnerHTML={{ __html: `<br/>` }}></p>
              <p dangerouslySetInnerHTML={{ __html: `<strong>Analytics Cookies</strong>` }}></p>
              <p>We may use analytics technologies to understand how visitors interact with our website.</p>
              <p>Analytics information may help us understand:</p>
              <p className="pl-4 border-l-2 border-blue-500">Which pages are visited</p>
              <p className="pl-4 border-l-2 border-blue-500">How visitors navigate the website</p>
              <p className="pl-4 border-l-2 border-blue-500">How long visitors remain on pages</p>
              <p className="pl-4 border-l-2 border-blue-500">General website traffic patterns</p>
              <p className="pl-4 border-l-2 border-blue-500">Website performance</p>
              <p dangerouslySetInnerHTML={{ __html: `<br/>` }}></p>
              <p dangerouslySetInnerHTML={{ __html: `<strong>Preference Cookies</strong>` }}></p>
              <p>Certain cookies may allow the website to remember preferences or settings.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">Third-Party Technologies</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>We may use third-party providers for website hosting, analytics, security, communications, or other website-related functions.</p>
              <p>Those providers may use cookies or similar technologies subject to their own privacy policies.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">Managing Cookies</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>Most web browsers allow you to control or disable cookies through browser settings.</p>
              <p>If you disable certain cookies, some website features may not function properly.</p>
              <p>Where required by applicable law, NHFG may provide additional cookie controls or preference-management tools.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">Changes to This Cookie Policy</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>We may update this Cookie Policy as our website, technologies, or legal requirements change.</p>
              <p>The “Last Updated” date will be revised when changes are made.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">Contact</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>New Holland Financial Group</p>
              <p>Des Moines, Iowa</p>
              <p>515-318-7450</p>
              <p dangerouslySetInnerHTML={{ __html: `<a href='mailto:info@newhollandfinancial.com' className='text-blue-600 hover:underline'>info@newhollandfinancial.com</a>` }}></p>
            </div>
          </section>
    
        </div>
      </div>
    </div>
  );
};
