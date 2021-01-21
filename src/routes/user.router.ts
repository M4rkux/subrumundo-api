import { Router } from 'express';
import { register, list } from '../controllers/user.controller';
import auth from '../middlewares/auth';

const router = Router();

router.post('/', auth, register);
router.get('/', auth, list);

export default router;
