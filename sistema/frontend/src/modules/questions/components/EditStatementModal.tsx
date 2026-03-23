import { useState } from 'react';
import { Modal } from './Modal';

interface EditStatementModalProps {
  questionId: string;
  initialStatement: string;
  onSave: (questionId: string, statement: string) => void;
  onClose: () => void;
}

export function EditStatementModal({ questionId, initialStatement, onSave, onClose }: EditStatementModalProps) {
  const [statement, setStatement] = useState(initialStatement);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (statement.trim()) onSave(questionId, statement.trim());
  };

  return (
    <Modal title="Edit Statement" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Statement
        </label>
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          autoFocus
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!statement.trim() || statement.trim() === initialStatement}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
