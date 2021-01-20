import { Router } from 'express';
import { register } from '../controllers/user.controller';
import auth from '../middlewares/auth';

const router = Router();

router.post('/', auth, register);

export default router;
