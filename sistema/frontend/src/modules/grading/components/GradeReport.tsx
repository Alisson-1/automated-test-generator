import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportRow } from '../types';

interface GradeReportProps {
  headers: string[];
  rows: ReportRow[];
  onDownload: () => void;
}

export function GradeReport({ headers, rows, onDownload }: GradeReportProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Grade Report</h2>
          <p className="text-xs text-slate-400">{rows.length} student{rows.length !== 1 ? 's' : ''} graded</p>
        </div>
        <button
          type="button"
          onClick={onDownload}
          className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    'px-4 py-2.5 text-xs font-semibold text-slate-500',
                    i === 0 ? 'text-left' : 'text-right',
                    i === headers.length - 1 ? 'text-right font-bold text-slate-700' : '',
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-2.5 text-slate-900">{row.studentIdentifier}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">{row.proofNumber}</td>
                {row.questionScores.map((score, i) => (
                  <td key={i} className="px-4 py-2.5 text-right text-slate-600">
                    {score}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                  {row.totalScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
