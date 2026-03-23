import { Search, Plus } from 'lucide-react';
import { ExamCard } from './ExamCard';
import type { Exam } from '../types';
import type { Question } from '@/service/endpoint/questions';

interface ExamListProps {
  exams: Exam[];
  totalCount: number;
  allQuestions: Question[];
  search: string;
  onSearchChange: (value: string) => void;
  onNewExam: () => void;
  onEdit: (exam: Exam) => void;
  onDelete: (exam: Exam) => void;
}

export function ExamList({
  exams,
  totalCount,
  allQuestions,
  search,
  onSearchChange,
  onNewExam,
  onEdit,
  onDelete,
}: ExamListProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">Exams</h1>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {totalCount} {totalCount === 1 ? 'exam' : 'exams'}
          </span>
        </div>
        <button
          type="button"
          onClick={onNewExam}
          className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Exam
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {exams.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <p className="text-sm text-slate-500">
            {search ? 'No exams found.' : 'No exams registered yet.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              allQuestions={allQuestions}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
