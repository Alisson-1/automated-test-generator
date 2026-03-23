import { Layers } from 'lucide-react';
import { Modal } from './Modal';
import { useEditExamModal } from '../hooks/useEditExamModal';
import type { UpdateExamInput, EditExamTarget } from '../types';
import type { Question } from '@/service/endpoint/questions';

interface EditExamModalProps {
  target: EditExamTarget;
  allQuestions: Question[];
  onSave: (examId: string, data: UpdateExamInput) => void;
  onClose: () => void;
}

export function EditExamModal({ target, allQuestions, onSave, onClose }: EditExamModalProps) {
  const {
    title,
    setTitle,
    questionIds,
    identifierMode,
    setIdentifierMode,
    error,
    combinationsLabel,
    toggleQuestion,
    handleSubmit,
  } = useEditExamModal({ target, allQuestions, onSave });

  return (
    <Modal title="Edit Exam" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Exam title..."
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Identifier Mode</label>
          <div className="flex gap-4">
            {(['letters', 'powers-of-2'] as const).map((mode) => (
              <label key={mode} className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-600">
                <input
                  type="radio"
                  name="edit-identifierMode"
                  value={mode}
                  checked={identifierMode === mode}
                  onChange={() => setIdentifierMode(mode)}
                  className="accent-blue-600"
                />
                {mode === 'letters' ? 'Letters' : 'Powers of 2'}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Questions{' '}
            <span className="font-normal text-slate-400">({questionIds.length} selected)</span>
          </p>
          {allQuestions.length === 0 ? (
            <p className="text-xs text-slate-400">No questions available.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 p-2">
              <div className="flex flex-col gap-1">
                {allQuestions.map((q) => (
                  <label
                    key={q.id}
                    className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={questionIds.includes(q.id)}
                      onChange={() => toggleQuestion(q.id)}
                      className="mt-0.5 accent-blue-600"
                    />
                    <span className="text-sm leading-tight text-slate-700">{q.statement}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {questionIds.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-md border border-amber-100 bg-amber-50 px-3 py-2">
            <Layers className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span className="text-xs text-amber-700">
              <span className="font-semibold">{combinationsLabel}</span>
              {' '}unique proof combinations
            </span>
          </div>
        )}

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
