import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

router.use('/health', healthRoutes);

// Future routes (to be added as features are implemented):
// router.use('/questions', questionsRoutes);
// router.use('/exams', examsRoutes);
// router.use('/proofs', proofsRoutes);
// router.use('/grading', gradingRoutes);

export default router;
