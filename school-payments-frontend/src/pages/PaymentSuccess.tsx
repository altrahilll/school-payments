// import AppShell from '../components/AppShell';

// export default function PaymentSuccess() {
//   return (
//     <AppShell>
//       <div className="max-w-xl mx-auto text-center card">
//         <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">✓</div>
//         <h2 className="text-xl font-semibold">Payment successful</h2>
//         <p className="text-sm text-gray-600 mt-1">Thank you! Your payment has been processed.</p>
//         <a href="/dashboard" className="btn mt-4 inline-block">Back to Dashboard</a>
//       </div>
//     </AppShell>
//   );
// }
import { useMemo, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';

export default function PaymentSuccess() {
  const location = useLocation();
  const nav = useNavigate();
  const [copied, setCopied] = useState(false);

  // Read possible query param keys from PG redirect
  const { collectId, customOrderId } = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const collect =
      sp.get('collect_request_id') ||
      sp.get('EdvironCollectRequestId') ||
      sp.get('collectId') ||
      sp.get('order_id') ||
      '';
    const coid = sp.get('custom_order_id') || '';
    return { collectId: collect, customOrderId: coid };
  }, [location.search]);

  const apiBase: string = (import.meta as any).env?.VITE_API_BASE || '';

  const copyId = async () => {
    if (!collectId) return;
    await navigator.clipboard.writeText(collectId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openPgStatus = () => {
    if (!collectId || !apiBase) return;
    const url = `${apiBase}/payments/status/${encodeURIComponent(collectId)}`;
    window.open(url, '_blank');
  };

  const goStatusByCustomOrderId = () => {
    if (!customOrderId) return;
    nav(`/status?coid=${encodeURIComponent(customOrderId)}`);
  };

  return (
    <AppShell>
      <div className="max-w-xl mx-auto card text-center">
        <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">✓</div>
        <h2 className="text-xl font-semibold">Payment successful</h2>
        <p className="text-sm text-gray-600 dark:text-neutral-300 mt-1">
          Thank you! Your payment has been processed.
        </p>

        {(collectId || customOrderId) && (
          <div className="mt-4 grid gap-2 text-left">
            {collectId && (
              <div className="text-sm">
                <span className="text-gray-600 dark:text-neutral-300">collect_request_id:&nbsp;</span>
                <code className="text-xs bg-gray-100 dark:bg-neutral-800 rounded px-2 py-1">{collectId}</code>
              </div>
            )}
            {customOrderId && (
              <div className="text-sm">
                <span className="text-gray-600 dark:text-neutral-300">custom_order_id:&nbsp;</span>
                <code className="text-xs bg-gray-100 dark:bg-neutral-800 rounded px-2 py-1">{customOrderId}</code>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link to="/dashboard" className="btn">
            Back to Dashboard
          </Link>

          {collectId && (
            <button onClick={copyId} className="btn-secondary">
              {copied ? 'Copied!' : 'Copy collect_request_id'}
            </button>
          )}

          {collectId && apiBase && (
            <button onClick={openPgStatus} className="btn-secondary">
              Check PG status
            </button>
          )}

          {customOrderId && (
            <button onClick={goStatusByCustomOrderId} className="btn-secondary">
              Check local status
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}