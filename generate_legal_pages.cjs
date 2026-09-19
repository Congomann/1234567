const fs = require('fs');

function createPage(componentName, title, date, sections) {
  let sectionsHtml = sections.map((sec, i) => {
    let titleHtml = sec.title ? '<h2 className="text-2xl font-bold text-[#0B2240] mb-4">' + sec.title + '</h2>' : '';
    let paragraphsHtml = sec.paragraphs.map(p => {
      if (p.startsWith('- ')) {
         return '<p className="pl-4 border-l-2 border-blue-500">' + p.substring(2) + '</p>';
      }
      if (p.includes('<a ') || p.includes('<br/>') || p.includes('**')) {
        let text = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return '<p dangerouslySetInnerHTML={{ __html: `' + text + '` }}></p>';
      }
      return '<p>' + p + '</p>';
    }).join('\n              ');
    
    return `
          <section>
            ${titleHtml}
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              ${paragraphsHtml}
            </div>
          </section>
    `;
  }).join('');

  return `import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const ${componentName}: React.FC = () => {
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
            ${title}
          </h1>
          <p className="text-slate-500 font-medium">
            Effective Date: ${date}<br/>
            Last Updated: ${date}
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-12">
          ${sectionsHtml}
        </div>
      </div>
    </div>
  );
};
`;
}

const termsSections = [
  {
    title: "",
    paragraphs: [
      "Welcome to the website of New Holland Financial Group (“NHFG,” “we,” “us,” or “our”).",
      "These Terms & Conditions govern your use of our website and related online services. By accessing or using this website, you agree to these Terms & Conditions.",
      "If you do not agree with these terms, please discontinue use of the website."
    ]
  },
  {
    title: "1. Use of the Website",
    paragraphs: [
      "You may use this website for lawful purposes and in accordance with these Terms & Conditions.",
      "You agree not to:",
      "- Use the website for unlawful purposes",
      "- Attempt to gain unauthorized access to our systems",
      "- Interfere with website functionality or security",
      "- Introduce malicious software or code",
      "- Attempt to access information belonging to another user",
      "- Copy or misuse website content",
      "- Use automated systems to access the website in a manner that could interfere with its operation",
      "- Misrepresent your identity or relationship with NHFG",
      "- Use the website in a manner that violates applicable law"
    ]
  },
  {
    title: "2. Informational Purposes",
    paragraphs: [
      "Information provided on this website is for general informational purposes.",
      "Website content does not constitute an offer, solicitation, guarantee, or recommendation to purchase any insurance or financial product unless expressly stated otherwise.",
      "Availability of products and services may vary based on individual circumstances, state requirements, carrier requirements, licensing, and other factors."
    ]
  },
  {
    title: "3. Insurance Applications",
    paragraphs: [
      "NHFG may assist with the completion and submission of insurance applications.",
      "NHFG does not underwrite insurance policies or make underwriting decisions.",
      "Insurance carriers are responsible for reviewing applications, conducting underwriting, determining eligibility, and deciding whether to issue coverage.",
      "Submitting information through NHFG does not guarantee approval or issuance of an insurance policy."
    ]
  },
  {
    title: "4. User-Submitted Information",
    paragraphs: [
      "If you submit information through our website, you represent that the information you provide is accurate and that you are authorized to provide it.",
      "You should not submit another person's personal or confidential information without appropriate authorization.",
      "For information about how we collect, use, and protect personal information, please review our Privacy Policy."
    ]
  },
  {
    title: "5. Intellectual Property",
    paragraphs: [
      "Unless otherwise indicated, website content—including text, graphics, logos, images, designs, software, and other materials—is owned by or licensed to NHFG and is protected by applicable intellectual-property laws.",
      "You may not reproduce, distribute, modify, publish, transmit, sell, or commercially exploit website content without prior written permission."
    ]
  },
  {
    title: "6. Third-Party Links",
    paragraphs: [
      "Our website may contain links to third-party websites or services.",
      "These links are provided for convenience and do not necessarily constitute an endorsement or recommendation.",
      "NHFG does not control third-party websites and is not responsible for their content, availability, security, privacy practices, or terms."
    ]
  },
  {
    title: "7. No Guarantee",
    paragraphs: [
      "We do not guarantee that:",
      "- Website information will always be complete or accurate",
      "- The website will always be available",
      "- Website functionality will be uninterrupted",
      "- The website will be free of errors or harmful components",
      "- Any particular insurance or financial product will be available",
      "- Any insurance application will be approved"
    ]
  },
  {
    title: "8. Limitation of Liability",
    paragraphs: [
      "To the extent permitted by law, NHFG will not be liable for indirect, incidental, consequential, special, or other damages arising from your use of or inability to use the website or information contained on it.",
      "Nothing in these Terms & Conditions is intended to exclude liability that cannot legally be excluded under applicable law."
    ]
  },
  {
    title: "9. Changes to These Terms",
    paragraphs: [
      "We may update these Terms & Conditions from time to time.",
      "Updated terms will be posted on this website with a revised “Last Updated” date.",
      "Your continued use of the website after changes are posted constitutes acceptance of the updated terms to the extent permitted by law."
    ]
  },
  {
    title: "10. Governing Law",
    paragraphs: [
      "These Terms & Conditions shall be governed by applicable laws of the State of Iowa, without regard to conflict-of-law principles, except to the extent applicable law requires otherwise."
    ]
  },
  {
    title: "11. Contact",
    paragraphs: [
      "New Holland Financial Group",
      "Des Moines, Iowa",
      "515-318-7450",
      "<a href='mailto:info@newhollandfinancial.com' className='text-blue-600 hover:underline'>info@newhollandfinancial.com</a>"
    ]
  }
];

fs.writeFileSync('pages/website/TermsOfUse.tsx', createPage('TermsOfUse', 'Website Terms & Conditions', 'September 13, 2026', termsSections));


const disclaimerSections = [
  {
    title: "",
    paragraphs: [
      "The information provided on the New Holland Financial Group (“NHFG,” “we,” “us,” or “our”) website is provided for general informational purposes only.",
      "Use of this website does not create an insurance, financial advisory, fiduciary, professional, or client relationship between you and New Holland Financial Group unless expressly established through a separate written agreement."
    ]
  },
  {
    title: "Insurance Applications and Underwriting",
    paragraphs: [
      "New Holland Financial Group may assist individuals and financial professionals with insurance applications and related administrative processes.",
      "NHFG does not underwrite insurance policies and does not make underwriting decisions.",
      "NHFG does not determine:",
      "- Whether an individual is insurable",
      "- Whether an application is approved or declined",
      "- Underwriting classifications",
      "- Risk classifications",
      "- Premium rates",
      "- Policy terms or conditions",
      "- Policy exclusions",
      "- Whether an insurance policy will be issued",
      "These decisions are made by the applicable insurance carrier and its authorized underwriting personnel.",
      "NHFG may collect information from an applicant and submit that information to the applicable insurance carrier as part of the application process.",
      "The carrier may request additional information, conduct its own underwriting review, and make an independent determination regarding the application."
    ]
  },
  {
    title: "No Guarantee of Coverage",
    paragraphs: [
      "Submitting an insurance application through NHFG does not guarantee that coverage will be approved or issued.",
      "Insurance coverage is subject to the terms, conditions, requirements, and underwriting guidelines of the applicable insurance carrier.",
      "No statement made through this website should be interpreted as a guarantee that an insurance application will be approved or that coverage will be issued."
    ]
  },
  {
    title: "Financial and Insurance Information",
    paragraphs: [
      "Information presented on this website is general in nature and may not be appropriate for every individual or situation.",
      "Insurance and financial decisions should be based on your individual circumstances and, where appropriate, discussed with a qualified financial or insurance professional.",
      "Information on this website should not be considered a recommendation to purchase or sell any particular insurance product, security, investment, or financial product."
    ]
  },
  {
    title: "Advisor Relationships",
    paragraphs: [
      "New Holland Financial Group may provide technology, resources, administrative support, and other services to financial professionals and advisors.",
      "Individual advisors and financial professionals may have their own businesses, licenses, registrations, professional obligations, and privacy policies.",
      "The relationship between you and an individual advisor may be governed by separate agreements and disclosures."
    ]
  },
  {
    title: "Third-Party Information",
    paragraphs: [
      "Our website may contain information, references, or links to third-party companies, insurance carriers, financial institutions, technology providers, or other organizations.",
      "NHFG does not control third-party websites or services and is not responsible for their content, privacy practices, security, availability, or policies.",
      "You should review the applicable terms, privacy policies, and disclosures of third-party providers before using their services or submitting information."
    ]
  },
  {
    title: "No Legal, Tax, or Accounting Advice",
    paragraphs: [
      "Nothing on this website constitutes legal, tax, accounting, or other professional advice.",
      "You should consult an appropriately qualified professional regarding your individual circumstances."
    ]
  },
  {
    title: "Accuracy of Information",
    paragraphs: [
      "We make reasonable efforts to maintain accurate and current information on our website. However, we do not warrant that all information is complete, accurate, current, or free from errors or omissions.",
      "Information may change without notice."
    ]
  },
  {
    title: "Website Availability",
    paragraphs: [
      "We do not guarantee that the website will always be available, uninterrupted, secure, or free of errors.",
      "We may modify, suspend, or discontinue portions of the website or its functionality at any time."
    ]
  },
  {
    title: "Limitation of Liability",
    paragraphs: [
      "To the extent permitted by applicable law, NHFG shall not be responsible for losses or damages arising from reliance on information presented on this website or from the use or inability to use the website or third-party websites linked from it."
    ]
  },
  {
    title: "Contact",
    paragraphs: [
      "New Holland Financial Group",
      "Des Moines, Iowa",
      "515-318-7450",
      "<a href='mailto:info@newhollandfinancial.com' className='text-blue-600 hover:underline'>info@newhollandfinancial.com</a>"
    ]
  }
];

fs.writeFileSync('pages/website/Disclaimer.tsx', createPage('Disclaimer', 'Website Disclaimer', 'September 13, 2026', disclaimerSections));


const cookieSections = [
  {
    title: "",
    paragraphs: [
      "New Holland Financial Group (“NHFG,” “we,” “us,” or “our”) may use cookies and similar technologies on our website to provide functionality, improve website performance, understand website usage, and maintain security."
    ]
  },
  {
    title: "What Are Cookies?",
    paragraphs: [
      "Cookies are small text files that may be stored on your device when you visit a website.",
      "Cookies can allow a website to recognize your browser and remember certain information."
    ]
  },
  {
    title: "How We May Use Cookies",
    paragraphs: [
      "We may use cookies and similar technologies for purposes including:",
      "- Website functionality",
      "- Security",
      "- Session management",
      "- Remembering preferences",
      "- Website analytics",
      "- Performance monitoring",
      "- Understanding how visitors use our website",
      "- Improving website content and functionality",
      "- Troubleshooting technical issues"
    ]
  },
  {
    title: "Types of Cookies",
    paragraphs: [
      "**Essential Cookies**",
      "These cookies may be necessary for the website to operate properly.",
      "They may support functions such as security, navigation, forms, authentication, or other essential website functionality.",
      "<br/>",
      "**Analytics Cookies**",
      "We may use analytics technologies to understand how visitors interact with our website.",
      "Analytics information may help us understand:",
      "- Which pages are visited",
      "- How visitors navigate the website",
      "- How long visitors remain on pages",
      "- General website traffic patterns",
      "- Website performance",
      "<br/>",
      "**Preference Cookies**",
      "Certain cookies may allow the website to remember preferences or settings."
    ]
  },
  {
    title: "Third-Party Technologies",
    paragraphs: [
      "We may use third-party providers for website hosting, analytics, security, communications, or other website-related functions.",
      "Those providers may use cookies or similar technologies subject to their own privacy policies."
    ]
  },
  {
    title: "Managing Cookies",
    paragraphs: [
      "Most web browsers allow you to control or disable cookies through browser settings.",
      "If you disable certain cookies, some website features may not function properly.",
      "Where required by applicable law, NHFG may provide additional cookie controls or preference-management tools."
    ]
  },
  {
    title: "Changes to This Cookie Policy",
    paragraphs: [
      "We may update this Cookie Policy as our website, technologies, or legal requirements change.",
      "The “Last Updated” date will be revised when changes are made."
    ]
  },
  {
    title: "Contact",
    paragraphs: [
      "New Holland Financial Group",
      "Des Moines, Iowa",
      "515-318-7450",
      "<a href='mailto:info@newhollandfinancial.com' className='text-blue-600 hover:underline'>info@newhollandfinancial.com</a>"
    ]
  }
];

fs.writeFileSync('pages/website/CookiePolicy.tsx', createPage('CookiePolicy', 'Cookie Policy', 'September 13, 2026', cookieSections));
console.log('Created all three legal files.');
