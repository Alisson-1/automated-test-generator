import { Request, Response, NextFunction } from 'express';
import { ExamService } from '../services/exam.service';

export class ExamController {
  constructor(private service: ExamService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exams = this.service.getAll();
      res.json({ status: 'success', data: exams });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exam = this.service.getById(req.params.id);
      res.json({ status: 'success', data: exam });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exam = this.service.create(req.body);
      res.status(201).json({ status: 'success', data: exam });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exam = this.service.update(req.params.id, req.body);
      res.json({ status: 'success', data: exam });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
