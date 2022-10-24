import { NextApiRequest, NextApiResponse } from 'next';
import { bulkInsert } from '../../../services/elasticSearchService';

interface CustomRequestType extends NextApiRequest {
  body: [any];
  query: { indexid: string };
}
type ResponseType = {
  indexId: string;
  incomingItemCount: number;
  totalItemCount: number;
  indexSize: string;
};

export default async function handler(
  req: CustomRequestType,
  res: NextApiResponse<ResponseType>
) {
  const indexId = req.query.indexid;
  const list = req.body;
  const bulkInsertResult = await bulkInsert(indexId, list);

  res.json({
    indexId: bulkInsertResult.indexName,
    incomingItemCount: bulkInsertResult.incomingItemCount,
    totalItemCount: bulkInsertResult.totalItemCount,
    indexSize: bulkInsertResult.indexSize,
  });
}

// 413 Body exceeded 1mb limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};
