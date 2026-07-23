import React, { useState } from 'react';
import { CreditCard, CheckCircle, XCircle, ShieldCheck, Check } from 'lucide-react';
import { CampaignApproval, PaymentTransaction } from '../../types';

interface PaymentApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  amount: number;
  onApprove: (transaction: Partial<PaymentTransaction>) => void;
}

export const PaymentApprovalModal: React.FC<PaymentApprovalModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  amount,
  onApprove,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/api/marketing/campaigns/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, amount })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onApprove({
            id: data.transaction,
            amount,
            currency: 'USD',
            status: 'succeeded',
            campaignId,
            date: new Date().toISOString(),
          });
          setIsSuccess(false);
          onClose();
        }, 1500);
      } else {
        console.error('Payment failed:', data.error);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error during payment processing:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white/80 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-white/60 overflow-hidden relative transform transition-all">
        {/* Apple-esque header */}
        <div className="px-8 pt-8 pb-4 flex flex-col items-center border-b border-slate-100">
          <div className="w-14 h-14 bg-gradient-to-tr from-slate-800 to-slate-900 text-white rounded-full flex items-center justify-center shadow-lg mb-4">
            {isSuccess ? <Check size={28} /> : <CreditCard size={28} />}
          </div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Approve Campaign Funding</h2>
          <p className="text-sm font-medium text-slate-500 mt-1 text-center">
            You are authorizing a payment to fund campaign <span className="font-semibold text-slate-700">{campaignId}</span>.
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-slate-50/80 rounded-2xl p-6 flex flex-col items-center justify-center mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Amount</span>
            <span className="text-4xl font-bold text-slate-900 tracking-tight">${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <CreditCard size={18} />
                <span className="text-sm font-medium">Apple Card ending in 4242</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 cursor-pointer">Change</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 justify-center pt-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Secured by Stripe processing</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-8 pb-8 flex flex-col gap-3">
          <button
            onClick={handlePayment}
            disabled={isProcessing || isSuccess}
            className={`w-full py-4 rounded-2xl text-sm font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSuccess 
                ? 'bg-emerald-500 shadow-emerald-500/20' 
                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
            } ${isProcessing ? 'opacity-80 cursor-wait' : ''}`}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : isSuccess ? (
              'Payment Approved'
            ) : (
              'Double Click to Pay' /* Emulating Apple Pay wording */
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isProcessing || isSuccess}
            className="w-full py-4 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
