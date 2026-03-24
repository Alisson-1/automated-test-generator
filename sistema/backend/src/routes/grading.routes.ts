import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GradingController } from '../controllers/grading.controller';
import { GradingService } from '../services/grading.service';
import { ValidationError } from '../utils/errors';

const router = Router();

const gradeExamSchema = z.object({
  answerKeyCsv: z.string().min(1, 'answerKeyCsv is required'),
  studentResponsesCsv: z.string().min(1, 'studentResponsesCsv is required'),
  gradingMode: z.enum(['strict', 'lenient'], {
    errorMap: () => ({ message: 'gradingMode must be "strict" or "lenient"' }),
  }),
  examValue: z.number().positive('examValue must be a positive number').optional(),
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

const gradingService = new GradingService();
const gradingController = new GradingController(gradingService);

router.post('/', validateBody(gradeExamSchema), gradingController.grade);

export default router;
