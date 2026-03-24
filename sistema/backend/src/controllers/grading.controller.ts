import { Request, Response, NextFunction } from 'express';
import { GradingService } from '../services/grading.service';

export class GradingController {
  constructor(private service: GradingService) {}

  grade = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.gradeExam(req.body);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };
}
