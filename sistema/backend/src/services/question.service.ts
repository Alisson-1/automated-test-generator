import { randomUUID } from 'crypto';
import { QuestionRepository } from '../repositories/question.repository';
import { ExamRepository } from '../repositories/exam.repository';
import { CreateQuestionDTO, UpdateQuestionDTO, Question, BulkCreateResult } from '../types/question.types';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

export interface DeleteQuestionResult {
  unlinkedExams: string[];
  deletedExams: string[];
}

export class QuestionService {
  constructor(
    private repository: QuestionRepository,
    private examRepository: ExamRepository,
  ) {}

  getAll(): Question[] {
    return this.repository.findAll();
  }

  create(data: CreateQuestionDTO): Question {
    if (!data.alternatives || data.alternatives.length < 2) {
      throw new ValidationError('A question must have at least 2 alternatives');
    }

    const correctCount = data.alternatives.filter((alt) => alt.correct).length;
    if (correctCount !== 1) {
      throw new ValidationError('A question must have exactly one correct alternative');
    }

    const descriptions = data.alternatives.map((alt) => alt.description.trim().toLowerCase());
    const hasDuplicateAlternatives = descriptions.length !== new Set(descriptions).size;
    if (hasDuplicateAlternatives) {
      throw new ValidationError('Alternatives must have unique descriptions');
    }

    const statementNormalized = data.statement.trim().toLowerCase();
    const existing = this.repository.findAll();
    const duplicateStatement = existing.some(
      (q) => q.statement.trim().toLowerCase() === statementNormalized
    );
    if (duplicateStatement) {
      throw new ConflictError('A question with this statement already exists');
    }

    const now = new Date().toISOString();

    return this.repository.create({
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  updateQuestion(id: string, data: UpdateQuestionDTO): Question {
    const existingQuestion = this.repository.findById(id);
    if (!existingQuestion) throw new NotFoundError('Question not found');

    const newQuestionStatement = data.statement ?? existingQuestion.statement;
    const newQuestionAlternatives = data.alternatives ?? existingQuestion.alternatives.map((alternative) => ({
      description: alternative.description,
      correct: alternative.correct,
    }));

    if (newQuestionAlternatives.length < 2) {
      throw new ValidationError('A question must have at least 2 alternatives');
    }
    const correctCount = newQuestionAlternatives.filter((a) => a.correct).length;
    if (correctCount !== 1) {
      throw new ValidationError('A question must have exactly one correct alternative');
    }
    const descriptions = newQuestionAlternatives.map((newAlternative) => newAlternative.description.trim().toLowerCase());
    if (descriptions.length !== new Set(descriptions).size) {
      throw new ValidationError('Alternatives must have unique descriptions');
    }

    if (newQuestionStatement.trim().toLowerCase() !== existingQuestion.statement.trim().toLowerCase()) {
      const duplicate = this.repository.findAll().some(
        (q) => q.id !== id && q.statement.trim().toLowerCase() === newQuestionStatement.trim().toLowerCase(),
      );
      if (duplicate) throw new ConflictError('A question with this statement already exists');
    }

    const now = new Date().toISOString();
    return this.repository.update(id, (q) => ({
      ...q,
      statement: newQuestionStatement,
      alternatives: newQuestionAlternatives.map((alt, i) => ({
        id: q.alternatives[i]?.id ?? `${q.id}-${i}`,
        description: alt.description,
        correct: alt.correct,
      })),
      updatedAt: now,
    }))!;
  }

  updateStatement(id: string, statement: string): Question {
    const existing = this.repository.findById(id);
    if (!existing) throw new NotFoundError('Question not found');

    if (statement.trim().toLowerCase() !== existing.statement.trim().toLowerCase()) {
      const duplicate = this.repository.findAll().some(
        (q) => q.id !== id && q.statement.trim().toLowerCase() === statement.trim().toLowerCase(),
      );
      if (duplicate) throw new ConflictError('A question with this statement already exists');
    }

    const now = new Date().toISOString();
    return this.repository.update(id, (q) => ({ ...q, statement, updatedAt: now }))!;
  }

  updateAlternativeDescription(questionId: string, altId: string, description: string): Question {
    const existing = this.repository.findById(questionId);
    if (!existing) throw new NotFoundError('Question not found');

    const altIndex = existing.alternatives.findIndex((a) => a.id === altId);
    if (altIndex === -1) throw new NotFoundError('Alternative not found');

    const otherDescriptions = existing.alternatives
      .filter((a) => a.id !== altId)
      .map((a) => a.description.trim().toLowerCase());
    if (otherDescriptions.includes(description.trim().toLowerCase())) {
      throw new ValidationError('Alternative description must be unique within the question');
    }

    const now = new Date().toISOString();
    return this.repository.update(questionId, (q) => ({
      ...q,
      alternatives: q.alternatives.map((a, i) =>
        i === altIndex ? { ...a, description } : a,
      ),
      updatedAt: now,
    }))!;
  }

  addAlternative(questionId: string, data: { description: string; correct: boolean }): Question {
    const existing = this.repository.findById(questionId);
    if (!existing) throw new NotFoundError('Question not found');

    const descriptionNormalized = data.description.trim().toLowerCase();
    const hasDuplicate = existing.alternatives.some(
      (a) => a.description.trim().toLowerCase() === descriptionNormalized,
    );
    if (hasDuplicate) throw new ValidationError('Alternative description must be unique within the question');

    const newAlt = { id: randomUUID(), description: data.description.trim(), correct: data.correct };
    const now = new Date().toISOString();

    return this.repository.update(questionId, (q) => ({
      ...q,
      alternatives: data.correct
        ? [...q.alternatives.map((a) => ({ ...a, correct: false })), newAlt]
        : [...q.alternatives, newAlt],
      updatedAt: now,
    }))!;
  }

  deleteQuestion(id: string): DeleteQuestionResult {
    const question = this.repository.findById(id);
    if (!question) throw new NotFoundError('Question not found');

    const allExams = this.examRepository.findAll();
    const affectedExams = allExams.filter((e) => e.questionIds.includes(id));

    const unlinkedExams: string[] = [];
    const deletedExams: string[] = [];

    const now = new Date().toISOString();
    for (const exam of affectedExams) {
      const remaining = exam.questionIds.filter((qId) => qId !== id);
      if (remaining.length === 0) {
        this.examRepository.delete(exam.id);
        deletedExams.push(exam.title);
      } else {
        this.examRepository.update(exam.id, (e) => ({ ...e, questionIds: remaining, updatedAt: now }));
        unlinkedExams.push(exam.title);
      }
    }

    this.repository.delete(id);
    return { unlinkedExams, deletedExams };
  }

  deleteAlternative(questionId: string, altId: string): Question {
    const existingQuestion = this.repository.findById(questionId);
    if (!existingQuestion) throw new NotFoundError('Question not found');

    const alternative = existingQuestion.alternatives.find((a) => a.id === altId);
    if (!alternative) throw new NotFoundError('Alternative not found');

    if (alternative.correct) {
      throw new ValidationError('Cannot remove the correct alternative');
    }

    if (existingQuestion.alternatives.length <= 2) {
      throw new ValidationError('Cannot remove alternative: question must retain at least 2 alternatives');
    }

    const now = new Date().toISOString();
    return this.repository.update(questionId, (q) => ({
      ...q,
      alternatives: q.alternatives.filter((a) => a.id !== altId),
      updatedAt: now,
    }))!;
  }

  bulkCreate(items: CreateQuestionDTO[]): BulkCreateResult {
    const created: Question[] = [];
    const failed: BulkCreateResult['failed'] = [];
    const createdStatements = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      const data = items[i];
      const statement = data.statement?.trim() ?? '';

      try {
        if (!data.alternatives || data.alternatives.length < 2) {
          throw new ValidationError('A question must have at least 2 alternatives');
        }
        const correctCount = data.alternatives.filter((alt) => alt.correct).length;
        if (correctCount !== 1) {
          throw new ValidationError('A question must have exactly one correct alternative');
        }
        const descriptions = data.alternatives.map((alt) => alt.description.trim().toLowerCase());
        if (descriptions.length !== new Set(descriptions).size) {
          throw new ValidationError('Alternatives must have unique descriptions');
        }

        const statementNormalized = statement.toLowerCase();
        if (createdStatements.has(statementNormalized)) {
          throw new ConflictError('A question with this statement already exists');
        }
        const existing = this.repository.findAll();
        if (existing.some((q) => q.statement.trim().toLowerCase() === statementNormalized)) {
          throw new ConflictError('A question with this statement already exists');
        }

        const now = new Date().toISOString();
        const question = this.repository.create({
          ...data,
          id: randomUUID(),
          createdAt: now,
          updatedAt: now,
        });
        created.push(question);
        createdStatements.add(statementNormalized);
      } catch (error: unknown) {
        failed.push({
          index: i,
          statement,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { created, failed };
  }
}
