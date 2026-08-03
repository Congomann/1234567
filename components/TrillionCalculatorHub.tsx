import React, { useState, useMemo } from 'react';
import {
  Landmark,
  Building2,
  Shield,
  Truck,
  Calculator,
  TrendingUp,
  DollarSign,
  Percent,
  CheckCircle2,
  ArrowRight,
  PieChart,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';

export const TrillionCalculatorHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mortgage' | 'realestate' | 'iul' | 'logistics'>('mortgage');

  // 1. Mortgage State
  const [homePrice, setHomePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(6.25);
  const [loanTerm, setLoanTerm] = useState(30);

  const mortgageCalc = useMemo(() => {
    const principal = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = loanTerm * 12;
    if (monthlyRate === 0) return { monthlyPayment: principal / totalPayments, totalInterest: 0 };

    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    const totalCost = monthlyPayment * totalPayments;
    const totalInterest = totalCost - principal;
    return { monthlyPayment, totalInterest, principal };
  }, [homePrice, downPayment, interestRate, loanTerm]);

  // 2. Real Estate Investor State
  const [purchasePrice, setPurchasePrice] = useState(750000);
  const [monthlyRent, setMonthlyRent] = useState(5500);
  const [annualExpenses, setAnnualExpenses] = useState(18000);

  const reCalc = useMemo(() => {
    const grossAnnualIncome = monthlyRent * 12;
    const noi = grossAnnualIncome - annualExpenses;
    const capRate = (noi / purchasePrice) * 100;
    return { noi, capRate, grossAnnualIncome };
  }, [purchasePrice, monthlyRent, annualExpenses]);

  // 3. IUL Growth State
  const [monthlyPremium, setMonthlyPremium] = useState(500);
  const [currentAge, setCurrentAge] = useState(35);
  const [projectedReturn, setProjectedReturn] = useState(7.5);

  const iulCalc = useMemo(() => {
    const years = 65 - currentAge;
    let accumulatedCash = 0;
    const annualContrib = monthlyPremium * 12;
    for (let i = 0; i < Math.max(years, 1); i++) {
      accumulatedCash = (accumulatedCash + annualContrib) * (1 + projectedReturn / 100);
    }
    const deathBenefit = accumulatedCash * 1.75 + 250000;
    return { accumulatedCash, deathBenefit, totalContributions: annualContrib * Math.max(years, 1) };
  }, [monthlyPremium, currentAge, projectedReturn]);

  // 4. Logistics Freight State
  const [totalMiles, setTotalMiles] = useState(1200);
  const [ratePerMile, setRatePerMile] = useState(2.65);
  const [fuelSurcharge, setFuelSurcharge] = useState(0.45);

  const freightCalc = useMemo(() => {
    const baseFreight = totalMiles * ratePerMile;
    const totalFuel = totalMiles * fuelSurcharge;
    const totalGrossRate = baseFreight + totalFuel;
    return { baseFreight, totalFuel, totalGrossRate };
  }, [totalMiles, ratePerMile, fuelSurcharge]);

  return (
    <section className="py-24 bg-[#050A14] text-white font-sans relative overflow-hidden border-y border-white/10 selection:bg-blue-500/30">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
            <Calculator size={14} /> Institutional Financial Engine
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase mb-4">
            Precision Intelligence Suite
          </h2>
          <p className="text-slate-400 text-base font-medium leading-relaxed">
            Institutional-grade calculation engines for Mortgages, Real Estate Cap Rates, Indexed Universal Life, and Freight Dispatch Rates.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { id: 'mortgage', name: 'Mortgage Simulator', icon: Landmark },
            { id: 'realestate', name: 'Cap Rate Engine', icon: Building2 },
            { id: 'iul', name: 'IUL Accumulator', icon: Shield },
            { id: 'logistics', name: 'Freight Dispatcher', icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-105 border border-blue-400/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-blue-400'} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Calculator Display Panel */}
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 lg:p-12 shadow-2xl">
          {/* TAB 1: MORTGAGE SIMULATOR */}
          {activeTab === 'mortgage' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Landmark className="text-blue-400" /> Mortgage &amp; Loan Amortization
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                      <span>Home Purchase Price</span>
                      <span className="text-blue-400 font-black">${homePrice.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={100000}
                      max={2500000}
                      step={25000}
                      value={homePrice}
                      onChange={(e) => setHomePrice(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                      <span>Down Payment</span>
                      <span className="text-blue-400 font-black">${downPayment.toLocaleString()} ({Math.round((downPayment / homePrice) * 100)}%)</span>
                    </div>
                    <input
                      type="range"
                      min={10000}
                      max={homePrice * 0.5}
                      step={5000}
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Interest Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Term (Years)</label>
                      <select
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                      >
                        <option value={15}>15 Years Fixed</option>
                        <option value={30}>30 Years Fixed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-gradient-to-br from-blue-950/60 to-slate-950 p-8 rounded-3xl border border-blue-500/20 text-center lg:text-left space-y-6">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Estimated Payment Output</span>
                <div>
                  <span className="text-5xl font-black text-white tracking-tight">${Math.round(mortgageCalc.monthlyPayment).toLocaleString()}</span>
                  <span className="text-slate-400 text-sm font-bold block mt-1">/ month (Principal &amp; Interest)</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Loan Amount</span>
                    <span className="text-white font-bold text-sm">${(mortgageCalc.principal).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Total Interest Paid</span>
                    <span className="text-amber-400 font-bold text-sm">${Math.round(mortgageCalc.totalInterest).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REAL ESTATE CAP RATE */}
          {activeTab === 'realestate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Building2 className="text-blue-400" /> Commercial &amp; Residential Cap Rate Engine
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Property Purchase Price</label>
                    <input
                      type="number"
                      step="25000"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Monthly Gross Rent ($)</label>
                      <input
                        type="number"
                        step="250"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Annual Operating Exp ($)</label>
                      <input
                        type="number"
                        step="1000"
                        value={annualExpenses}
                        onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-gradient-to-br from-indigo-950/60 to-slate-950 p-8 rounded-3xl border border-indigo-500/20 text-center lg:text-left space-y-6">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Cap Rate &amp; Net Income Output</span>
                <div>
                  <span className="text-5xl font-black text-emerald-400 tracking-tight">{reCalc.capRate.toFixed(2)}%</span>
                  <span className="text-slate-400 text-sm font-bold block mt-1">Capitalization Rate</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Gross Annual Rent</span>
                    <span className="text-white font-bold text-sm">${reCalc.grossAnnualIncome.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Net Operating Income (NOI)</span>
                    <span className="text-emerald-400 font-bold text-sm">${reCalc.noi.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IUL ACCUMULATOR */}
          {activeTab === 'iul' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Shield className="text-blue-400" /> Indexed Universal Life (IUL) Growth
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Current Age</label>
                      <input
                        type="number"
                        value={currentAge}
                        onChange={(e) => setCurrentAge(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Monthly Premium ($)</label>
                      <input
                        type="number"
                        step="50"
                        value={monthlyPremium}
                        onChange={(e) => setMonthlyPremium(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Projected Index Return (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={projectedReturn}
                      onChange={(e) => setProjectedReturn(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-gradient-to-br from-emerald-950/60 to-slate-950 p-8 rounded-3xl border border-emerald-500/20 text-center lg:text-left space-y-6">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Projected Cash Value at Age 65</span>
                <div>
                  <span className="text-5xl font-black text-emerald-400 tracking-tight">${Math.round(iulCalc.accumulatedCash).toLocaleString()}</span>
                  <span className="text-slate-400 text-sm font-bold block mt-1">Tax-Deferred Cash Accumulation</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Total Premiums Paid</span>
                    <span className="text-white font-bold text-sm">${iulCalc.totalContributions.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Estimated Death Benefit</span>
                    <span className="text-amber-400 font-bold text-sm">${Math.round(iulCalc.deathBenefit).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FREIGHT DISPATCHER */}
          {activeTab === 'logistics' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Truck className="text-blue-400" /> Freight Dispatch &amp; Rate Estimator
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Route Miles</label>
                    <input
                      type="number"
                      step="50"
                      value={totalMiles}
                      onChange={(e) => setTotalMiles(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Linehaul Rate ($/mi)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={ratePerMile}
                        onChange={(e) => setRatePerMile(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fuel Surcharge ($/mi)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={fuelSurcharge}
                        onChange={(e) => setFuelSurcharge(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-gradient-to-br from-amber-950/60 to-slate-950 p-8 rounded-3xl border border-amber-500/20 text-center lg:text-left space-y-6">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Estimated Gross Dispatch Rate</span>
                <div>
                  <span className="text-5xl font-black text-amber-400 tracking-tight">${Math.round(freightCalc.totalGrossRate).toLocaleString()}</span>
                  <span className="text-slate-400 text-sm font-bold block mt-1">Total Carrier Load Quote</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Base Linehaul Pay</span>
                    <span className="text-white font-bold text-sm">${Math.round(freightCalc.baseFreight).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Fuel Surcharge</span>
                    <span className="text-blue-400 font-bold text-sm">${Math.round(freightCalc.totalFuel).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
