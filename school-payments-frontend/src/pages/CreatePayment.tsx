import { useState } from 'react';
import api from '../api/client';
import AppShell from '../components/AppShell';

export default function CreatePayment() {
  const [studentName, setStudentName] = useState('A');
  const [studentId, setStudentId] = useState('S01');
  const [studentEmail, setStudentEmail] = useState('a@x.com');
  const [amount, setAmount] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await api.post('/payments/create', {
        student_info: { name: studentName, id: studentId, email: studentEmail },
        amount: Number(amount),
        callback_url: window.location.origin + '/payment-success',
      });
      const payUrl = res.data?.payment_url as string | undefined;
      if (!payUrl) throw new Error('Payment URL not received');
      // Open reliably in new tab
      const a = document.createElement('a');
      a.href = payUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-4">Create Payment</h1>
      <div className="card max-w-xl">
        <form onSubmit={create} className="grid gap-4">
          <div>
            <label className="block text-sm mb-1">Student Name</label>
            <input className="input" value={studentName} onChange={e => setStudentName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Student ID</label>
            <input className="input" value={studentId} onChange={e => setStudentId(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Student Email</label>
            <input className="input" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Amount</label>
            <input className="input" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button type="submit" disabled={loading} className="btn">
            {loading ? 'Creating…' : 'Create Payment'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}