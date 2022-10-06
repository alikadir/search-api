import { NextApiRequest, NextApiResponse } from 'next';
import { search } from '../../../services/elasticSearchService';

interface CustomRequestType extends NextApiRequest {
  query: { vendorid: string };
}

export default async function handler(
  req: CustomRequestType,
  res: NextApiResponse
) {
  const { vendorid } = req.query;
  const result = await search(vendorid, req.body);
  res.json(result);
}
