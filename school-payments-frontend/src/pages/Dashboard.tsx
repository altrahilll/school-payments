import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../api/client';
import dayjs from 'dayjs';
import { Sparklines, SparklinesLine } from 'react-sparklines';

type Tx = {
  _id: string;
  status?: string;
  payment_time?: string;
  order_amount?: number;
};

export default function Dashboard() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await api.get('/transactions');
        setTxs(Array.isArray(res.data) ? res.data : []);
      } catch {
        setTxs([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const last7 = useMemo(() => {
    const toDay = dayjs().startOf('day');
    return Array.from({ length: 7 }).map((_, i) => {
      const d = toDay.subtract(6 - i, 'day');
      const dayTx = txs.filter(t => t.payment_time && dayjs(t.payment_time).isSame(d, 'day'));
      return {
        date: d.format('YYYY-MM-DD'),
        success: dayTx.filter(t => (t.status || '').toLowerCase() === 'success').length,
        pending: dayTx.filter(t => (t.status || '').toLowerCase() === 'pending').length,
        failed:  dayTx.filter(t => (t.status || '').toLowerCase() === 'failed').length,
        amount:  dayTx.reduce((s, t) => s + (t.order_amount ?? 0), 0),
      };
    });
  }, [txs]);

  const totals = useMemo(() => ({
    count: txs.length,
    success: txs.filter(t => (t.status || '').toLowerCase() === 'success').length,
    pending: txs.filter(t => (t.status || '').toLowerCase() === 'pending').length,
    failed:  txs.filter(t => (t.status || '').toLowerCase() === 'failed').length,
    volume:  txs.reduce((s, t) => s + (t.order_amount ?? 0), 0),
  }), [txs]);

  const allSeries = last7.map(d => d.success + d.pending + d.failed);
  const successSeries = last7.map(d => d.success);
  const pendingSeries = last7.map(d => d.pending);
  const failedSeries  = last7.map(d => d.failed);
  const volumeSeries  = last7.map(d => d.amount);

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card">
          <div className="text-xs text-gray-500 dark:text-neutral-300">Total Transactions</div>
          <div className="text-2xl font-semibold">{totals.count}</div>
          <div className="mt-2">
            <Sparklines data={allSeries} width={120} height={28}>
              <SparklinesLine color="#6366f1" style={{ fill: 'none' }} />
            </Sparklines>
          </div>
        </div>

        <div className="card">
          <div className="text-xs text-gray-500 dark:text-neutral-300">Success</div>
          <div className="text-2xl font-semibold text-green-600 dark:text-green-400">{totals.success}</div>
          <div className="mt-2">
            <Sparklines data={successSeries} width={120} height={28}>
              <SparklinesLine color="#16a34a" style={{ fill: 'none' }} />
            </Sparklines>
          </div>
        </div>

        <div className="card">
          <div className="text-xs text-gray-500 dark:text-neutral-300">Pending</div>
          <div className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{totals.pending}</div>
          <div className="mt-2">
            <Sparklines data={pendingSeries} width={120} height={28}>
              <SparklinesLine color="#ca8a04" style={{ fill: 'none' }} />
            </Sparklines>
          </div>
        </div>

        <div className="card">
          <div className="text-xs text-gray-500 dark:text-neutral-300">Failed</div>
          <div className="text-2xl font-semibold text-red-600 dark:text-red-400">{totals.failed}</div>
          <div className="mt-2">
            <Sparklines data={failedSeries} width={120} height={28}>
              <SparklinesLine color="#dc2626" style={{ fill: 'none' }} />
            </Sparklines>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mt-4">
        <div className="card md:col-span-2">
          <div className="text-xs text-gray-500 dark:text-neutral-300">Volume (7d)</div>
          <div className="text-2xl font-semibold">₹ {last7.reduce((s, d) => s + d.amount, 0).toLocaleString()}</div>
          <div className="mt-2">
            <Sparklines data={volumeSeries} width={220} height={28}>
              <SparklinesLine color="#6366f1" style={{ fill: 'none' }} />
            </Sparklines>
          </div>
        </div>
        <div className="card md:col-span-2">
          <div className="text-sm text-gray-600 dark:text-neutral-300">
            {loading ? 'Loading…' : 'Welcome back! Use quick actions to manage payments and view analytics.'}
          </div>
        </div>
      </div>
    </AppShell>
  );
}