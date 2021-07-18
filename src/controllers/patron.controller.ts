import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { RECORDS_PER_PAGE } from '../constants';
import { IPatron, IPatronQuery, Patron, PatronView } from '../models/Patron';
import { Subscriber } from '../models/Subscriber';
import { verifyMandatoryFields } from '../utils/fields';

export async function register(req: Request, res: Response) {
  const { email } = req.body;
  const fieldError = verifyMandatoryFields({ email });
  if (fieldError)
    return res.status(400).send({ error: fieldError });

  try {
    const patron = await Patron.create({ email });
    await Subscriber.updateOne({ email }, { isPatron: true });
    return res.status(200).send({
      patron: PatronView.render(patron)
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
  let $or: IPatronQuery[] = [];
  if (q) {
    $or.push({ email: new RegExp(q, 'i') });
    query = { $or };
  }

  const patrons = await Patron.find(query).limit(RECORDS_PER_PAGE).skip(skip);
  const total = await Patron.countDocuments(query);
  return res.status(200).send({
    patrons: patrons.map((patron: IPatron) => PatronView.render(patron)),
    total
  });
}

export async function getOne(req: Request, res: Response) {

  const { id } = req.params;

  if (!isValidObjectId(id))
    return res.status(400).send({ error: 'Invalid id' });

  const patron = await Patron.findById(id);
  if (!patron)
    return res.status(200).send({ patron: null });

  return res.status(200).send({
    patron: PatronView.render(patron)
  });

}

export async function deleteOne(req: Request, res: Response) {

  const { id } = req.params;

  if (!isValidObjectId(id))
    return res.status(400).send({ error: 'Invalid id' });

  const patron = await Patron.findByIdAndDelete(id);
  await Subscriber.updateOne({ email: patron?.email }, { isPatron: false });
  if (!patron)
    return res.status(200).send({ patron: null });

  return res.status(200).send({
    patron: PatronView.render(patron)
  });

}