// import { Link } from 'react-router-dom';
// import { useEffect, useState } from 'react';

// export default function Layout({ children }: { children: React.ReactNode }) {
//   const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
//   useEffect(() => {
//     const root = document.documentElement;
//     if (dark) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
//     else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
//   }, [dark]);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 dark:text-neutral-200">
//       <header className="bg-white dark:bg-neutral-800 shadow-sm ring-1 ring-gray-200 dark:ring-neutral-700">
//         <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="h-8 w-8 rounded bg-brand-600" />
//             <span className="text-lg font-semibold">School Payments</span>
//           </div>
//           <nav className="flex items-center gap-6 text-sm">
//             <Link to="/dashboard" className="hover:text-brand-700">Dashboard</Link>
//             <Link to="/create-payment" className="hover:text-brand-700">Create</Link>
//             <Link to="/transactions" className="hover:text-brand-700">Transactions</Link>
//             <Link to="/transactions-by-school" className="hover:text-brand-700">By School</Link>
//             <Link to="/status" className="hover:text-brand-700">Status</Link>
//             <button onClick={() => setDark(d => !d)} className="btn-secondary">{dark ? 'Light' : 'Dark'}</button>
//           </nav>
//         </div>
//       </header>
//       <main className="max-w-6xl mx-auto p-6">{children}</main>
//     </div>
//   );
// }

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (dark) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [dark]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 dark:text-neutral-200">
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-neutral-800/90 backdrop-blur shadow-sm ring-1 ring-gray-200 dark:ring-neutral-700">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-brand-600" />
            <span className="text-lg font-semibold">School Payments</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/dashboard" className="hover:text-brand-700">Dashboard</Link>
            <Link to="/create-payment" className="hover:text-brand-700">Create</Link>
            <Link to="/transactions" className="hover:text-brand-700">Transactions</Link>
            <Link to="/transactions-by-school" className="hover:text-brand-700">By School</Link>
            <Link to="/status" className="hover:text-brand-700">Status</Link>
            <button onClick={() => setDark(d => !d)} className="btn-secondary">{dark ? 'Light' : 'Dark'}</button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}