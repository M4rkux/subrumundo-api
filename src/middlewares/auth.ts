import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import authConfig from '../config/authConfig';

type Indexed = {
  [key: string]: any;
};

export default (req: any, res: Response, next: NextFunction) => {

  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).send({ error: 'No token provided' });

  const parts = authHeader.split(' ');

  if (parts.length !== 2)
    return res.status(401).send({ error: 'Token error' });

  const [scheme, token] = parts;

  if (!/^Bearer$/.test(scheme))
    return res.status(401).send({ error: 'Token malformatted' });


  jwt.verify(token, authConfig.secret, (err: JsonWebTokenError | null, decoded: Indexed | undefined) => {
    if (err) return res.status(401).send({ error: 'Token invalid' });

    if (decoded) {
      req.userId = decoded.id;
    }
    next();
  });
};