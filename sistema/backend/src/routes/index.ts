import { Router } from 'express';
import healthRoutes from './health.routes';
import questionRoutes from './question.routes';
import examRoutes from './exam.routes';
import gradingRoutes from './grading.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/questions', questionRoutes);
router.use('/exams', examRoutes);
router.use('/grade', gradingRoutes);

export default router;
