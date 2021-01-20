import { Request, Response } from 'express';
import { User, UserView } from '../models/User';

export async function register(req: Request, res: Response) {

  const { email, name, password } = req.body;
  const fieldError = _verifyMandatoryFields(email, name, password);
  if (fieldError)
    return res.status(400).send({ error: fieldError});

  try {
    const user = await User.create({email, name, password});
    return res.status(200).send({
      user: UserView.render(user)
    });
  } catch (err) {
    return res.status(400).send({ error: 'Registration failed' });
  }

}

function _verifyMandatoryFields(email: string, name: string, password: string) {
  if (!email)
    return 'Email is a mandatory field';

  if (!name)
    return 'Name is a mandatory field';
    
  if (!password)
    return 'Password is a mandatory field';
  
  return null;
}