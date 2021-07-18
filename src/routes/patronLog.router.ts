import { Router } from 'express';
import { list } from '../controllers/patronLog.controller';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, list)

export default router;
