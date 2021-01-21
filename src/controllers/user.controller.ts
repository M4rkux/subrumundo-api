import { Request, Response } from 'express';
import { LIMIT } from '../constants';
import { User, UserView, IUser, IUserQuery } from '../models/User';

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

export async function list(req: Request, res: Response) {

  const q = req.query.q?.toString();
  const page = Number(req.query.page) <= 0 ? 1 : Number(req.query.page);
  const skip = (page - 1) * LIMIT;

  let query = {};
  let $or: IUserQuery[] = [];
  if (q) {
    $or.push({name: new RegExp(q, 'i')});
    $or.push({email: new RegExp(q, 'i')});
    query = {$or};
  }

  const users = await User.find(query).limit(LIMIT).skip(skip);
  return res.status(200).send({
    users : users.map((user: IUser) => UserView.render(user))
  });
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