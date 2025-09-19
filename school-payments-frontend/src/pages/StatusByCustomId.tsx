import { useState } from 'react';
import api from '../api/client';
import AppShell from '../components/AppShell';

export default function StatusByCustomId() {
  const [coid, setCoid] = useState('');
  const [resp, setResp] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setResp(null); setLoading(true);
    try {
      const res = await api.get(`/transaction-status/${encodeURIComponent(coid)}`);
      setResp(res.data);
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to fetch status');
    } finally { setLoading(false); }
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-4">Status by custom_order_id</h1>
      <div className="card max-w-2xl">
        <form onSubmit={fetchStatus} className="flex gap-3">
          <input className="input flex-1" placeholder="custom_order_id" value={coid} onChange={e => setCoid(e.target.value)} />
          <button type="submit" disabled={loading} className="btn">{loading ? 'Checking…' : 'Check'}</button>
        </form>
        {err && <div className="text-sm text-red-600 mt-3">{err}</div>}
        {resp && (
          <pre className="mt-4 text-sm bg-gray-50 p-3 rounded border border-gray-200 overflow-auto">
            {JSON.stringify(resp, null, 2)}
          </pre>
        )}
      </div>
    </AppShell>
  );
}