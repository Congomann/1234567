import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { ShieldCheck, ShieldAlert, Shield, ArrowUpRight, ArrowDownRight, CreditCard, RefreshCw } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface Balance {
  current_balance: number;
}

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
}

interface RiskScore {
  score: 'Green' | 'Yellow' | 'Red';
  updated_at: string;
}

export default function ClientRiskDashboard({ clientId }: { clientId?: string }) {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [risk, setRisk] = useState<RiskScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { user } = useData();

  // For testing/simulation if no clientId provided, fall back to current user's ID
  const targetUserId = clientId || user?.id;

  async function loadData() {
    if (!targetUserId) return;
    setLoading(true);
    
    // Fetch latest balance
    const { data: bData } = await supabase
      .from('balances')
      .select('*')
      .eq('user_id', targetUserId)
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();
    
    if (bData) setBalance(bData);

    // Fetch transactions
    const { data: tData } = await supabase
      .from('transactions_plaid')
      .select('*')
      .eq('user_id', targetUserId)
      .order('date', { ascending: false })
      .limit(20);
      
    if (tData) setTransactions(tData);

    // Fetch Risk Score
    const { data: rData } = await supabase
      .from('risk_scores')
      .select('*')
      .eq('user_id', targetUserId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
      
    if (rData) setRisk(rData);
    
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [targetUserId]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Trigger the backend API to force a sync
      const token = localStorage.getItem('token');
      await fetch('/api/plaid/trigger-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: targetUserId })
      });
      await loadData();
    } catch (e) {
      console.error('Sync failed', e);
    }
    setSyncing(false);
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-600 rounded w-3/4"></div></div></div>;
  }

  if (!balance && !risk && transactions.length === 0) {
    return (
      <div className="p-8 text-center bg-[#1E2330] rounded-xl border border-gray-700/50">
        <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Financial Data Connected</h3>
        <p className="text-gray-400">The client must connect their bank via Plaid to view the Risk Dashboard.</p>
        <button onClick={handleSync} className="mt-4 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center space-x-2 mx-auto hover:bg-blue-600/30">
           <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
           <span>Attempt Sync</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Badges */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
           <CreditCard className="w-6 h-6 mr-3 text-blue-400" />
           Financial Risk Engine
        </h2>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#2A3143] text-gray-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">{syncing ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* Balance Card */}
         <div className="bg-[#1E2330] p-6 rounded-xl border border-gray-700/50 shadow-lg">
            <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-400 mb-2">Available Balance</h3>
            <p className="text-4xl font-extrabold text-white">
              ${balance?.current_balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
         </div>

         {/* Risk Badge */}
         <div className={`p-6 rounded-xl border shadow-lg flex items-center justify-between
            ${risk?.score === 'Green' ? 'bg-emerald-900/20 border-emerald-500/30' : 
              risk?.score === 'Yellow' ? 'bg-amber-900/20 border-amber-500/30' : 
              'bg-red-900/20 border-red-500/30'}`
          }>
            <div>
               <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-400 mb-2">Risk Status</h3>
               <p className={`text-4xl font-extrabold flex items-center
                  ${risk?.score === 'Green' ? 'text-emerald-400' : 
                    risk?.score === 'Yellow' ? 'text-amber-400' : 
                    'text-red-400'}`
                }>
                  {risk?.score === 'Green' ? <ShieldCheck className="w-8 h-8 mr-2" /> : 
                   risk?.score === 'Yellow' ? <ShieldAlert className="w-8 h-8 mr-2" /> : 
                   <ShieldAlert className="w-8 h-8 mr-2" />}
                  {risk?.score || 'Unknown'}
               </p>
            </div>
            
            {/* Smart Flags Note */}
            <div className="text-right">
               {risk?.score === 'Green' && <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">Upsell IUL</span>}
               {risk?.score === 'Red' && <span className="inline-block px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-bold uppercase tracking-wider">Downsell FE</span>}
            </div>
         </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-[#1E2330] rounded-xl border border-gray-700/50 overflow-hidden shadow-lg">
         <div className="p-4 border-b border-gray-700/50 bg-[#262B3D]/50">
            <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-300">Recent Transactions (30 Days)</h3>
         </div>
         <ul className="divide-y divide-gray-800">
           {transactions.length === 0 ? (
              <li className="p-6 text-center text-gray-500 text-sm">No transactions synced yet.</li>
           ) : transactions.map(tx => (
             <li key={tx.id} className="p-4 hover:bg-[#2A3143] transition-colors flex items-center justify-between">
               <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                     {tx.amount > 0 ? <ArrowDownRight className="w-4 h-4 text-red-400" /> : <ArrowUpRight className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-200">{tx.name || 'Unknown Merchant'}</h4>
                    <span className="text-xs text-gray-500">{tx.category} • {tx.date}</span>
                  </div>
               </div>
               <span className={`font-mono font-bold ${tx.amount > 0 ? 'text-gray-300' : 'text-emerald-400'}`}>
                  {tx.amount > 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
               </span>
             </li>
           ))}
         </ul>
      </div>

    </div>
  );
}
