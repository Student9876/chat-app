import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { searchUsers, getCurrentUser } from '../controllers/userController';

const router = Router();

router.get('/search', authenticate, searchUsers);
router.get('/currentUser', authenticate, getCurrentUser);

export default router;