import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { searchUsers } from '../controllers/userController';

const router = Router();

router.get('/search', authenticate, searchUsers);

export default router;