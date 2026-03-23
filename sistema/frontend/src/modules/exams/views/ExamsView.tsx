import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExams } from '../hooks/useExams';
import { ExamList } from '../components/ExamList';
import { CreateExamModal } from '../components/CreateExamModal';
import { EditExamModal } from '../components/EditExamModal';
import { DeleteExamModal } from '../components/DeleteExamModal';
import { GenerateProofsModal } from '../components/GenerateProofsModal';

export default function ExamsView() {
  const {
    exams,
    totalCount,
    allQuestions,
    loading,
    search,
    setSearch,
    notification,
    notify,
    showCreate,
    setShowCreate,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    generateTarget,
    setGenerateTarget,
    handleCreateExam,
    handleUpdateExam,
    handleDeleteExam,
  } = useExams();

  if (loading) {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <ExamList
        exams={exams}
        totalCount={totalCount}
        allQuestions={allQuestions}
        search={search}
        onSearchChange={setSearch}
        onNewExam={() => setShowCreate(true)}
        onEdit={(exam) =>
          setEditTarget({
            examId: exam.id,
            title: exam.title,
            questionIds: exam.questionIds,
            identifierMode: exam.identifierMode,
          })
        }
        onDelete={(exam) => setDeleteTarget(exam)}
        onGenerate={(exam) => setGenerateTarget(exam)}
      />

      {showCreate && (
        <CreateExamModal
          allQuestions={allQuestions}
          onSave={handleCreateExam}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editTarget && (
        <EditExamModal
          target={editTarget}
          allQuestions={allQuestions}
          onSave={handleUpdateExam}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteExamModal
          exam={deleteTarget}
          onConfirm={handleDeleteExam}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {generateTarget && (
        <GenerateProofsModal
          exam={generateTarget}
          onClose={() => setGenerateTarget(null)}
          onNotify={notify}
        />
      )}

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
