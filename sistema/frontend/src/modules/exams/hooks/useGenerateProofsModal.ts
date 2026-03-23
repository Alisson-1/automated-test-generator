import { useState, useCallback } from 'react';
import { examsApi } from '@/service/endpoint/exams';
import type { GenerateProofsInput } from '@/service/endpoint/exams';

interface Props {
  examId: string;
  examTitle: string;
  onClose: () => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

export function useGenerateProofsModal({ examId, examTitle, onClose, onNotify }: Props) {
  const today = new Date().toISOString().split('T')[0];

  const [count, setCount] = useState(1);
  const [discipline, setDiscipline] = useState('');
  const [teacher, setTeacher] = useState('');
  const [date, setDate] = useState(today);
  const [institution, setInstitution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!discipline.trim()) { setError('Discipline is required'); return; }
      if (!teacher.trim()) { setError('Teacher is required'); return; }
      if (!date.trim()) { setError('Date is required'); return; }

      setLoading(true);
      try {
        const data: GenerateProofsInput = {
          count,
          header: {
            discipline: discipline.trim(),
            teacher: teacher.trim(),
            date: date.trim(),
            institution: institution.trim() || undefined,
          },
        };

        const result = await examsApi.generateProofs(examId, data);
        const slug = examTitle.replace(/\s+/g, '_').toLowerCase();

        downloadBlob(
          new Blob([base64ToArrayBuffer(result.pdf)], { type: 'application/pdf' }),
          `${slug}_provas.pdf`,
        );
        downloadBlob(new Blob([result.csv], { type: 'text/csv' }), `${slug}_gabarito.csv`);

        onNotify(`${count} proof${count > 1 ? 's' : ''} generated successfully!`, 'success');
        onClose();
      } catch (e: unknown) {
        setError((e as Error).message ?? 'Failed to generate proofs');
      } finally {
        setLoading(false);
      }
    },
    [count, discipline, teacher, date, institution, examId, examTitle, onClose, onNotify],
  );

  return {
    count, setCount,
    discipline, setDiscipline,
    teacher, setTeacher,
    date, setDate,
    institution, setInstitution,
    loading,
    error,
    handleSubmit,
  };
}
