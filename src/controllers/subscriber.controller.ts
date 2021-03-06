import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { RECORDS_PER_PAGE } from '../constants';
import { Patron } from '../models/Patron';
import { ISubscriber, ISubscriberQuery, Subscriber, SubscriberView } from '../models/Subscriber';
import { verifyMandatoryFields } from '../utils/fields';

export async function register(req: Request, res: Response) {
  const { email, name, googleId } = req.body;
  const fieldError = verifyMandatoryFields({ email, name, googleId });
  if (fieldError)
    return res.status(400).send({ error: fieldError });

  try {
    const isPatron = !!(await Patron.findOne({ email }));
    const subscriber = await Subscriber.create({ email, name, googleId, isPatron });
    return res.status(200).send({
      subscriber: SubscriberView.render(subscriber)
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
  let $or: ISubscriberQuery[] = [];
  if (q) {
    $or.push({ name: new RegExp(q, 'i') });
    $or.push({ email: new RegExp(q, 'i') });
    query = { $or };
  }

  const subscribers = await Subscriber.find(query).limit(RECORDS_PER_PAGE).skip(skip);
  const total = await Subscriber.countDocuments(query);
  return res.status(200).send({
    subscribers: subscribers.map((subscriber: ISubscriber) => SubscriberView.render(subscriber)),
    total
  });
}

export async function getOne(req: Request, res: Response) {

  const { id } = req.params;

  if (!isValidObjectId(id))
    return res.status(400).send({ error: 'Invalid id' });

  const subscriber = await Subscriber.findById(id);
  if (!subscriber)
    return res.status(200).send({ subscriber: null });

  return res.status(200).send({
    subscriber: SubscriberView.render(subscriber)
  });

}
