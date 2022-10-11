import { Client } from '@elastic/elasticsearch';
import _ from 'lodash';

const indexSeparator = '--';
const client = new Client({
  node: 'http://localhost:9200',
});

type ImportReturn = {
  indexName: string;
  incomingItemCount: number;
  totalItemCount: number;
  indexSize: string;
};
type CreateIndexReturn = {
  indexName: string;
  lastIndexName: string;
  lastIndexCreateDate: string;
};
type SwitchAliasReturn = {
  indexName: string;
  totalItemCount: number;
  indexSize: string;
};

export type MappingPropertiesType = Record<
  string,
  {
    type: 'text' | 'integer' | 'boolean' | 'date' | 'double';
    analyzer?: string;
    format?: string;
  }
>;

export const analyzerList = ['turkish_lowercase', 'turkish_uppercase'];

const generateNewIndexId = (aliasName: string) => {
  const clearIsoDateFormat = new Date()
    .toISOString()
    .replaceAll('-', '')
    .replaceAll('T', '')
    .replaceAll(':', '')
    .slice(0, 14); // "YYYYMMDDHHmmss"

  return `${aliasName}${indexSeparator}${clearIsoDateFormat}`;
};

const removeLatestIndex = async (aliasName: string) => {
  const result = await client.cat.indices({
    index: `${aliasName}${indexSeparator}*`,
    format: 'json',
  });

  const indexList = result.map((x) => x.index);
  const sortedIndexList = _.sortBy(indexList).reverse();

  if (sortedIndexList.length > 2) {
    const willDeleteIndexList = sortedIndexList.slice(2);

    await client.indices.delete({
      index: willDeleteIndexList as [string],
    });
  }
};

export const switchAliasToLatestIndex = async (
  aliasName: string
): Promise<SwitchAliasReturn> => {
  const result = await client.cat.indices({
    index: `${aliasName}${indexSeparator}*`,
    format: 'json',
  });
  const indexNameList = result.map((x) => x.index);
  const lastIndex = _.sortBy(indexNameList).reverse()[0]!;
  if (indexNameList.length > 1) {
    await client.indices.deleteAlias({
      index: indexNameList as [string],
      name: aliasName,
    });
  }
  await client.indices.putAlias({ index: lastIndex, name: aliasName });

  const lastIndexInfo = await client.cat.indices({
    index: lastIndex,
    format: 'json',
  });

  return {
    indexName: lastIndexInfo[0].index!,
    totalItemCount: Number(lastIndexInfo[0]['docs.count']),
    indexSize: String(lastIndexInfo[0]['store.size']),
  };
};

export const createIndex = async (
  aliasName: string,
  mappingProperties: MappingPropertiesType
): Promise<CreateIndexReturn> => {
  const newIndexName = generateNewIndexId(aliasName);

  await client.indices.create({
    index: newIndexName,
    settings: {
      analysis: {
        filter: {
          my_ascii_folding: {
            preserve_original: true,
            type: 'asciifolding',
          },
        },
        analyzer: {
          turkish_lowercase: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['lowercase', 'my_ascii_folding'],
          },
          turkish_uppercase: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['uppercase', 'my_ascii_folding'],
          },
        },
      },
    },
    mappings: {
      properties: mappingProperties,
    },
  });
  return {
    indexName: newIndexName,
    lastIndexName: '', // TODO: get last index for alias
    lastIndexCreateDate: '',
  };
};

export const bulkInsert = async (
  indexName: string,
  list: [any]
): Promise<ImportReturn> => {
  const operations = list.flatMap((item) => [
    { index: { _index: indexName } },
    item,
  ]);

  await client.bulk({ refresh: true, operations });

  const indexInfo = await client.cat.indices({
    index: indexName,
    format: 'json',
  });

  return {
    indexName,
    incomingItemCount: list.length,
    totalItemCount: Number(indexInfo[0]['docs.count']),
    indexSize: String(indexInfo[0]['store.size']),
  };
};

export const search = async (aliasName: string, query: any) => {
  const result = await client.search({ index: aliasName, query });
  return result.hits;
};

export const exportedForTesting = {
  indexSeparator,
  generateNewIndexId,
  removeLatestIndex,
  bulkInsert,
};
