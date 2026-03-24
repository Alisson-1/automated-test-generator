import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGrading } from '../hooks/useGrading';
import { GradeForm } from '../components/GradeForm';
import { GradeReport } from '../components/GradeReport';

export default function GradingView() {
  const {
    answerKeyCsv,
    setAnswerKeyCsv,
    studentResponsesCsv,
    setStudentResponsesCsv,
    gradingMode,
    setGradingMode,
    examValueStr,
    setExamValueStr,
    handleAnswerKeyFile,
    handleStudentResponsesFile,
    handleSubmit,
    handleDownload,
    loading,
    notification,
    report,
  } = useGrading();

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-900">Grading</h1>
        <p className="text-sm text-slate-500">
          Upload the answer key and student responses to generate a grade report.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <GradeForm
          answerKeyCsv={answerKeyCsv}
          onAnswerKeyCsvChange={setAnswerKeyCsv}
          onAnswerKeyFile={handleAnswerKeyFile}
          studentResponsesCsv={studentResponsesCsv}
          onStudentResponsesCsvChange={setStudentResponsesCsv}
          onStudentResponsesFile={handleStudentResponsesFile}
          gradingMode={gradingMode}
          onGradingModeChange={setGradingMode}
          examValueStr={examValueStr}
          onExamValueChange={setExamValueStr}
          loading={loading}
          onSubmit={handleSubmit}
        />

        {report && (
          <GradeReport
            headers={report.headers}
            rows={report.rows}
            onDownload={handleDownload}
          />
        )}
      </div>

      {notification && (
        <div
          className={cn(
            'fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all',
            notification.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white',
          )}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {notification.message}
        </div>
      )}
    </main>
  );
}
