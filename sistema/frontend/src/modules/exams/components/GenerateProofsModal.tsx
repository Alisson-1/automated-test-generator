import { FileDown } from 'lucide-react';
import { Modal } from './Modal';
import { useGenerateProofsModal } from '../hooks/useGenerateProofsModal';
import type { Exam } from '../types';

interface GenerateProofsModalProps {
  exam: Exam;
  onClose: () => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

export function GenerateProofsModal({ exam, onClose, onNotify }: GenerateProofsModalProps) {
  const {
    countStr, setCountStr,
    discipline, setDiscipline,
    teacher, setTeacher,
    date, setDate,
    institution, setInstitution,
    loading,
    error,
    handleSubmit,
  } = useGenerateProofsModal({ examId: exam.id, examTitle: exam.title, onClose, onNotify });

  return (
    <Modal title="Generate Proofs" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Number of Proofs
          </label>
          <input
            type="number"
            min={1}
            max={500}
            value={countStr}
            onChange={(e) => setCountStr(e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Institution{' '}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g. University of..."
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Discipline</label>
          <input
            type="text"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            placeholder="e.g. Mathematics"
            autoFocus
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Teacher</label>
          <input
            type="text"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            placeholder="Teacher name"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            {loading ? 'Generating...' : 'Generate & Download'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
