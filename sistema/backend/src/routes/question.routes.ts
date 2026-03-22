import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { QuestionController } from '../controllers/question.controller';
import { QuestionService } from '../services/question.service';
import { QuestionRepository } from '../repositories/question.repository';
import { ValidationError } from '../utils/errors';

const router = Router();

const alternativeQuestionSchema = z.object({
  description: z.string().min(1, 'Alternative description is required'),
  correct: z.boolean(),
});

const createQuestionSchema = z.object({
  statement: z.string().min(1, 'Statement is required'),
  alternatives: z.array(alternativeQuestionSchema).min(2, 'At least 2 alternatives are required'),
});

function validateCreateQuestionBody(schema: z.ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ValidationError('Validation failed', errors));
    }
    req.body = result.data;
    next();
  };
}

const questionRepository = new QuestionRepository();
const questionService = new QuestionService(questionRepository);
const questionController = new QuestionController(questionService);

router.post('/', validateCreateQuestionBody(createQuestionSchema), questionController.create);

export default router;
