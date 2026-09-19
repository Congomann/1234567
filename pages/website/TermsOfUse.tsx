import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const TermsOfUse: React.FC = () => {
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
            Website Terms & Conditions
          </h1>
          <p className="text-slate-500 font-medium">
            Effective Date: September 13, 2026<br/>
            Last Updated: September 13, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-12">
          
          <section>
            
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>Welcome to the website of New Holland Financial Group (“NHFG,” “we,” “us,” or “our”).</p>
              <p>These Terms & Conditions govern your use of our website and related online services. By accessing or using this website, you agree to these Terms & Conditions.</p>
              <p>If you do not agree with these terms, please discontinue use of the website.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">1. Use of the Website</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>You may use this website for lawful purposes and in accordance with these Terms & Conditions.</p>
              <p>You agree not to:</p>
              <p className="pl-4 border-l-2 border-blue-500">Use the website for unlawful purposes</p>
              <p className="pl-4 border-l-2 border-blue-500">Attempt to gain unauthorized access to our systems</p>
              <p className="pl-4 border-l-2 border-blue-500">Interfere with website functionality or security</p>
              <p className="pl-4 border-l-2 border-blue-500">Introduce malicious software or code</p>
              <p className="pl-4 border-l-2 border-blue-500">Attempt to access information belonging to another user</p>
              <p className="pl-4 border-l-2 border-blue-500">Copy or misuse website content</p>
              <p className="pl-4 border-l-2 border-blue-500">Use automated systems to access the website in a manner that could interfere with its operation</p>
              <p className="pl-4 border-l-2 border-blue-500">Misrepresent your identity or relationship with NHFG</p>
              <p className="pl-4 border-l-2 border-blue-500">Use the website in a manner that violates applicable law</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">2. Informational Purposes</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>Information provided on this website is for general informational purposes.</p>
              <p>Website content does not constitute an offer, solicitation, guarantee, or recommendation to purchase any insurance or financial product unless expressly stated otherwise.</p>
              <p>Availability of products and services may vary based on individual circumstances, state requirements, carrier requirements, licensing, and other factors.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">3. Insurance Applications</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>NHFG may assist with the completion and submission of insurance applications.</p>
              <p>NHFG does not underwrite insurance policies or make underwriting decisions.</p>
              <p>Insurance carriers are responsible for reviewing applications, conducting underwriting, determining eligibility, and deciding whether to issue coverage.</p>
              <p>Submitting information through NHFG does not guarantee approval or issuance of an insurance policy.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">4. User-Submitted Information</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>If you submit information through our website, you represent that the information you provide is accurate and that you are authorized to provide it.</p>
              <p>You should not submit another person's personal or confidential information without appropriate authorization.</p>
              <p>For information about how we collect, use, and protect personal information, please review our Privacy Policy.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">5. Intellectual Property</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>Unless otherwise indicated, website content—including text, graphics, logos, images, designs, software, and other materials—is owned by or licensed to NHFG and is protected by applicable intellectual-property laws.</p>
              <p>You may not reproduce, distribute, modify, publish, transmit, sell, or commercially exploit website content without prior written permission.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">6. Third-Party Links</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>Our website may contain links to third-party websites or services.</p>
              <p>These links are provided for convenience and do not necessarily constitute an endorsement or recommendation.</p>
              <p>NHFG does not control third-party websites and is not responsible for their content, availability, security, privacy practices, or terms.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">7. No Guarantee</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>We do not guarantee that:</p>
              <p className="pl-4 border-l-2 border-blue-500">Website information will always be complete or accurate</p>
              <p className="pl-4 border-l-2 border-blue-500">The website will always be available</p>
              <p className="pl-4 border-l-2 border-blue-500">Website functionality will be uninterrupted</p>
              <p className="pl-4 border-l-2 border-blue-500">The website will be free of errors or harmful components</p>
              <p className="pl-4 border-l-2 border-blue-500">Any particular insurance or financial product will be available</p>
              <p className="pl-4 border-l-2 border-blue-500">Any insurance application will be approved</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">8. Limitation of Liability</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>To the extent permitted by law, NHFG will not be liable for indirect, incidental, consequential, special, or other damages arising from your use of or inability to use the website or information contained on it.</p>
              <p>Nothing in these Terms & Conditions is intended to exclude liability that cannot legally be excluded under applicable law.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">9. Changes to These Terms</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>We may update these Terms & Conditions from time to time.</p>
              <p>Updated terms will be posted on this website with a revised “Last Updated” date.</p>
              <p>Your continued use of the website after changes are posted constitutes acceptance of the updated terms to the extent permitted by law.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">10. Governing Law</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>These Terms & Conditions shall be governed by applicable laws of the State of Iowa, without regard to conflict-of-law principles, except to the extent applicable law requires otherwise.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">11. Contact</h2>
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
