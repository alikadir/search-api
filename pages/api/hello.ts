import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@elastic/elasticsearch';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = new Client({
    node: 'http://localhost:9200',
  });

  const result = await client.search({
    index: 'my-index',
    query: {
      match: { hello: 'world' },
    },
  });

  res.status(200).json(result.hits);
}
