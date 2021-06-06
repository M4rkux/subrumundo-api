import { Router } from 'express';
import { register, list, getOne, deleteOne, updateOne } from '../controllers/user.controller';
import auth from '../middlewares/auth';

const router = Router();

router.post('/', auth, register);
router.get('/', auth, list);
router.get('/:id', auth, getOne);
router.delete('/:id', auth, deleteOne);
router.put('/:id', auth, updateOne);

export default router;
