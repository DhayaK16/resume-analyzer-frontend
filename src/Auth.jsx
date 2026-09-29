import { useState } from 'react';

function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isRegister ? 'register' : 'login';

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      localStorage.setItem('token', data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-8">Resume Analyzer</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-center mb-2">
          {isRegister ? 'Create an account' : 'Log in'}
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-700 rounded p-2 bg-gray-900"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-700 rounded p-2 bg-gray-900"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded p-3 font-semibold"
        >
          {loading ? 'Please wait...' : isRegister ? 'Register' : 'Log In'}
        </button>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded p-2 text-sm">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => { setIsRegister(!isRegister); setError(null); }}
          className="text-sm text-purple-400 hover:underline"
        >
          {isRegister ? 'Already have an account? Log in' : "Don't have an account? Register"}
        </button>
      </form>
    </div>
  );
}

export default Auth;