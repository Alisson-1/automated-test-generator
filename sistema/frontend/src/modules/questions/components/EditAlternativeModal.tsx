import { useState } from 'react';
import { Modal } from './Modal';

interface EditAlternativeModalProps {
  questionId: string;
  altId: string;
  initialDescription: string;
  onSave: (questionId: string, altId: string, description: string) => void;
  onClose: () => void;
}

export function EditAlternativeModal({
  questionId,
  altId,
  initialDescription,
  onSave,
  onClose,
}: EditAlternativeModalProps) {
  const [description, setDescription] = useState(initialDescription);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) onSave(questionId, altId, description.trim());
  };

  return (
    <Modal title="Edit Alternative" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            disabled={!description.trim() || description.trim() === initialDescription}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
