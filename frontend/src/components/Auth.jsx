import React, { useState } from 'react';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/signup';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store token and user details
      localStorage.setItem('verivoice_token', data.token);
      localStorage.setItem('verivoice_user', JSON.stringify(data.user));
      
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-brand-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-brand-900 tracking-tight">SachiAwaaz</h1>
          <p className="text-brand-500 mt-2 text-base">
            Is this really them?
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-accent-red p-4 rounded mb-6 text-accent-red text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-brand-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-brand-300 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent text-base min-h-[44px]"
              placeholder="e.g., family@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-brand-300 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent text-base min-h-[44px]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 text-base shadow-sm min-h-[44px]"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-brand-100 pt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-accent-blue hover:underline font-semibold text-base min-h-[44px]"
          >
            {isLogin
              ? "Don't have an account? Sign up here"
              : 'Already have an account? Sign in here'}
          </button>
        </div>
      </div>
    </div>
  );
}
