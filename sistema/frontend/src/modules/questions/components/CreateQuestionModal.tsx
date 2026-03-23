import { Plus, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { useCreateQuestionModal } from '../hooks/useCreateQuestionModal';
import type { CreateQuestionInput } from '../types';

interface CreateQuestionModalProps {
  onSave: (data: CreateQuestionInput) => void;
  onClose: () => void;
}

export function CreateQuestionModal({ onSave, onClose }: CreateQuestionModalProps) {
  const {
    statement,
    setStatement,
    alternatives,
    error,
    updateAlternative,
    setCorrectAlternative,
    addAlternative,
    removeAlternative,
    handleSubmit,
  } = useCreateQuestionModal({ onSave });

  return (
    <Modal title="New Question" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Statement</label>
          <textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={3}
            placeholder="Enter the question statement..."
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            autoFocus
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Alternatives</p>
          <div className="flex flex-col gap-2">
            {alternatives.map((alt, i) => {
              const letter = String.fromCharCode(65 + i);
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-600">
                    {letter}
                  </span>
                  <input
                    type="text"
                    value={alt.description}
                    onChange={(e) => updateAlternative(i, { description: e.target.value })}
                    placeholder={`Alternative ${letter}`}
                    className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="correct-alternative"
                      checked={alt.correct}
                      onChange={() => setCorrectAlternative(i)}
                      className="accent-emerald-500"
                    />
                    Correct
                  </label>
                  <button
                    type="button"
                    onClick={() => removeAlternative(i)}
                    disabled={alternatives.length <= 2}
                    aria-label="Remove alternative"
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addAlternative}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add alternative
          </button>
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
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
