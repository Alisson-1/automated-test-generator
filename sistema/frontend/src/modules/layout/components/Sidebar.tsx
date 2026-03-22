import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { NavItem } from '../types';

interface SidebarProps {
  navItems: NavItem[];
  open: boolean;
  onClose: () => void;
}

function NavMenu({ navItems, onClose }: Omit<SidebarProps, 'open'>) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-blue-600' : '')} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar({ navItems, open, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-14 bottom-0 w-52 flex-col border-r border-slate-200 bg-white">
        <NavMenu navItems={navItems} onClose={onClose} />
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 w-64 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 md:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <span className="text-sm font-semibold text-slate-900">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <NavMenu navItems={navItems} onClose={onClose} />
      </aside>
    </>
  );
}
