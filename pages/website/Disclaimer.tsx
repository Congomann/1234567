import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const Disclaimer: React.FC = () => {
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
            Website Disclaimer
          </h1>
          <p className="text-slate-500 font-medium">
            Effective Date: September 13, 2026<br/>
            Last Updated: September 13, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-12">
          
          <section>
            
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>The information provided on the New Holland Financial Group (“NHFG,” “we,” “us,” or “our”) website is provided for general informational purposes only.</p>
              <p>Use of this website does not create an insurance, financial advisory, fiduciary, professional, or client relationship between you and New Holland Financial Group unless expressly established through a separate written agreement.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">Insurance Applications and Underwriting</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>New Holland Financial Group may assist individuals and financial professionals with insurance applications and related administrative processes.</p>
              <p>NHFG does not underwrite insurance policies and does not make underwriting decisions.</p>
              <p>NHFG does not determine:</p>
              <p className="pl-4 border-l-2 border-blue-500">Whether an individual is insurable</p>
              <p className="pl-4 border-l-2 border-blue-500">Whether an application is approved or declined</p>
              <p className="pl-4 border-l-2 border-blue-500">Underwriting classifications</p>
              <p className="pl-4 border-l-2 border-blue-500">Risk classifications</p>
              <p className="pl-4 border-l-2 border-blue-500">Premium rates</p>
              <p className="pl-4 border-l-2 border-blue-500">Policy terms or conditions</p>
              <p className="pl-4 border-l-2 border-blue-500">Policy exclusions</p>
              <p className="pl-4 border-l-2 border-blue-500">Whether an insurance policy will be issued</p>
              <p>These decisions are made by the applicable insurance carrier and its authorized underwriting personnel.</p>
              <p>NHFG may collect information from an applicant and submit that information to the applicable insurance carrier as part of the application process.</p>
              <p>The carrier may request additional information, conduct its own underwriting review, and make an independent determination regarding the application.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">No Guarantee of Coverage</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>Submitting an insurance application through NHFG does not guarantee that coverage will be approved or issued.</p>
              <p>Insurance coverage is subject to the terms, conditions, requirements, and underwriting guidelines of the applicable insurance carrier.</p>
              <p>No statement made through this website should be interpreted as a guarantee that an insurance application will be approved or that coverage will be issued.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">Financial and Insurance Information</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>Information presented on this website is general in nature and may not be appropriate for every individual or situation.</p>
              <p>Insurance and financial decisions should be based on your individual circumstances and, where appropriate, discussed with a qualified financial or insurance professional.</p>
              <p>Information on this website should not be considered a recommendation to purchase or sell any particular insurance product, security, investment, or financial product.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">Advisor Relationships</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>New Holland Financial Group may provide technology, resources, administrative support, and other services to financial professionals and advisors.</p>
              <p>Individual advisors and financial professionals may have their own businesses, licenses, registrations, professional obligations, and privacy policies.</p>
              <p>The relationship between you and an individual advisor may be governed by separate agreements and disclosures.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">Third-Party Information</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>Our website may contain information, references, or links to third-party companies, insurance carriers, financial institutions, technology providers, or other organizations.</p>
              <p>NHFG does not control third-party websites or services and is not responsible for their content, privacy practices, security, availability, or policies.</p>
              <p>You should review the applicable terms, privacy policies, and disclosures of third-party providers before using their services or submitting information.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">No Legal, Tax, or Accounting Advice</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>Nothing on this website constitutes legal, tax, accounting, or other professional advice.</p>
              <p>You should consult an appropriately qualified professional regarding your individual circumstances.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">Accuracy of Information</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>We make reasonable efforts to maintain accurate and current information on our website. However, we do not warrant that all information is complete, accurate, current, or free from errors or omissions.</p>
              <p>Information may change without notice.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">Website Availability</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>We do not guarantee that the website will always be available, uninterrupted, secure, or free of errors.</p>
              <p>We may modify, suspend, or discontinue portions of the website or its functionality at any time.</p>
            </div>
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-[#0B2240] mb-4">Limitation of Liability</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>To the extent permitted by applicable law, NHFG shall not be responsible for losses or damages arising from reliance on information presented on this website or from the use or inability to use the website or third-party websites linked from it.</p>
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
