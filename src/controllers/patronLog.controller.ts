import { Request, Response } from 'express';
import { RECORDS_PER_PAGE } from '../constants';
import { IPatronLog, IPatronLogQuery, PatronLog, PatronLogView } from '../models/PatronLog';

export async function list(req: Request, res: Response) {

  const q = req.query.q?.toString();
  const page = Number(req.query.page) <= 0 ? 1 : Number(req.query.page);
  const skip = (page - 1) * RECORDS_PER_PAGE;

  let query = {};
  let $or: IPatronLogQuery[] = [];
  if (q) {
    $or.push({ email: new RegExp(q, 'i') });
    query = { $or };
  }

  const patronLogs = await PatronLog.find(query).limit(RECORDS_PER_PAGE).skip(skip);
  const total = await PatronLog.countDocuments(query);
  return res.status(200).send({
    patronLogs: patronLogs.map((patronLog: IPatronLog) => PatronLogView.render(patronLog)),
    total
  });
}

