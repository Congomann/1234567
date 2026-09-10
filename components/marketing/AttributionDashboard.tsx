import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Target, Activity } from 'lucide-react';

interface AttributionData {
  source: string;
  leads: number;
  qualified: number;
  appointments: number;
  spend: number;
  cpl: number;
}

export const AttributionDashboard: React.FC = () => {
  const [data, setData] = useState<AttributionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('nhfg_access_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch('/api/analytics/attribution', { headers });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        } else {
          throw new Error(json.error || 'Failed to load attribution data');
        }
      } catch (e: any) {
        setError(e.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Attribution Data...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-rose-500">Error: {error}</div>;
  }

  const totalLeads = data.reduce((acc, row) => acc + row.leads, 0);
  const totalQualified = data.reduce((acc, row) => acc + row.qualified, 0);
  const totalSpend = data.reduce((acc, row) => acc + row.spend, 0);
  const avgCpl = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : '0.00';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-slate-900">Attribution & Performance</h3>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Leads</p>
          <p className="text-2xl font-black text-slate-900">{totalLeads}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Qualified</p>
          <p className="text-2xl font-black text-emerald-600">{totalQualified}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spend</p>
          <p className="text-2xl font-black text-slate-900">${totalSpend.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg CPL</p>
          <p className="text-2xl font-black text-blue-600">${avgCpl}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Target className="text-indigo-600 w-6 h-6" />
          <h3 className="text-lg font-black text-slate-900">Lead Attribution</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Leads</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qualified</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointments</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Spend</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">CPL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm text-slate-900">{row.source}</td>
                  <td className="px-6 py-4 font-semibold text-sm text-slate-700">{row.leads}</td>
                  <td className="px-6 py-4 font-semibold text-sm text-emerald-600">{row.qualified}</td>
                  <td className="px-6 py-4 font-semibold text-sm text-indigo-600">{row.appointments}</td>
                  <td className="px-6 py-4 font-semibold text-sm text-slate-700">${row.spend.toLocaleString()}</td>
                  <td className="px-6 py-4 font-black text-sm text-blue-600">${row.cpl}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No attribution data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
