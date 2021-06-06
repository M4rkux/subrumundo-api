import { Router } from 'express';
import { getOne, list, register } from '../controllers/subscriber.controller';
import auth from '../middlewares/auth';

const router = Router();

router.post('/', register);
router.get('/', auth, list)
router.get('/:id', auth, getOne);

export default router;
