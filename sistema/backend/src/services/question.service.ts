import { randomUUID } from 'crypto';
import { QuestionRepository } from '../repositories/question.repository';
import { CreateQuestionDTO, Question } from '../types/question.types';
import { ConflictError, ValidationError } from '../utils/errors';

export class QuestionService {
  constructor(private repository: QuestionRepository) {}

  create(data: CreateQuestionDTO): Question {
    if (!data.alternatives || data.alternatives.length < 2) {
      throw new ValidationError('A question must have at least 2 alternatives');
    }

    const hasCorrect = data.alternatives.some((alt) => alt.correct);
    if (!hasCorrect) {
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
}
