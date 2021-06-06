import { Router } from 'express';
import { getOne, list, register, deleteOne } from '../controllers/patron.controller';
import auth from '../middlewares/auth';

const router = Router();

router.post('/',auth, register);
router.get('/', auth, list)
router.get('/:id', auth, getOne);
router.delete('/:id', auth, deleteOne);

export default router;
