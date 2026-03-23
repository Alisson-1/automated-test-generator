import { Pencil, Trash2, Hash, Layers } from 'lucide-react';
import { useExamCard } from '../hooks/useExamCard';
import { computeCombinations, formatCombinations } from '../hooks/useExams';
import type { Exam } from '../types';
import type { Question } from '@/service/endpoint/questions';

interface ExamCardProps {
  exam: Exam;
  allQuestions: Question[];
  onEdit: (exam: Exam) => void;
  onDelete: (exam: Exam) => void;
}

export function ExamCard({ exam, allQuestions, onEdit, onDelete }: ExamCardProps) {
  const { formatDate } = useExamCard();
  const combinations = computeCombinations(allQuestions, exam.questionIds);

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between px-5 pt-4 pb-3">
        <div className="flex-1 min-w-0">
          <span className="mb-1.5 inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
            ID: {exam.id.slice(0, 8)}
          </span>
          <p className="text-sm font-medium text-slate-900">{exam.title}</p>
        </div>
        <div className="ml-3 flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(exam)}
            aria-label="Edit exam"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(exam)}
            aria-label="Delete exam"
            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Hash className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium">{exam.questionIds.length}</span>
            <span>{exam.questionIds.length === 1 ? 'question' : 'questions'}</span>
          </div>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {exam.identifierMode === 'letters' ? 'Letters' : 'Powers of 2'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-amber-100 bg-amber-50 px-3 py-2">
          <Layers className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span className="text-xs text-amber-700">
            <span className="font-semibold">{formatCombinations(combinations)}</span>
            {' '}unique proof combination{combinations !== 1n ? 's' : ''}
          </span>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Created: {formatDate(exam.createdAt)} | Updated: {formatDate(exam.updatedAt)}
        </p>
      </div>
    </div>
  );
}
