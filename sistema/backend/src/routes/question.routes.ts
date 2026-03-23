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


const updateQuestionSchema = z
  .object({
    statement: z.string().min(1, 'Statement must not be empty').optional(),
    alternatives: z.array(alternativeQuestionSchema).min(2, 'At least 2 alternatives are required').optional(),
  })
  .refine((data) => data.statement !== undefined || data.alternatives !== undefined, {
    message: 'At least one field (statement or alternatives) must be provided',
  });

const addAlternativeSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  correct: z.boolean(),
});

const updateStatementSchema = z.object({
  statement: z.string().min(1, 'Statement is required'),
});

const updateAlternativeDescriptionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
});

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

const questionRepository = new QuestionRepository();
const questionService = new QuestionService(questionRepository);
const questionController = new QuestionController(questionService);

router.get('/', questionController.getAll);
router.post('/', validateBody(createQuestionSchema), questionController.create);

router.post('/:id/alternatives', validateBody(addAlternativeSchema), questionController.addAlternative);
router.patch('/:id', validateBody(updateQuestionSchema), questionController.updateQuestion);
router.patch('/:id/statement', validateBody(updateStatementSchema), questionController.updateStatement);
router.patch('/:id/alternatives/:altId', validateBody(updateAlternativeDescriptionSchema), questionController.updateAlternativeDescription);

router.delete('/:id', questionController.deleteQuestion);
router.delete('/:id/alternatives/:altId', questionController.deleteAlternative);

export default router;
