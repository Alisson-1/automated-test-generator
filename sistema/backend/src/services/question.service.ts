import { randomUUID } from 'crypto';
import { QuestionRepository } from '../repositories/question.repository';
import { CreateQuestionDTO, Question } from '../types/question.types';
import { ValidationError } from '../utils/errors';

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

    const now = new Date().toISOString();

    return this.repository.create({
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }
}
