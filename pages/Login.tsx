
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { login, user } = useData();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);

  // Handle navigation when user state updates (successful login)
  React.useEffect(() => {
    if (user) {
      if (user.role === UserRole.CLIENT) {
        navigate('/client-portal');
      } else {
        navigate('/crm/dashboard');
      }
    }
  }, [user, navigate]);

  const executeLogin = async (targetEmail: string, targetPassword?: string) => {
    setError(null);
    // Attempt Login
    const success = await login(targetEmail, targetPassword || 'password');

    if (!success) {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    executeLogin(email, password);
  };


  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F9FAFB]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 drop-shadow-md">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Back Card */}
            <rect x="5" y="15" width="90" height="60" rx="12" fill="#F59E0B" />
            {/* Front Card */}
            <rect x="10" y="35" width="80" height="55" rx="12" fill="#FCD34D" />
            {/* Chip */}
            <rect x="42" y="52" width="16" height="22" rx="4" fill="#B45309" fillOpacity="0.25" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-[#0B2240] tracking-tight">
          Advisor Login
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-sm rounded-[2rem] border border-slate-100">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleLogin}>
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
                  placeholder="advisor@newholland.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#0B2240] ml-1 mb-1">
                Password
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-11 px-4 py-4 bg-white border border-slate-300 rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent transition-all text-base text-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#0A62A7] focus:ring-[#0A62A7] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-500">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-[#0A62A7] hover:text-blue-50">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-md text-base font-bold text-white bg-[#0A62A7] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A62A7] transition-all"
              >
                Login
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <a href="#/signup" className="font-medium text-[#0A62A7] hover:text-blue-600">
                Sign up
              </a>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-medium text-slate-400 uppercase tracking-widest">
          Powered by New Holland Financial CRM
        </p>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[#0A62A7] hover:text-blue-600 flex items-center font-medium"
          >
            Return to Home <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
