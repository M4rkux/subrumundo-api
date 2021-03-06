import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { RECORDS_PER_PAGE } from '../constants';
import { User, UserView, IUser, IUserQuery, IUserParams } from '../models/User';
import { verifyMandatoryFields } from '../utils/fields';

export async function register(req: Request, res: Response) {

  const { email, name, password } = req.body;
  const fieldError = verifyMandatoryFields({ email, name, password });
  if (fieldError)
    return res.status(400).send({ error: fieldError });

  try {
    const user = await User.create({ email, name, password });
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
  const skip = (page - 1) * RECORDS_PER_PAGE;

  let query = {};
  let $or: IUserQuery[] = [];
  if (q) {
    $or.push({ name: new RegExp(q, 'i') });
    $or.push({ email: new RegExp(q, 'i') });
    query = { $or };
  }

  const users = await User.find(query).limit(RECORDS_PER_PAGE).skip(skip);
  const total = await User.countDocuments(query);
  return res.status(200).send({
    users: users.map((user: IUser) => UserView.render(user)),
    total
  });
}

export async function getOne(req: Request, res: Response) {

  const { id } = req.params;

  if (!isValidObjectId(id))
    return res.status(400).send({ error: 'Invalid id' });

  const user = await User.findById(id);
  if (!user)
    return res.status(200).send({ user: null });

  return res.status(200).send({
    user: UserView.render(user)
  });

}

export async function deleteOne(req: Request, res: Response) {

  const { id } = req.params;

  if (!isValidObjectId(id))
    return res.status(400).send({ error: 'Invalid id' });

  const user = await User.findByIdAndDelete(id);
  if (!user)
    return res.status(200).send({ user: null });

  return res.status(200).send({
    user: UserView.render(user)
  });

}

export async function updateOne(req: Request, res: Response) {

  const { id } = req.params;
  const newUserData = _purgeUserData(req.body);

  if (!isValidObjectId(id))
    return res.status(400).send({ error: 'Invalid id' });

  const user = await User.findByIdAndUpdate(id, newUserData);
  if (!user)
    return res.status(200).send({ user: null });

  return res.status(200).send({
    user: UserView.render(user)
  });

}

function _purgeUserData(userData: IUserParams) {
  if (!userData.name)
    delete userData.name;
  if (!userData.email)
    delete userData.email;
  if (!userData.password)
    delete userData.password;

  return userData;
}