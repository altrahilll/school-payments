import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../api/client';
import clsx from 'clsx';

type TxRow = {
  _id: string;
  collect_id: string;
  custom_order_id?: string;
  status?: string;
  order_amount?: number;
  payment_time?: string;
  school_id?: string;
};

export default function TransactionsBySchool() {
  const [all, setAll] = useState<TxRow[]>([]);
  const [schoolId, setSchoolId] = useState<string>('');
  const [rows, setRows] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setErr(null);
      try {
        const res = await api.get('/transactions');
        setAll(res.data as TxRow[]);
      } catch (e: any) {
        setErr(e?.response?.data?.message || 'Failed to load');
      }
    };
    run();
  }, []);

  const schools = useMemo(() => {
    const ids = Array.from(new Set(all.map(r => r.school_id).filter(Boolean))) as string[];
    return ids;
  }, [all]);

  const load = async () => {
    setRows([]);
    if (!schoolId) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await api.get(`/transactions/school/${schoolId}`);
      setRows(res.data as TxRow[]);
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (schoolId) load(); }, [schoolId]);

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-4">Transactions by School</h1>

      <div className="card mb-4 grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Select school_id</label>
          <select className="input" value={schoolId} onChange={e => setSchoolId(e.target.value)}>
            <option value="">-- choose --</option>
            {schools.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>

        {!schools.length && (
          <div>
            <label className="block text-sm mb-1">Enter school_id (fallback)</label>
            <div className="flex gap-2">
              <input className="input" placeholder="school_id" value={schoolId} onChange={e => setSchoolId(e.target.value)} />
              <button className="btn" onClick={load}>Load</button>
            </div>
            <div className="text-xs text-gray-500 mt-1">No schools found from /transactions. Enter one manually.</div>
          </div>
        )}
      </div>

      <div className="card overflow-x-auto">
        {loading && <div>Loading…</div>}
        {err && <div className="text-red-600">{err}</div>}
        {!loading && !err && (
          <table className="table">
            <thead>
              <tr>
                <th className="th">collect_id</th>
                <th className="th">custom_order_id</th>
                <th className="th">status</th>
                <th className="th">order_amount</th>
                <th className="th">payment_time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r._id} className="group transition duration-150 ease-out hover:ease-in hover:shadow-lg hover:ring-1 hover:ring-brand-300 hover:-translate-y-[2px]">
                  <td className="td font-mono text-xs">{r.collect_id}</td>
                  <td className="td font-mono text-xs">{r.custom_order_id}</td>
                  <td className="td">
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs',
                      r.status === 'success' ? 'chip-green' :
                      r.status === 'failed' ? 'chip-red' :
                      'chip-yellow'
                    )}>{r.status ?? '—'}</span>
                  </td>
                  <td className="td">{r.order_amount ?? '—'}</td>
                  <td className="td">{r.payment_time ?? '—'}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td className="td" colSpan={5}>No results</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}