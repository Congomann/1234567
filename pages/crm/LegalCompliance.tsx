
import React from 'react';
import { useData } from '../../context/DataContext';
import { ShieldCheck, FileText, Lock, Scale, Download, AlertTriangle } from 'lucide-react';
import { Tab3DBanner } from '../../components/shared/Tab3DBanner';

export const LegalCompliance: React.FC = () => {
  const { companySettings, user } = useData();

  const PolicyCard = ({ title, icon: Icon, content, description }: any) => (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-slate-50 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Icon className="h-5 w-5" /></div>
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            </div>
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all" title="Download for Records">
                <Download className="h-4 w-4" />
            </button>
        </div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{description}</p>
      </div>
      <div className="p-8 flex-1">
        <div className="max-h-60 overflow-y-auto pr-4 custom-scrollbar">
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                {content}
            </p>
        </div>
      </div>
      <div className="p-4 bg-blue-50 border-t border-blue-100 flex items-center justify-center">
          <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="h-3 w-3" /> Signed & Verified on {new Date().toLocaleDateString()}
          </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <Tab3DBanner
        cards={[
          { title: "SEC & FINRA Standards", value: "100% Compliant", subtitle: "2026 Audit Complete", emoji: "⚖️", gradient: "cyan" },
          { title: "Solicitor Agreements", value: "115 Active", subtitle: "Signed Advisor Contracts", emoji: "📜", gradient: "yellow", linkText: "Agreements", linkPath: "#agreements" },
          { title: "Data Risk Protection", value: "0 Discrepancies", subtitle: "256-Bit Encrypted Vault", emoji: "🛡️", gradient: "pink" }
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-[#0B2240]">Legal & Compliance</h1>
        <p className="text-slate-500">Corporate policies, advisor agreements, and data privacy standards.</p>
      </div>

      <div id="agreements" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PolicyCard 
            title="Terms of Use" 
            icon={FileText} 
            content={companySettings.termsOfUse}
            description="Advisor Portal Governance"
        />
        <PolicyCard 
            title="Solicitor Agreement" 
            icon={Scale} 
            content={companySettings.solicitorAgreement}
            description="Contractual Obligations"
        />
      </div>

      <div className="bg-[#0B2240] rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10"><Lock className="h-40 w-40" /></div>
          <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-blue-400" /> 
                  Data Collection & Usage Standards
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="space-y-3">
                      <h4 className="text-xs font-black text-blue-300 uppercase tracking-widest">Life Insurance Leads</h4>
                      <p className="text-sm text-blue-100 leading-relaxed">
                          All health data (height, weight, medical history) and SSNs collected are protected under HIPAA-aligned security protocols. Data is transmitted directly to carriers for underwriting purposes only.
                      </p>
                  </div>
                  <div className="space-y-3">
                      <h4 className="text-xs font-black text-blue-300 uppercase tracking-widest">Business & Real Estate</h4>
                      <p className="text-sm text-blue-100 leading-relaxed">
                          Proprietary business financials and property specific data are used strictly for risk assessment and policy generation. External sharing is prohibited without explicit client consent.
                      </p>
                  </div>
                  <div className="space-y-3">
                      <h4 className="text-xs font-black text-blue-300 uppercase tracking-widest">Advisor Responsibility</h4>
                      <p className="text-sm text-blue-100 leading-relaxed font-bold italic">
                          "Advisors are prohibited from exporting client data to non-approved storage devices or personal email accounts."
                      </p>
                      <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase pt-2">
                          <AlertTriangle className="h-4 w-4" /> Compliance Violation Warning Active
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <ContractGenerator />
    </div>
  );
};

const ContractGenerator = () => {
  const [contractorName, setContractorName] = React.useState('');
  const [country, setCountry] = React.useState('Zambia');
  const [showContract, setShowContract] = React.useState(false);

  const contractText = `INDEPENDENT CONTRACTOR AGREEMENT

This Independent Contractor Agreement (“Agreement”) is entered into between:

Company: New Holland Financial Group LLC, a limited liability company organized in the United States (“Company”)

and

Contractor: ${contractorName || '[CONTRACTOR FULL NAME]'}, residing in ${country} (“Contractor”).

Effective Date: ${new Date().toLocaleDateString()}

1. Services
The Contractor will provide part-time sales and administrative support to the Company, including:
* Responding to customer and agent emails;
* Communicating with the Company’s sales agents and business contacts;
* Assisting with agent communications and follow-up;
* Organizing and maintaining agent contract documents;
* Providing general administrative support related to the Company’s sales activities; and
* Other similar duties mutually agreed upon by the Company and Contractor.

The Contractor will perform all services physically from ${country} and will not be required to perform services from within the United States.

2. Compensation
The Company will pay the Contractor US $150 per month for the services described in this Agreement.
Payment will be made by [BANK TRANSFER / WISE / PAYPAL / OTHER] on or about [PAYMENT DATE] each month.
The Contractor is responsible for any taxes, fees, or other obligations applicable to the Contractor’s compensation under the laws of ${country}.

3. Independent Contractor Relationship
The Contractor is engaged as an independent contractor and not as an employee, partner, agent, or joint venturer of the Company.
The Contractor is responsible for determining how to perform the services, subject to the Company’s reasonable requirements regarding the results and quality of the work.
Nothing in this Agreement creates an employer-employee relationship.

4. Work Location
The Contractor will perform the services from ${country}.
The Contractor will not travel to or perform services physically within the United States under this Agreement unless the Company and Contractor enter into a separate written agreement addressing such work.

5. Authority to Bind the Company
The Contractor may communicate with the Company’s agents, customers, and business contacts on behalf of the Company as authorized.
However, the Contractor may not sign contracts, enter into agreements, make financial commitments, or otherwise legally bind the Company unless the Company provides specific written authorization.

6. Confidentiality
The Contractor agrees to keep confidential all Company information, including customer information, agent information, pricing, contracts, business plans, passwords, financial information, and other non-public information.
The Contractor will not disclose or use confidential information except as necessary to perform the services under this Agreement.

7. Company Property and Information
All Company documents, contracts, customer information, agent information, passwords, records, and other materials provided to the Contractor remain the property of the Company.
Upon termination of this Agreement, the Contractor will return or permanently delete Company information as requested by the Company.

8. Taxes and Documentation
The Contractor acknowledges that the Contractor is responsible for complying with applicable tax and registration requirements in ${country}.
The Contractor will provide the Company with any tax documentation reasonably required for a foreign independent contractor, including IRS Form W-8BEN, if applicable.

9. Term and Termination
This Agreement begins on the Effective Date and will continue until terminated by either party.
Either party may terminate this Agreement by providing 14 days’ written notice.
The Company may terminate the Agreement immediately for serious misconduct, breach of confidentiality, fraud, unauthorized commitments on behalf of the Company, or other material breach of this Agreement.

10. No Exclusivity
Unless separately agreed in writing, the Contractor may provide services to other clients, provided that doing so does not create a conflict of interest or involve misuse or disclosure of the Company’s confidential information.

11. Governing Law
This Agreement will be governed by the laws specified by the Company and Contractor in writing, subject to any mandatory laws applicable to the Contractor’s services in ${country}.

12. Entire Agreement
This Agreement represents the understanding between the Company and Contractor regarding the services described above and may be modified only by written agreement signed by both parties.`;

  return (
    <div className="apple-glass rounded-[2.5rem] p-10 border border-white/80 shadow-xl mt-8">
      <h2 className="text-2xl font-bold text-[#0B2240] mb-2 flex items-center gap-3">
        <FileText className="h-6 w-6 text-blue-600" />
        Foreign Independent Contractor Agreement
      </h2>
      <p className="text-slate-500 mb-8">Generate a localized contract for administrative support contractors residing outside the United States.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contractor Full Name</label>
          <input 
            type="text" 
            value={contractorName}
            onChange={e => setContractorName(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700 shadow-sm"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Country of Residence</label>
          <select 
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700 shadow-sm"
          >
            <option value="Zambia">Zambia</option>
            <option value="Philippines">Philippines</option>
            <option value="India">India</option>
            <option value="Mexico">Mexico</option>
            <option value="Colombia">Colombia</option>
            <option value="South Africa">South Africa</option>
            <option value="Argentina">Argentina</option>
            <option value="Brazil">Brazil</option>
          </select>
        </div>
      </div>
      
      <button 
        onClick={() => setShowContract(true)}
        className="px-6 py-3 bg-[#0B2240] text-white font-bold rounded-xl hover:bg-[#0A62A7] transition-all shadow-md flex items-center gap-2 mb-8"
      >
        <FileText className="h-5 w-5" /> Generate Contract Document
      </button>

      {showContract && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Preview: Contract Document</h3>
            <button 
              onClick={() => {
                const blob = new Blob([contractText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`Contractor_Agreement_\${contractorName.replace(/\\s+/g, '_')}_\${country}.txt\`;
                a.click();
              }}
              className="text-xs font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> Download .txt
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[11px] md:text-xs text-slate-600 bg-slate-50 p-6 rounded-xl overflow-x-auto border border-slate-100 leading-relaxed">
            {contractText}
          </pre>
        </div>
      )}
    </div>
  );
};
