export function useAlternativeItem(index: number) {
  const letter = String.fromCharCode(65 + index);

  return { letter };
}
