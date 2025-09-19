import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState('Rahil');
  const [email, setEmail] = useState('rahil@example.com');
  const [password, setPassword] = useState('pass123');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      toast.success('Account created. Please login.');
      nav('/login');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 shadow-card ring-1 ring-gray-200 dark:ring-neutral-800 p-6">
        <h2 className="text-2xl font-semibold mb-2">Create account</h2>
        <p className="text-sm text-gray-600 dark:text-neutral-300 mb-4">Register to get started</p>
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              className="input"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="input"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating…' : 'Register'}
          </button>
        </form>
        <div className="text-sm text-gray-600 dark:text-neutral-300 mt-3">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-700 hover:text-brand-800">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}