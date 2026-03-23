import { randomUUID } from 'crypto';
import { ExamRepository } from '../repositories/exam.repository';
import { QuestionRepository } from '../repositories/question.repository';
import { CreateExamDTO, Exam, UpdateExamDTO } from '../types/exam.types';
import { NotFoundError, ValidationError } from '../utils/errors';

export class ExamService {
  constructor(
    private examRepository: ExamRepository,
    private questionRepository: QuestionRepository,
  ) {}

  getAll(): Exam[] {
    return this.examRepository.findAll();
  }

  getById(id: string): Exam {
    const exam = this.examRepository.findById(id);
    if (!exam) throw new NotFoundError('Exam not found');
    return exam;
  }

  create(data: CreateExamDTO): Exam {
    this.validateQuestionIds(data.questionIds);

    const now = new Date().toISOString();
    return this.examRepository.create({
      id: randomUUID(),
      title: data.title.trim(),
      questionIds: data.questionIds,
      identifierMode: data.identifierMode,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(id: string, data: UpdateExamDTO): Exam {
    const existing = this.examRepository.findById(id);
    if (!existing) throw new NotFoundError('Exam not found');

    const questionIds = data.questionIds ?? existing.questionIds;
    if (data.questionIds !== undefined) {
      this.validateQuestionIds(data.questionIds);
    }

    const now = new Date().toISOString();
    return this.examRepository.update(id, (e) => ({
      ...e,
      title: data.title !== undefined ? data.title.trim() : e.title,
      questionIds,
      identifierMode: data.identifierMode ?? e.identifierMode,
      updatedAt: now,
    }))!;
  }

  delete(id: string): void {
    const deleted = this.examRepository.delete(id);
    if (!deleted) throw new NotFoundError('Exam not found');
  }

  private validateQuestionIds(questionIds: string[]): void {
    if (questionIds.length === 0) {
      throw new ValidationError('An exam must have at least one question');
    }

    const uniqueIds = new Set(questionIds);
    if (uniqueIds.size !== questionIds.length) {
      throw new ValidationError('An exam cannot have duplicate questions');
    }

    for (const qId of questionIds) {
      const question = this.questionRepository.findById(qId);
      if (!question) {
        throw new NotFoundError(`Question with id "${qId}" not found`);
      }
    }
  }
}
