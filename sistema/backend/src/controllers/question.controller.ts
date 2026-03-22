import { Request, Response, NextFunction } from 'express';
import { QuestionService } from '../services/question.service';

export class QuestionController {
  constructor(private service: QuestionService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question = this.service.create(req.body);
      res.status(201).json({ status: 'success', data: question });
    } catch (error) {
      next(error);
    }
  };
}
