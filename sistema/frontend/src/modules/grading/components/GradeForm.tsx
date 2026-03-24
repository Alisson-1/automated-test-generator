import { ClipboardCheck } from 'lucide-react';
import type { GradingMode } from '../types';

interface GradeFormProps {
  answerKeyCsv: string;
  onAnswerKeyCsvChange: (value: string) => void;
  onAnswerKeyFile: (file: File | null) => void;
  studentResponsesCsv: string;
  onStudentResponsesCsvChange: (value: string) => void;
  onStudentResponsesFile: (file: File | null) => void;
  gradingMode: GradingMode;
  onGradingModeChange: (mode: GradingMode) => void;
  examValueStr: string;
  onExamValueChange: (value: string) => void;
  loading: boolean;
  onSubmit: () => void;
}

const inputClass =
  'w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

const fileInputClass =
  'w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200';

export function GradeForm({
  answerKeyCsv,
  onAnswerKeyCsvChange,
  onAnswerKeyFile,
  studentResponsesCsv,
  onStudentResponsesCsvChange,
  onStudentResponsesFile,
  gradingMode,
  onGradingModeChange,
  examValueStr,
  onExamValueChange,
  loading,
  onSubmit,
}: GradeFormProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-semibold text-slate-900">Exam Input</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Answer Key CSV</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => onAnswerKeyFile(e.target.files?.[0] ?? null)}
            className={fileInputClass}
          />
          <textarea
            value={answerKeyCsv}
            onChange={(e) => onAnswerKeyCsvChange(e.target.value)}
            placeholder={'proof_number,q1,q2\n1,A,B/C\n2,C,A'}
            rows={5}
            className={`${inputClass} resize-y font-mono text-xs`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Student Responses CSV</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => onStudentResponsesFile(e.target.files?.[0] ?? null)}
            className={fileInputClass}
          />
          <textarea
            value={studentResponsesCsv}
            onChange={(e) => onStudentResponsesCsvChange(e.target.value)}
            placeholder={'student_identifier,proof_number,q1,q2\nJohn Doe,1,A,B\nJane Smith,2,C,A'}
            rows={5}
            className={`${inputClass} resize-y font-mono text-xs`}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Grading Mode</span>
          <div className="flex gap-4">
            {(['strict', 'lenient'] as GradingMode[]).map((mode) => (
              <label key={mode} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="gradingMode"
                  value={mode}
                  checked={gradingMode === mode}
                  onChange={() => onGradingModeChange(mode)}
                  className="accent-blue-600"
                />
                <span className="text-sm capitalize text-slate-700">{mode}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            {gradingMode === 'strict'
              ? 'Any wrong or missing selection zeroes the question.'
              : 'Score is proportional to correctly selected/omitted alternatives.'}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">
            Exam Value{' '}
            <span className="font-normal text-slate-400">(optional, default 10)</span>
          </label>
          <input
            type="number"
            min={0.01}
            step="any"
            value={examValueStr}
            onChange={(e) => onExamValueChange(e.target.value)}
            placeholder="10"
            className="w-32 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="ml-auto flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
        >
          <ClipboardCheck className="h-4 w-4" />
          {loading ? 'Grading...' : 'Grade Exam'}
        </button>
      </div>
    </section>
  );
}
