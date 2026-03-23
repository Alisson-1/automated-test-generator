import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuestions } from '../hooks/useQuestions';
import { QuestionList } from '../components/QuestionList';
import { EditStatementModal } from '../components/EditStatementModal';
import { EditAlternativeModal } from '../components/EditAlternativeModal';
import { DeleteQuestionModal } from '../components/DeleteQuestionModal';
import { CreateQuestionModal } from '../components/CreateQuestionModal';
import { AddAlternativeModal } from '../components/AddAlternativeModal';

export default function QuestionsView() {
  const {
    questions,
    totalCount,
    loading,
    search,
    setSearch,
    notification,
    showCreate,
    setShowCreate,
    editStatementTarget,
    setEditStatementTarget,
    editAlternativeTarget,
    setEditAlternativeTarget,
    addAlternativeTarget,
    setAddAlternativeTarget,
    deleteTarget,
    setDeleteTarget,
    handleCreateQuestion,
    handleAddAlternative,
    handleUpdateStatement,
    handleUpdateAlternativeDescription,
    handleToggleCorrect,
    handleDeleteQuestion,
    handleDeleteAlternative,
  } = useQuestions();

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
      <QuestionList
        questions={questions}
        totalCount={totalCount}
        search={search}
        onSearchChange={setSearch}
        onNewQuestion={() => setShowCreate(true)}
        onEditStatement={(questionId, statement) => setEditStatementTarget({ questionId, statement })}
        onDeleteQuestion={(q) => setDeleteTarget(q)}
        onEditAlternative={(questionId, altId, description) =>
          setEditAlternativeTarget({ questionId, altId, description })
        }
        onAddAlternative={(questionId) => setAddAlternativeTarget({ questionId })}
        onToggleCorrect={handleToggleCorrect}
        onDeleteAlternative={handleDeleteAlternative}
      />

      {showCreate && (
        <CreateQuestionModal
          onSave={handleCreateQuestion}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editStatementTarget && (
        <EditStatementModal
          questionId={editStatementTarget.questionId}
          initialStatement={editStatementTarget.statement}
          onSave={handleUpdateStatement}
          onClose={() => setEditStatementTarget(null)}
        />
      )}

      {editAlternativeTarget && (
        <EditAlternativeModal
          questionId={editAlternativeTarget.questionId}
          altId={editAlternativeTarget.altId}
          initialDescription={editAlternativeTarget.description}
          onSave={handleUpdateAlternativeDescription}
          onClose={() => setEditAlternativeTarget(null)}
        />
      )}

      {addAlternativeTarget && (
        <AddAlternativeModal
          questionId={addAlternativeTarget.questionId}
          onSave={handleAddAlternative}
          onClose={() => setAddAlternativeTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteQuestionModal
          question={deleteTarget}
          onConfirm={handleDeleteQuestion}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {notification && (
        <div
          className={cn(
            'fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all',
            notification.type === 'success'
              ? 'bg-slate-900 text-white'
              : 'bg-red-600 text-white',
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
