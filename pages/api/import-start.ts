import { NextApiRequest, NextApiResponse } from 'next';
import {
  createIndex,
  MappingPropertiesType,
} from '../../services/elasticSearchService';

interface CustomRequestType extends NextApiRequest {
  body: {
    vendorId: string;
    fields?: MappingPropertiesType;
  };
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
  const vendorId = req.body.vendorId;
  const mappings = req.body.fields;
  const createIndexResult = await createIndex(
    vendorId,
    mappings as MappingPropertiesType
  );

  res.json({
    vendorId,
    indexId: createIndexResult.indexName,
    indexCreateDateISO: new Date().toISOString(),
    lastIndexId: createIndexResult.lastIndexName,
    lastIndexCreateDateISO: createIndexResult.lastIndexCreateDate,
  });
}
