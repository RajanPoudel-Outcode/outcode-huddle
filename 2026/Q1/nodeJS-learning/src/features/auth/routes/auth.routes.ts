import { AuthController } from '@/features/auth/controllers/auth.controller';
import { authMiddleware } from '@/features/auth/middlewares/auth.middleware';
import { upload } from '@/shared/middlewares/image-upload.middleware';
import express, { Router } from 'express';

const router: Router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/signup', upload.single('image'), authController.signup.bind(authController));
router.post('/signin',  authController.signin.bind(authController));
router.post('/verify-token', authController.verifyToken.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile.bind(authController));
router.put('/profile', authMiddleware, upload.single('image'), authController.updateProfile.bind(authController));
router.post('/logout', authMiddleware, authController.logout.bind(authController));
router.post('/change-password', authMiddleware, authController.changePassword.bind(authController));

export default router;
