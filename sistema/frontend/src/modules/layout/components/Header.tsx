import { Menu, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  apiOnline: boolean;
  onOpenSidebar: () => void;
}

export function Header({ apiOnline, onOpenSidebar }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between bg-slate-900 px-4 shadow-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open menu"
          className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
            <ClipboardList className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Exam System</span>
        </div>
      </div>

      <span
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
          apiOnline
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-red-500/20 text-red-400',
        )}
      >
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            apiOnline ? 'bg-emerald-400' : 'bg-red-400',
          )}
        />
        {apiOnline ? 'API Online' : 'API Offline'}
      </span>
    </header>
  );
}
