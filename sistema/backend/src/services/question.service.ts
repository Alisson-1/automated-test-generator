import { randomUUID } from 'crypto';
import { QuestionRepository } from '../repositories/question.repository';
import { CreateQuestionDTO, UpdateQuestionDTO, Question } from '../types/question.types';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

export class QuestionService {
  constructor(private repository: QuestionRepository) {}

  create(data: CreateQuestionDTO): Question {
    if (!data.alternatives || data.alternatives.length < 2) {
      throw new ValidationError('A question must have at least 2 alternatives');
    }

    const hasCorrectAlternative = data.alternatives.some((alt) => alt.correct);
    if (!hasCorrectAlternative) {
      throw new ValidationError('A question must have at least one correct alternative');
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
    if (!newQuestionAlternatives.some((a) => a.correct)) {
      throw new ValidationError('A question must have at least one correct alternative');
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
}
