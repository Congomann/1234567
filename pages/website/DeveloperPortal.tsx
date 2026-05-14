import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Code2, 
  Terminal, 
  Database, 
  Zap, 
  Shield, 
  Key,
  CheckCircle2,
  Copy,
  Activity
} from "lucide-react";
import { SEO } from "../../components/SEO";

export const DeveloperPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quotes' | 'underwriting' | 'leads'>('quotes');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = {
    quotes: {
      title: 'Quoting Engine API',
      method: 'POST',
      url: '/api/v1/partners/quotes',
      description: 'Generate dynamic, real-time insurance premium quotes based on demographic and coverage parameters.',
      payload: `{
  "age": 35,
  "gender": "M",
  "tobacco": false,
  "coverageAmount": 500000,
  "type": "term"
}`,
      response: `{
  "success": true,
  "partner": "Acme InsurTech",
  "quote": {
    "coverageAmount": 500000,
    "type": "term",
    "estimatedMonthlyPremium": 26.25,
    "carriers": [
      { "name": "NHFG Premier", "monthly": 26.25 },
      { "name": "Standard Life Inc", "monthly": 30.19 }
    ]
  }
}`
    },
    underwriting: {
      title: 'Underwriting Data API',
      method: 'POST',
      url: '/api/v1/partners/underwriting',
      description: 'Submit basic health metrics to receive instant risk classification and underwriting pre-screening decisions.',
      payload: `{
  "heightInches": 72,
  "weightLbs": 190,
  "conditions": []
}`,
      response: `{
  "success": true,
  "data": {
    "bmi": "25.8",
    "riskClass": "Preferred Plus",
    "message": "Instant Approval",
    "instantDecision": true
  }
}`
    },
    leads: {
      title: 'Lead Ingestion Webhook',
      method: 'POST',
      url: '/api/v1/partners/leads',
      description: 'Push high-intent leads directly into the NHFG CRM distribution pipeline in real-time.',
      payload: `{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-0199",
  "intent": "life_insurance"
}`,
      response: `{
  "success": true,
  "message": "Lead successfully ingested into NHFG CRM",
  "leadId": "a1b2c3d4-e5f6..."
}`
    }
  };

  const activeDoc = endpoints[activeTab];

  return (
    <div className="bg-[#0B1120] min-h-screen font-sans text-slate-300">
      <SEO title="Developer API Portal | NHFG Technology" description="Integrate with New Holland Financial Group's proprietary Quoting Engines, Underwriting Data, and CRM APIs." />
      
      {/* 1. Header */}
      <header className="border-b border-white/10 bg-[#0B1120]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Code2 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none">NHFG Developers</h1>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">API Documentation</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/partnership" className="text-sm font-bold text-slate-400 hover:text-white transition-colors hidden sm:block">Partner with Us</Link>
            <button className="px-5 py-2.5 bg-white text-[#0B1120] rounded-lg font-bold text-sm hover:bg-slate-200 transition-all flex items-center gap-2">
              <Key size={16} /> Generate API Key
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
        
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
          Build the future of <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">insurance distribution.</span>
        </h2>
        <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed mb-10">
          Integrate directly with our proprietary tech stack. Access real-time quoting engines, instant underwriting APIs, and seamless CRM lead ingestion to power your InsurTech applications.
        </p>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-emerald-400">
            <Activity size={16} /> APIs Operational (99.99% Uptime)
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-blue-400">
            <Shield size={16} /> 256-bit TLS Encryption
          </div>
        </div>
      </div>

      {/* 3. API Documentation Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-2">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-3">Endpoints (v1)</h3>
            <button 
              onClick={() => setActiveTab('quotes')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'quotes' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <Zap size={16} /> Quoting Engine
            </button>
            <button 
              onClick={() => setActiveTab('underwriting')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'underwriting' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <Database size={16} /> Underwriting Data
            </button>
            <button 
              onClick={() => setActiveTab('leads')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'leads' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <Terminal size={16} /> Lead Ingestion
            </button>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-[#111827] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-black rounded-md tracking-wider">
                    {activeDoc.method}
                  </span>
                  <code className="text-slate-300 font-mono text-sm">{activeDoc.url}</code>
                </div>
                <h3 className="text-3xl font-black text-white mb-3">{activeDoc.title}</h3>
                <p className="text-slate-400">{activeDoc.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                {/* Request Payload */}
                <div className="p-8 bg-[#0B1120]/50">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Request Payload</h4>
                  <div className="relative group">
                    <pre className="bg-[#1A2234] p-5 rounded-xl text-sm text-emerald-300 font-mono overflow-x-auto border border-white/5">
                      <code>{activeDoc.payload}</code>
                    </pre>
                  </div>
                  
                  <div className="mt-8">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Authentication</h4>
                    <p className="text-sm text-slate-400 mb-2">Requires <code className="text-blue-400">x-api-key</code> in request headers.</p>
                  </div>
                </div>

                {/* Response Payload */}
                <div className="p-8 bg-[#0B1120]/50">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Successful Response (200 OK)</h4>
                  <div className="relative group">
                    <button 
                      onClick={() => handleCopy(activeDoc.response)}
                      className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 rounded-md text-slate-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                    <pre className="bg-[#1A2234] p-5 rounded-xl text-sm text-blue-300 font-mono overflow-x-auto border border-white/5">
                      <code>{activeDoc.response}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
