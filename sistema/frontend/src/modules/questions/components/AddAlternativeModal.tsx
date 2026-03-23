import { Modal } from './Modal';
import { useAddAlternativeModal } from '../hooks/useAddAlternativeModal';

interface AddAlternativeModalProps {
  questionId: string;
  onSave: (questionId: string, description: string, correct: boolean) => void;
  onClose: () => void;
}

export function AddAlternativeModal({ questionId, onSave, onClose }: AddAlternativeModalProps) {
  const { description, setDescription, correct, setCorrect, isValid, handleSubmit } =
    useAddAlternativeModal({ questionId, onSave });

  return (
    <Modal title="Add Alternative" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter alternative description..."
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={correct}
            onChange={(e) => setCorrect(e.target.checked)}
            className="accent-emerald-500"
          />
          Mark as correct
          {correct && (
            <span className="text-xs text-amber-600">(will unmark the current correct alternative)</span>
          )}
        </label>

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
            disabled={!isValid}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>
    </Modal>
  );
}
