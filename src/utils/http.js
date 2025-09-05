import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export const ok = (res, data = {}) => res.status(StatusCodes.OK).json(data);
export const created = (res, data = {}) => res.status(StatusCodes.CREATED).json(data);
export const bad = (res, msg = getReasonPhrase(StatusCodes.BAD_REQUEST)) =>
  res.status(StatusCodes.BAD_REQUEST).json({ error: msg });
export const unauthorized = (res, msg = getReasonPhrase(StatusCodes.UNAUTHORIZED)) =>
  res.status(StatusCodes.UNAUTHORIZED).json({ error: msg });
export const forbidden = (res, msg = getReasonPhrase(StatusCodes.FORBIDDEN)) =>
  res.status(StatusCodes.FORBIDDEN).json({ error: msg });
export const notFound = (res, msg = getReasonPhrase(StatusCodes.NOT_FOUND)) =>
  res.status(StatusCodes.NOT_FOUND).json({ error: msg });
