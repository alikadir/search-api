import { NextApiRequest, NextApiResponse } from 'next';
import { analyzerList } from '../../services/elasticSearchService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<[string]>
) {
  res.json(analyzerList as [string]);
}
