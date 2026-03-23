import { Search, Plus, Upload } from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import type { Question } from '../types';

interface QuestionListProps {
  questions: Question[];
  totalCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  onNewQuestion: () => void;
  onBulkCreate: () => void;
  onEditStatement: (questionId: string, statement: string) => void;
  onDeleteQuestion: (question: Question) => void;
  onEditAlternative: (questionId: string, altId: string, description: string) => void;
  onAddAlternative: (questionId: string) => void;
  onToggleCorrect: (question: Question, altId: string) => void;
  onDeleteAlternative: (question: Question, altId: string) => void;
}

export function QuestionList({
  questions,
  totalCount,
  search,
  onSearchChange,
  onNewQuestion,
  onBulkCreate,
  onEditStatement,
  onDeleteQuestion,
  onEditAlternative,
  onAddAlternative,
  onToggleCorrect,
  onDeleteAlternative,
}: QuestionListProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">Questions</h1>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {totalCount} {totalCount === 1 ? 'question' : 'questions'}
          </span>
        </div>
        <button
          type="button"
          onClick={onBulkCreate}
          className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Import
        </button>
        <button
          type="button"
          onClick={onNewQuestion}
          className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Question
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by statement..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {questions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <p className="text-sm text-slate-500">
            {search ? 'No questions found.' : 'No questions registered yet.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onEditStatement={onEditStatement}
              onDeleteQuestion={onDeleteQuestion}
              onEditAlternative={onEditAlternative}
              onAddAlternative={onAddAlternative}
              onToggleCorrect={(altId) => onToggleCorrect(q, altId)}
              onDeleteAlternative={(altId) => onDeleteAlternative(q, altId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
