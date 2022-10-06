import { exportedForTesting } from '../../services/elasticSearchService';
import { beforeAll, expect } from '@jest/globals';
import { Client } from '@elastic/elasticsearch';

const aliasName = '55dda743-de78-4e91-a6af-efa1a975fb16';
const indexId =
  aliasName + exportedForTesting.indexSeparator + '20220918103927';
const indexList = [
  `${aliasName}${exportedForTesting.indexSeparator}20220918193927`,
  `${aliasName}${exportedForTesting.indexSeparator}20220918183927`,
  `${aliasName}${exportedForTesting.indexSeparator}20220918103927`,
  `${aliasName}${exportedForTesting.indexSeparator}20220918093927`,
  `${aliasName}${exportedForTesting.indexSeparator}20220918143941`,
  `${aliasName}${exportedForTesting.indexSeparator}20220918143203`,
  `${aliasName}${exportedForTesting.indexSeparator}20220911143927`,
  `${aliasName}${exportedForTesting.indexSeparator}20220909143927`,
  `${aliasName}${exportedForTesting.indexSeparator}20220918143927`,
];
const documentList = [
  {
    userId: 1,
    id: 1,
    title:
      'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
    body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
  },
  {
    userId: 1,
    id: 2,
    title: 'qui est esse',
    body: 'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla',
  },
  {
    userId: 1,
    id: 3,
    title: 'ea molestias quasi exercitationem repellat qui ipsa sit aut',
    body: 'et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut',
  },
  {
    userId: 1,
    id: 4,
    title: 'eum et est occaecati',
    body: 'ullam et saepe reiciendis voluptatem adipisci\nsit amet autem assumenda provident rerum culpa\nquis hic commodi nesciunt rem tenetur doloremque ipsam iure\nquis sunt voluptatem rerum illo velit',
  },
  {
    userId: 1,
    id: 5,
    title: 'nesciunt quas odio',
    body: 'repudiandae veniam quaerat sunt sed\nalias aut fugiat sit autem sed est\nvoluptatem omnis possimus esse voluptatibus quis\nest aut tenetur dolor neque',
  },
];
const documentBulkFlatList = documentList.flatMap((item) => [
  { index: { _index: indexId } },
  item,
]);
const willDeleteIndexList = [
  `${aliasName}${exportedForTesting.indexSeparator}20220918143941`,
  `${aliasName}${exportedForTesting.indexSeparator}20220918143927`,
  `${aliasName}${exportedForTesting.indexSeparator}20220918143203`,
  `${aliasName}${exportedForTesting.indexSeparator}20220918103927`,
  `${aliasName}${exportedForTesting.indexSeparator}20220918093927`,
  `${aliasName}${exportedForTesting.indexSeparator}20220911143927`,
  `${aliasName}${exportedForTesting.indexSeparator}20220909143927`,
];
jest.mock('@elastic/elasticsearch', () => {
  const mockIndicesDeleteSingletonFunction = jest.fn();
  const mockBulkSingletonFunction = jest.fn();
  return {
    Client: jest.fn(() => {
      return {
        indices: {
          delete: mockIndicesDeleteSingletonFunction,
        },
        bulk: mockBulkSingletonFunction,
        cat: {
          indices: jest.fn(async () => {
            return indexList.map((i) => {
              return { index: i };
            });
          }),
        },
      };
    }),
  };
});

describe('Services', () => {
  beforeAll(() => {});
  it('Generate New Index', () => {
    const result = exportedForTesting.generateNewIndexId(aliasName);
    const expectedIndexLength =
      aliasName.length +
      exportedForTesting.indexSeparator.length +
      'YYYYMMDDHHmmss'.length;

    expect(result).toContain(exportedForTesting.indexSeparator);
    expect(result.length).toBe(expectedIndexLength);
  });

  it('Remove Last Index', async () => {
    await exportedForTesting.removeLatestIndex(aliasName);
    const client = new Client({});
    expect(client.indices.delete).toHaveBeenCalledWith({
      index: willDeleteIndexList,
    });
  });

  it('Bulk Insert', async () => {
    await exportedForTesting.bulkInsert(indexId, documentList as [any]);
    const client = new Client({});
    expect(client.bulk).toHaveBeenCalledWith({
      refresh: true,
      operations: documentBulkFlatList,
    });
  });
});
