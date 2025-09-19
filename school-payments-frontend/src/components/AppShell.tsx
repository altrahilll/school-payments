import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  BanknotesIcon,
  TableCellsIcon,
  MagnifyingGlassIcon,
  PowerIcon,
  AcademicCapIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Switch from './ui/Switch';
import { useAuth } from '../auth/AuthContext';

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

function NavItem({
  to,
  label,
  Icon,
  onClick,
}: {
  to: string;
  label: string;
  Icon: IconType;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition
         ${isActive
            ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-100 dark:bg-neutral-700 dark:text-neutral-50 dark:ring-neutral-600'
            : 'text-gray-700 hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-800/80'}`
      }
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      {label}
    </NavLink>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);   // sidebar (mobile)
  const [menu, setMenu] = useState(false);   // profile dropdown
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { logout } = useAuth();
  const nav = useNavigate();

  // close dropdown on outside click / ESC
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr] bg-gray-50 dark:bg-neutral-900 dark:text-neutral-200">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-30 inset-y-0 left-0 w-64 bg-white dark:bg-neutral-900 ring-1 ring-gray-200 dark:ring-neutral-700 shadow-card transform transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 px-4 flex items-center gap-2 border-b dark:border-neutral-800">
          <div className="h-8 w-8 rounded bg-brand-600" />
          <div className="text-lg font-semibold">School Payments</div>
        </div>

        <div className="p-4 grid gap-1">
          <NavItem to="/dashboard" label="Dashboard" Icon={AcademicCapIcon} onClick={() => setOpen(false)} />
          <NavItem to="/create-payment" label="Create Payment" Icon={BanknotesIcon} onClick={() => setOpen(false)} />
          <NavItem to="/transactions" label="Transactions" Icon={TableCellsIcon} onClick={() => setOpen(false)} />
          <NavItem to="/transactions-by-school" label="By School" Icon={TableCellsIcon} onClick={() => setOpen(false)} />
          <NavItem to="/status" label="Status" Icon={MagnifyingGlassIcon} onClick={() => setOpen(false)} />
        </div>

        {/* Footer: Dark mode only (logout removed here) */}
        <div className="mt-auto p-4 border-t dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-neutral-300">Dark mode</span>
            <Switch />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="relative h-16 z-40 bg-white/80 dark:bg-neutral-900/70 backdrop-blur ring-1 ring-gray-200 dark:ring-neutral-800 shadow-sm flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button className="lg:hidden btn-ghost" onClick={() => setOpen(s => !s)} aria-label="Toggle sidebar">
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Profile dropdown with Logout */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenu(m => !m)}
              className="btn-ghost rounded-full ring-1 ring-gray-200 dark:ring-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-haspopup="menu"
              aria-expanded={menu}
              aria-label="Open profile menu"
            >
              <img src="https://i.pravatar.cc/40" alt="avatar" className="h-8 w-8 rounded-full" />
            </button>

            <div
              className={`absolute right-0 mt-3 w-56 origin-top-right rounded-xl bg-white dark:bg-neutral-800 ring-1 ring-black/5 dark:ring-neutral-700 shadow-2xl p-2 z-50 transition-all duration-150 ${
                menu ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
              role="menu"
              aria-label="Profile"
            >
              {/* caret */}
              <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 bg-white dark:bg-neutral-800 ring-1 ring-black/5 dark:ring-neutral-700" />

              <div className="px-2 py-1.5 text-sm text-gray-600 dark:text-neutral-300 flex items-center gap-2">
                <UserCircleIcon className="h-4 w-4" /> Signed in
              </div>

              <NavLink
                to="/dashboard"
                onClick={() => setMenu(false)}
                className="block px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
                role="menuitem"
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/status"
                onClick={() => setMenu(false)}
                className="block px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
                role="menuitem"
              >
                Status
              </NavLink>

              <div className="border-t my-1 dark:border-neutral-700" />

              <button
                onClick={() => {
                  setMenu(false);
                  logout();
                  nav('/login');
                }}
                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                role="menuitem"
              >
                <PowerIcon className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 bg-gray-50 dark:bg-neutral-900 flex-1">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        <footer className="py-4 text-center text-xs text-gray-500 dark:text-neutral-400">
          © {new Date().getFullYear()} School Payments
        </footer>
      </div>
    </div>
  );
}