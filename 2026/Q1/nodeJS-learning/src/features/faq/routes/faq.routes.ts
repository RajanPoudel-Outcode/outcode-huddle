import adminMiddleware from '@/features/admin/middlewares/admin.middleware';
import { FaqController } from '@/features/faq/controllers/faq.controller';
import express, { Router } from 'express';

const router: Router = express.Router();
const faqController = new FaqController();

// Public
router.get('/', faqController.getFaqs.bind(faqController));

// Admin
router.post('/', adminMiddleware, faqController.createFaq.bind(faqController));
router.put('/:id', adminMiddleware, faqController.updateFaq.bind(faqController));
router.delete('/:id', adminMiddleware, faqController.deleteFaq.bind(faqController));

export default router;
