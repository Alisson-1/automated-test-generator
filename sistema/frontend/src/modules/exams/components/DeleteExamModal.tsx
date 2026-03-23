import { Modal } from './Modal';
import type { Exam } from '../types';

interface DeleteExamModalProps {
  exam: Exam;
  onConfirm: (examId: string) => void;
  onClose: () => void;
}

export function DeleteExamModal({ exam, onConfirm, onClose }: DeleteExamModalProps) {
  return (
    <Modal title="Delete exam?" onClose={onClose}>
      <p className="text-sm text-slate-600">
        This action cannot be undone. The exam will be permanently removed.
      </p>
      <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">
        "{exam.title}"
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
          onClick={() => onConfirm(exam.id)}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
