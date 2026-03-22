import { Router } from 'express';
import healthRoutes from './health.routes';
import questionRoutes from './question.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/questions', questionRoutes);


export default router;
