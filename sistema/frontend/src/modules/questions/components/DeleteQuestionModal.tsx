import { Modal } from './Modal';
import type { Question } from '../types';

interface DeleteQuestionModalProps {
  question: Question;
  onConfirm: (questionId: string) => void;
  onClose: () => void;
}

export function DeleteQuestionModal({ question, onConfirm, onClose }: DeleteQuestionModalProps) {
  return (
    <Modal title="Delete question?" onClose={onClose}>
      <p className="text-sm text-slate-600">
        This action cannot be undone. The question will be permanently removed.
      </p>
      <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">
        "{question.statement}"
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirm(question.id)}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
