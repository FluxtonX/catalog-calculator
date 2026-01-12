import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Rocket, Music } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) alert(error.message);
    else onLogin(data.session);
  };

  const signUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) alert(error.message);
    else alert('Account created! Please login.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="w-full max-w-md p-8 bg-gray-900 dark:bg-gray-800 rounded-2xl shadow-2xl text-white">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
            <Music size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
          <p className="text-gray-300 text-sm text-center mt-1">
            Login or Signup to access Artist Valuation
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
          />
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={signIn}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl hover:from-green-500 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Loading...' : <>
              <Rocket size={20} /> Login
            </>}
          </button>
          <button
            onClick={signUp}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-700 transition-all"
          >
            Signup
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          By logging in, you agree to our <span className="text-green-400">Terms & Conditions</span>.
        </div>
      </div>
    </div>
  );
}
