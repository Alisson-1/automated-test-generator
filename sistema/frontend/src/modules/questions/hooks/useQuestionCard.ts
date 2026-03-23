export function useQuestionCard() {
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

  return { formatDate };
}
