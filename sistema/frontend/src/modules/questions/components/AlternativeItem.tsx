import { CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Alternative } from '../types';

interface AlternativeItemProps {
  alternative: Alternative;
  index: number;
  onToggleCorrect: (altId: string) => void;
  onEdit: (altId: string) => void;
  onDelete: (altId: string) => void;
}

export function AlternativeItem({ alternative, index, onToggleCorrect, onEdit, onDelete }: AlternativeItemProps) {
  const letter = String.fromCharCode(65 + index);

  return (
    <div className="group flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-600">
        {letter}
      </span>

      <button
        type="button"
        onClick={() => onToggleCorrect(alternative.id)}
        aria-label={alternative.correct ? 'Unmark as correct' : 'Mark as correct'}
        className="shrink-0 transition-colors"
      >
        {alternative.correct ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400" />
        )}
      </button>

      <span
        className={cn(
          'flex-1 text-sm',
          alternative.correct ? 'font-medium text-slate-900' : 'text-slate-700',
        )}
      >
        {alternative.description}
      </span>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(alternative.id)}
          aria-label="Edit alternative"
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(alternative.id)}
          aria-label="Remove alternative"
          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
