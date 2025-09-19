// import { useEffect, useMemo, useState } from 'react';
// import Layout from '../components/Layout';
// import api from '../api/client';
// import dayjs from 'dayjs';
// import Select from 'react-select';
// import clsx from 'clsx';
// import qs from 'query-string';
// import { useLocation, useNavigate } from 'react-router-dom';

// type TxRow = {
//   _id: string;
//   collect_id: string;
//   school_id?: string;
//   gateway?: string;
//   order_amount?: number;
//   transaction_amount?: number;
//   status?: string;
//   custom_order_id?: string;
//   payment_time?: string;
//   createdAt?: string;
// };

// const PAGE_SIZE = 12;
// const statusOptions = [
//   { value: 'success', label: 'Success' },
//   { value: 'pending', label: 'Pending' },
//   { value: 'failed', label: 'Failed' },
// ];

// export default function Transactions() {
//   const [rows, setRows] = useState<TxRow[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState<string | null>(null);

//   const location = useLocation();
//   const navigate = useNavigate();
//   const qp = useMemo(() => qs.parse(location.search, { arrayFormat: 'comma' }) as any, [location.search]);

//   const page = Number(qp.page || 1);

//   useEffect(() => {
//     const run = async () => {
//       setErr(null); setLoading(true);
//       try {
//         const res = await api.get('/transactions');
//         setRows(res.data as TxRow[]);
//       } catch (e: any) {
//         setErr(e?.response?.data?.message || 'Failed to load transactions');
//       } finally { setLoading(false); }
//     };
//     run();
//   }, []);

//   const schoolOptions = useMemo(() => {
//     const ids = Array.from(new Set(rows.map(r => r.school_id).filter(Boolean))) as string[];
//     return ids.map(x => ({ value: x, label: x }));
//   }, [rows]);

//   const selectedStatus = ((qp.status || '') as string).split(',').filter(Boolean);
//   const selectedSchools = ((qp.schools || '') as string).split(',').filter(Boolean);

//   const filtered = useMemo(() => {
//     let data = rows.slice();

//     if (qp.q) {
//       const q = String(qp.q).toLowerCase();
//       data = data.filter(r =>
//         r.custom_order_id?.toLowerCase().includes(q) ||
//         r.collect_id?.toLowerCase().includes(q)
//       );
//     }
//     if (selectedStatus.length) {
//       data = data.filter(r => selectedStatus.includes((r.status || '').toLowerCase()));
//     }
//     if (selectedSchools.length) {
//       data = data.filter(r => r.school_id && selectedSchools.includes(r.school_id));
//     }
//     if (qp.from) {
//       const from = dayjs(String(qp.from));
//       data = data.filter(r => r.payment_time ? (dayjs(r.payment_time).isAfter(from) || dayjs(r.payment_time).isSame(from, 'day')) : true);
//     }
//     if (qp.to) {
//       const to = dayjs(String(qp.to));
//       data = data.filter(r => r.payment_time ? (dayjs(r.payment_time).isBefore(to) || dayjs(r.payment_time).isSame(to, 'day')) : true);
//     }
//     if (qp.sort) {
//       const [k, dir] = String(qp.sort).split(':');
//       data.sort((a: any, b: any) => {
//         const va = a[k]; const vb = b[k];
//         if (va === vb) return 0;
//         return (va > vb ? 1 : -1) * (dir === 'desc' ? -1 : 1);
//       });
//     }
//     return data;
//   }, [rows, qp, selectedStatus, selectedSchools]);

//   const total = filtered.length;
//   const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
//   const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   function setQ(next: Record<string, any>, replace = false) {
//     const current = qs.parse(location.search);
//     const merged = { ...current, ...next };
//     Object.keys(merged).forEach(k => {
//       if (merged[k] === '' || merged[k] === undefined || merged[k] === null) delete merged[k];
//     });
//     const search = qs.stringify(merged, { arrayFormat: 'comma' });
//     replace ? navigate({ search: `?${search}` }, { replace: true }) : navigate({ search: `?${search}` });
//   }

//   const setSort = (key: string) => {
//     const current = String(qp.sort || '');
//     const [k, dir] = current.split(':');
//     if (k === key) {
//       setQ({ sort: `${key}:${dir === 'asc' ? 'desc' : 'asc'}`, page: '1' }, true);
//     } else {
//       setQ({ sort: `${key}:asc`, page: '1' }, true);
//     }
//   };

//   return (
//     <Layout>
//       <div className="text-2xl font-semibold mb-4">Transactions</div>

//       <div className="card mb-4 grid grid-cols-1 lg:grid-cols-6 gap-3">
//         <input
//           className="input lg:col-span-2"
//           placeholder="Search custom_order_id / collect_id"
//           value={String(qp.q || '')}
//           onChange={e => setQ({ q: e.target.value, page: '1' })}
//         />
//         <Select
//           className="lg:col-span-2"
//           isMulti
//           options={statusOptions}
//           placeholder="Status"
//           value={statusOptions.filter(o => (String(qp.status || '')).split(',').includes(o.value))}
//           onChange={(opts) => setQ({ status: opts.map(o => o.value).join(','), page: '1' })}
//         />
//         <Select
//           className="lg:col-span-2"
//           isMulti
//           options={schoolOptions}
//           placeholder="Schools"
//           value={schoolOptions.filter(o => (String(qp.schools || '')).split(',').includes(o.value))}
//           onChange={(opts) => setQ({ schools: opts.map(o => o.value).join(','), page: '1' })}
//         />
//         <input type="date" className="input" value={String(qp.from || '')} onChange={e => setQ({ from: e.target.value, page: '1' })} />
//         <input type="date" className="input" value={String(qp.to || '')} onChange={e => setQ({ to: e.target.value, page: '1' })} />
//       </div>

//       <div className="card overflow-x-auto">
//         {loading && <div>Loading…</div>}
//         {err && <div className="text-red-600">{err}</div>}
//         {!loading && !err && (
//           <>
//             <table className="table">
//               <thead className="sticky top-0 bg-white">
//                 <tr>
//                   {[
//                     ['collect_id', 'collect_id'],
//                     ['school_id', 'school_id'],
//                     ['gateway', 'gateway'],
//                     ['order_amount', 'order_amount'],
//                     ['transaction_amount', 'transaction_amount'],
//                     ['status', 'status'],
//                     ['custom_order_id', 'custom_order_id'],
//                     ['payment_time', 'payment_time'],
//                   ].map(([key, label]) => {
//                     const active = String(qp.sort || '').startsWith(key + ':');
//                     const dir = String(qp.sort || '').split(':')[1] || '';
//                     return (
//                       <th
//                         key={key}
//                         onClick={() => setSort(key)}
//                         className={clsx('th cursor-pointer select-none', active && 'text-brand-700')}
//                         title="Click to sort"
//                       >
//                         {label} {active ? (dir === 'asc' ? '↑' : '↓') : ''}
//                       </th>
//                     );
//                   })}
//                 </tr>
//               </thead>
//               <tbody>
//                 {pageRows.map(r => (
//                   <tr key={r._id} className="group transition duration-150 ease-out hover:ease-in hover:shadow-lg hover:ring-1 hover:ring-brand-300 hover:-translate-y-[2px]">
//                     <td className="td font-mono text-xs">{r.collect_id}</td>
//                     <td className="td">{r.school_id}</td>
//                     <td className="td">{r.gateway || '—'}</td>
//                     <td className="td">{r.order_amount ?? '—'}</td>
//                     <td className="td">{r.transaction_amount ?? '—'}</td>
//                     <td className="td">
//                       <span className={clsx(
//                         'px-2 py-1 rounded text-xs',
//                         r.status === 'success' ? 'bg-green-100 text-green-700' :
//                         r.status === 'failed' ? 'bg-red-100 text-red-700' :
//                         'bg-yellow-100 text-yellow-700'
//                       )}>{r.status ?? '—'}</span>
//                     </td>
//                     <td className="td font-mono text-xs">{r.custom_order_id}</td>
//                     <td className="td">{r.payment_time ? dayjs(r.payment_time).format('YYYY-MM-DD HH:mm') : '—'}</td>
//                   </tr>
//                 ))}
//                 {!pageRows.length && (
//                   <tr><td className="td" colSpan={8}>No results</td></tr>
//                 )}
//               </tbody>
//             </table>

//             <div className="flex items-center justify-between mt-4">
//               <div className="text-sm text-gray-600">
//                 Showing {(page - 1) * PAGE_SIZE + Math.min(1, total)} - {Math.min(page * PAGE_SIZE, total)} of {total}
//               </div>
//               <div className="flex gap-2">
//                 <button className="btn-secondary" disabled={page <= 1} onClick={() => setQ({ page: String(page - 1) }, true)}>Prev</button>
//                 <button className="btn-secondary" disabled={page >= pages} onClick={() => setQ({ page: String(page + 1) }, true)}>Next</button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </Layout>
//   );
// }

import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../api/client';
import dayjs from 'dayjs';
import Select, { type MultiValue } from 'react-select';
import clsx from 'clsx';
import qs from 'query-string';
import { useLocation, useNavigate } from 'react-router-dom';

type TxRow = {
  _id: string;
  collect_id: string;
  school_id?: string;
  gateway?: string;
  order_amount?: number;
  transaction_amount?: number;
  status?: string;
  custom_order_id?: string;
  payment_time?: string;
  createdAt?: string;
};

type Option = { value: string; label: string };

const PAGE_SIZE = 12;

const statusOptions: Option[] = [
  { value: 'success', label: 'Success' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

function toStringValue(v: unknown, fallback = ''): string {
  if (Array.isArray(v)) return (v[0] as string) ?? fallback;
  if (v == null) return fallback;
  return String(v);
}

export default function Transactions() {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Parse query params safely
  const qp = useMemo(() => qs.parse(location.search, { arrayFormat: 'comma' }), [location.search]);
  const page = Number(toStringValue(qp.page, '1')) || 1;

  useEffect(() => {
    const run = async () => {
      setErr(null);
      setLoading(true);
      try {
        const res = await api.get('/transactions');
        setRows(res.data as TxRow[]);
      } catch (e: any) {
        setErr(e?.response?.data?.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const schoolOptions: Option[] = useMemo(() => {
    const ids = Array.from(new Set(rows.map(r => r.school_id).filter(Boolean))) as string[];
    return ids.map(x => ({ value: x, label: x }));
  }, [rows]);

  const selectedStatus = toStringValue(qp.status).split(',').filter(Boolean);
  const selectedSchools = toStringValue(qp.schools).split(',').filter(Boolean);

  const filtered = useMemo(() => {
    let data = rows.slice();

    const q = toStringValue(qp.q).toLowerCase();
    if (q) {
      data = data.filter(r =>
        r.custom_order_id?.toLowerCase().includes(q) ||
        r.collect_id?.toLowerCase().includes(q)
      );
    }
    if (selectedStatus.length) {
      data = data.filter(r => selectedStatus.includes((r.status || '').toLowerCase()));
    }
    if (selectedSchools.length) {
      data = data.filter(r => r.school_id && selectedSchools.includes(r.school_id));
    }

    const fromStr = toStringValue(qp.from);
    const toStr = toStringValue(qp.to);
    if (fromStr) {
      const from = dayjs(fromStr);
      data = data.filter(r => r.payment_time ? (dayjs(r.payment_time).isAfter(from) || dayjs(r.payment_time).isSame(from, 'day')) : true);
    }
    if (toStr) {
      const to = dayjs(toStr);
      data = data.filter(r => r.payment_time ? (dayjs(r.payment_time).isBefore(to) || dayjs(r.payment_time).isSame(to, 'day')) : true);
    }

    const sortStr = toStringValue(qp.sort);
    if (sortStr) {
      const [k, dir] = sortStr.split(':');
      data.sort((a: any, b: any) => {
        const va = a?.[k];
        const vb = b?.[k];
        if (va === vb) return 0;
        return (va > vb ? 1 : -1) * (dir === 'desc' ? -1 : 1);
      });
    }

    return data;
  }, [rows, qp, selectedStatus, selectedSchools]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function setQ(next: Record<string, any>, replace = false) {
    const current = qs.parse(location.search, { arrayFormat: 'comma' });
    const merged = { ...current, ...next };
    Object.keys(merged).forEach(k => {
      const v = merged[k];
      if (v === '' || v === undefined || v === null) delete merged[k];
    });
    const search = qs.stringify(merged, { arrayFormat: 'comma' });
    replace ? navigate({ search: `?${search}` }, { replace: true }) : navigate({ search: `?${search}` });
  }

  const setSort = (key: string) => {
    const sortStr = toStringValue(qp.sort);
    const [k, dir] = sortStr.split(':');
    if (k === key) {
      setQ({ sort: `${key}:${dir === 'asc' ? 'desc' : 'asc'}`, page: '1' }, true);
    } else {
      setQ({ sort: `${key}:asc`, page: '1' }, true);
    }
  };

  const statusValue: Option[] = statusOptions.filter(o => selectedStatus.includes(o.value));
  const schoolValue: Option[] = schoolOptions.filter(o => selectedSchools.includes(o.value));

  const onStatusChange = (opts: MultiValue<Option>) => {
    const values = (opts || []).map(o => o.value).join(',');
    setQ({ status: values, page: '1' });
  };

  const onSchoolChange = (opts: MultiValue<Option>) => {
    const values = (opts || []).map(o => o.value).join(',');
    setQ({ schools: values, page: '1' });
  };

  return (
    <AppShell>
      <div className="text-2xl font-semibold mb-4">Transactions</div>

      {/* Filters */}
      <div className="card mb-4 grid grid-cols-1 lg:grid-cols-6 gap-3">
        <input
          className="input lg:col-span-2"
          placeholder="Search custom_order_id / collect_id"
          value={toStringValue(qp.q)}
          onChange={e => setQ({ q: e.target.value, page: '1' })}
        />
        <div className="lg:col-span-2">
          <Select
            isMulti
            options={statusOptions}
            placeholder="Status"
            value={statusValue}
            onChange={onStatusChange}
            classNamePrefix="select"
          />
        </div>
        <div className="lg:col-span-2">
          <Select
            isMulti
            options={schoolOptions}
            placeholder="Schools"
            value={schoolValue}
            onChange={onSchoolChange}
            classNamePrefix="select"
          />
        </div>
        <input
          type="date"
          className="input"
          value={toStringValue(qp.from)}
          onChange={e => setQ({ from: e.target.value, page: '1' })}
        />
        <input
          type="date"
          className="input"
          value={toStringValue(qp.to)}
          onChange={e => setQ({ to: e.target.value, page: '1' })}
        />
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading && <div>Loading…</div>}
        {err && <div className="text-red-600">{err}</div>}
        {!loading && !err && (
          <>
            <table className="table">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  {[
                    ['collect_id', 'collect_id'],
                    ['school_id', 'school_id'],
                    ['gateway', 'gateway'],
                    ['order_amount', 'order_amount'],
                    ['transaction_amount', 'transaction_amount'],
                    ['status', 'status'],
                    ['custom_order_id', 'custom_order_id'],
                    ['payment_time', 'payment_time'],
                  ].map(([key, label]) => {
                    const active = toStringValue(qp.sort).startsWith(key + ':');
                    const dir = toStringValue(qp.sort).split(':')[1] || '';
                    return (
                      <th
                        key={key}
                        onClick={() => setSort(key)}
                        className={clsx('th cursor-pointer select-none', active && 'text-brand-700')}
                        title="Click to sort"
                      >
                        {label} {active ? (dir === 'asc' ? '↑' : '↓') : ''}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pageRows.map(r => (
                  <tr key={r._id} className="group transition duration-150 ease-out hover:ease-in hover:shadow-lg hover:ring-1 hover:ring-brand-300 hover:-translate-y-[2px]">
                    <td className="td font-mono text-xs">{r.collect_id}</td>
                    <td className="td">{r.school_id}</td>
                    <td className="td">{r.gateway || '—'}</td>
                    <td className="td">{r.order_amount ?? '—'}</td>
                    <td className="td">{r.transaction_amount ?? '—'}</td>
                    <td className="td">
                      <span className={clsx(
                        'px-2 py-1 rounded text-xs',
                        r.status === 'success' ? 'bg-green-100 text-green-700' :
                        r.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      )}>{r.status ?? '—'}</span>
                    </td>
                    <td className="td font-mono text-xs">{r.custom_order_id}</td>
                    <td className="td">{r.payment_time ? dayjs(r.payment_time).format('YYYY-MM-DD HH:mm') : '—'}</td>
                  </tr>
                ))}
                {!pageRows.length && (
                  <tr><td className="td" colSpan={8}>No results</td></tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * PAGE_SIZE + Math.min(1, total)} - {Math.min(page * PAGE_SIZE, total)} of {total}
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" disabled={page <= 1} onClick={() => setQ({ page: String(page - 1) }, true)}>Prev</button>
                <button className="btn-secondary" disabled={page >= pages} onClick={() => setQ({ page: String(page + 1) }, true)}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}