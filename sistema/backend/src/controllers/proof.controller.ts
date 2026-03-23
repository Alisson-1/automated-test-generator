import { Request, Response, NextFunction } from 'express';
import { ProofService } from '../services/proof.service';

export class ProofController {
  constructor(private service: ProofService) {}

  generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.generate(req.params.id, req.body);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };
}
