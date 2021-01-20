import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import { User, UserView } from '../models/User';
import { generateToken } from '../utils/token';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send({ error: 'email and password are required' });

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).send({ error: 'Login or password not found' });

  return res.send({
    user: UserView.render(user),
    token: generateToken(user)
});
}