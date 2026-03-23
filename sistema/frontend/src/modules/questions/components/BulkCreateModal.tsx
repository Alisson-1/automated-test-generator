import { CheckCircle2, XCircle } from 'lucide-react';
import { Modal } from './Modal';
import { useBulkCreateModal } from '../hooks/useBulkCreateModal';
import type { CreateQuestionInput, BulkCreateResult } from '../types';

const EXAMPLE = JSON.stringify(
  [
    {
      statement: 'What is the capital of France?',
      alternatives: [
        { description: 'London', correct: false },
        { description: 'Paris', correct: true },
      ],
    },
  ],
  null,
  2,
);

interface BulkCreateModalProps {
  onSave: (questions: CreateQuestionInput[]) => Promise<BulkCreateResult | null>;
  onClose: () => void;
}

export function BulkCreateModal({ onSave, onClose }: BulkCreateModalProps) {
  const { input, setInput, error, result, submitting, handleSubmit } = useBulkCreateModal({ onSave });

  return (
    <Modal title="Import Questions" onClose={onClose}>
      {result ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {result.created.length} created
            </div>
            {result.failed.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                <XCircle className="h-4 w-4" />
                {result.failed.length} failed
              </div>
            )}
          </div>

          {result.failed.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-slate-600">Failed items:</p>
              {result.failed.map((f) => (
                <div key={f.index} className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                  <span className="font-medium">#{f.index + 1}</span>
                  {f.statement ? ` — "${f.statement}"` : ''}: {f.error}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="mb-1.5 text-xs text-slate-500">
              Paste a JSON array of questions. Each question must have a{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">statement</code> and at
              least 2{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">alternatives</code>{' '}
              with exactly one marked{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">correct: true</code>.
            </p>
            <details className="mb-2">
              <summary className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-800">
                Show format example
              </summary>
              <pre className="mt-1.5 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700 border border-slate-200">
                {EXAMPLE}
              </pre>
            </details>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={10}
              placeholder="[ { ... } ]"
              className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              autoFocus
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Importing...' : 'Import'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
