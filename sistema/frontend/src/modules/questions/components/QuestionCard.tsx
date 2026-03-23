import { Pencil, Trash2 } from 'lucide-react';
import { AlternativeItem } from './AlternativeItem';
import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onEditStatement: (questionId: string, statement: string) => void;
  onDeleteQuestion: (question: Question) => void;
  onEditAlternative: (questionId: string, altId: string, description: string) => void;
  onToggleCorrect: (altId: string) => void;
  onDeleteAlternative: (altId: string) => void;
}

export function QuestionCard({
  question,
  onEditStatement,
  onDeleteQuestion,
  onEditAlternative,
  onToggleCorrect,
  onDeleteAlternative,
}: QuestionCardProps) {
  const formattedDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR');

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between px-5 pt-4 pb-3">
        <div className="flex-1 min-w-0">
          <span className="mb-1.5 inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
            ID: {question.id.slice(0, 8)}
          </span>
          <p className="text-sm font-medium text-slate-900">{question.statement}</p>
        </div>
        <div className="ml-3 flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEditStatement(question.id, question.statement)}
            aria-label="Edit statement"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteQuestion(question)}
            aria-label="Delete question"
            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Alternatives ({question.alternatives.length})
        </p>
        <div className="flex flex-col gap-1.5">
          {question.alternatives.map((alt, i) => (
            <AlternativeItem
              key={alt.id}
              alternative={alt}
              index={i}
              onToggleCorrect={onToggleCorrect}
              onEdit={(altId) => onEditAlternative(question.id, altId, alt.description)}
              onDelete={onDeleteAlternative}
            />
          ))}
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Created: {formattedDate(question.createdAt)} | Updated: {formattedDate(question.updatedAt)}
        </p>
      </div>
    </div>
  );
}
