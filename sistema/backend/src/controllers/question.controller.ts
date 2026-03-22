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

  updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question = this.service.updateQuestion(req.params.id, req.body);
      res.json({ status: 'success', data: question });
    } catch (error) {
      next(error);
    }
  };

  updateStatement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question = this.service.updateStatement(req.params.id, req.body.statement);
      res.json({ status: 'success', data: question });
    } catch (error) {
      next(error);
    }
  };

  updateAlternativeDescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question = this.service.updateAlternativeDescription(
        req.params.id,
        req.params.altId,
        req.body.description,
      );
      res.json({ status: 'success', data: question });
    } catch (error) {
      next(error);
    }
  };

  deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.service.deleteQuestion(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  deleteAlternative = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question = this.service.deleteAlternative(req.params.id, req.params.altId);
      res.json({ status: 'success', data: question });
    } catch (error) {
      next(error);
    }
  };
}
