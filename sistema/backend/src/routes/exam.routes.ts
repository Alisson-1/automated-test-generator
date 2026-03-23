import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ExamController } from '../controllers/exam.controller';
import { ExamService } from '../services/exam.service';
import { ExamRepository } from '../repositories/exam.repository';
import { QuestionRepository } from '../repositories/question.repository';
import { ValidationError } from '../utils/errors';

const router = Router();

const identifierModeSchema = z.enum(['letters', 'powers-of-2'], {
  errorMap: () => ({ message: 'identifierMode must be "letters" or "powers-of-2"' }),
});

const createExamSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  questionIds: z.array(z.string().min(1)).min(1, 'At least one question is required'),
  identifierMode: identifierModeSchema,
});

const updateExamSchema = z
  .object({
    title: z.string().min(1, 'Title must not be empty').optional(),
    questionIds: z.array(z.string().min(1)).min(1, 'At least one question is required').optional(),
    identifierMode: identifierModeSchema.optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.questionIds !== undefined ||
      data.identifierMode !== undefined,
    { message: 'At least one field (title, questionIds, or identifierMode) must be provided' },
  );

function validateBody(schema: z.ZodTypeAny) {
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

const examRepository = new ExamRepository();
const questionRepository = new QuestionRepository();
const examService = new ExamService(examRepository, questionRepository);
const examController = new ExamController(examService);

router.get('/', examController.getAll);
router.get('/:id', examController.getById);
router.post('/', validateBody(createExamSchema), examController.create);
router.patch('/:id', validateBody(updateExamSchema), examController.update);
router.delete('/:id', examController.delete);

export default router;
