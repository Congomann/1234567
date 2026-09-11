import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, Mail } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useData();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const success = await resetPassword(email);
    if (success) {
      setMessage('Password reset email sent. Please check your inbox.');
    } else {
      setError('Failed to send password reset email. Please check the email address and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F9FAFB]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
         <div className="w-20 h-20 mx-auto mb-6 drop-shadow-md">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="5" y="15" width="90" height="60" rx="12" fill="#F59E0B" />
                <rect x="10" y="35" width="80" height="55" rx="12" fill="#FCD34D" />
                <rect x="42" y="52" width="16" height="22" rx="4" fill="#B45309" fillOpacity="0.25" />
            </svg>
          </div>
        <h2 className="text-3xl font-bold text-[#0B2240] tracking-tight">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-slate-600">
            Enter your email to receive reset instructions
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-sm rounded-[2rem] border border-slate-100">
          <form className="space-y-6" onSubmit={handleReset}>
            {message && (
                <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-medium">
                    {message}
                </div>
            )}
            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#0B2240] ml-1 mb-1">
                Email Address
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-11 px-4 py-4 bg-white border border-slate-300 rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent transition-all text-base text-slate-900"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-md text-base font-bold text-white bg-[#0A62A7] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A62A7] transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-[#0A62A7] hover:text-blue-600 flex items-center justify-center">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
