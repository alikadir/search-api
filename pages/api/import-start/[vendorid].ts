import { NextApiRequest, NextApiResponse } from 'next';
import { createIndex } from '../../../services/elasticSearchService';

interface CustomRequestType extends NextApiRequest {
  body: [any];
  query: { vendorid: string };
}
type ResponseType = {
  vendorId: string;
  indexId: string;
  lastIndexId: string;
  indexCreateDateISO: string;
  lastIndexCreateDateISO: string;
};

export default async function handler(
  req: CustomRequestType,
  res: NextApiResponse<ResponseType>
) {
  const vendorId = req.query.vendorid;
  const createIndexResult = await createIndex(vendorId);

  res.json({
    vendorId,
    indexId: createIndexResult.indexName,
    indexCreateDateISO: new Date().toISOString(),
    lastIndexId: createIndexResult.lastIndexName,
    lastIndexCreateDateISO: createIndexResult.lastIndexCreateDate,
  });
}
