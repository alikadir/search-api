import { NextApiRequest, NextApiResponse } from 'next';
import { switchAliasToLatestIndex } from '../../../../services/elasticSearchService';

interface CustomRequestType extends NextApiRequest {
  query: { indexid: string; vendorid: string };
}
type ResponseType = {
  vendorId: string;
  indexId: string;
  totalItemCount: number;
  indexSize: string;
};
export default async function handler(
  req: CustomRequestType,
  res: NextApiResponse<ResponseType>
) {
  const { vendorid, indexid } = req.query;
  const switchAliasResult = await switchAliasToLatestIndex(vendorid);

  res.json({
    vendorId: vendorid,
    indexId: indexid,
    totalItemCount: switchAliasResult.totalItemCount,
    indexSize: switchAliasResult.indexSize,
  });
}
