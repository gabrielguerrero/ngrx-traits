import { Branch, BranchDetail } from './models';
import { sortData } from './sort-entities.utils';
import { getRandomInteger } from './utils';

export interface SearchBranchesOptions {
  search?: string | null;
  sortColumn?: string | null;
  sortAscending?: string | null;
  skip?: string | null;
  take?: string | null;
}

export interface BranchesResponse {
  resultList: Branch[];
  total: number;
}

const locations = [
  'Picadilly',
  'Angel',
  'Nothing Hill',
  'Canary Warf',
  'Woking',
  'Reading',
  'Waterloo',
  'Chelsea',
  'Peterborough',
  'Birmingham',
  'Kingston Upon Thames',
];

const streets = [
  'Grove Road',
  'The Green',
  "St. John's Road",
  'Main Road',
  'The Avenue',
  'School Lane',
  'King Street',
  'Chester Road',
  'Church Lane',
  'Park Lane',
];

const postCodes = [
  'CV21 1HW',
  'WA6 6JX',
  'CV3 5EP',
  'M41 0XE',
  'GU2 8BA',
  'DE11 7NT',
  'PE12 8AJ',
  'AB15 9EP',
  'B67 6LL',
  'SG15 6AW',
  'M35 0BT',
  'NE16 4QS',
  'NP18 3EY',
  'NE61 5SR',
  'BS36 2FG',
  'PE12 9TZ',
  'DL17 8LE',
  'TS28 5BL',
  'SG4 0QS',
  'NE34 9JZ',
];

const names = [
  'Flower Iris',
  'Alexina Giles',
  'Alayah Marion',
  'Summer Darden',
  'Emery Kimmy',
  'Kenrick Dane',
  'Darius Shanene',
  'Frieda Tahlia',
  'Leroy Remy',
  'Beatrice Sharona',
  'Anabelle Mary Beth',
  'Kylie Trisha',
  'Clara Kester',
  'Tamela Harrietta',
  'Wendi Ellis',
];

const mockBranchesDetails: BranchDetail[] = new Array(500)
  .fill(null)
  .map((_, index) => {
    return {
      id: index,
      name: 'Branch ' + index,
      phone:
        getRandomInteger(100, 300) +
        ' ' +
        getRandomInteger(200, 400) +
        ' ' +
        getRandomInteger(3000, 6000),
      address: {
        line1:
          getRandomInteger(1, 99) +
          ' ' +
          streets[getRandomInteger(0, streets.length - 1)],
        postCode: postCodes[getRandomInteger(0, postCodes.length - 1)],
        country: 'UK',
        town: locations[getRandomInteger(0, locations.length - 1)],
      },
      manager: names[getRandomInteger(0, names.length - 1)],
      departments: new Array(200).fill(null).map((value, i) => ({
        id: i,
        name: 'Department ' + i + ' of Branch ' + index,
      })),
    };
  });

const mockBranches: Branch[] = mockBranchesDetails.map(
  ({ id, name, address }) => ({
    id,
    name,
    address: address.line1 + ', ' + address.town + ', ' + address.postCode,
  }),
);

/**
 * Search and filter branches based on provided options
 */
export function searchBranches(
  options: SearchBranchesOptions,
): BranchesResponse {
  let result = [...mockBranches];

  // Filter by search term
  if (options?.search) {
    result = mockBranches.filter((entity) => {
      return options?.search
        ? entity.name.toLowerCase().includes(options?.search.toLowerCase())
        : false;
    });
  }

  const total = result.length;

  // Apply pagination
  if (options?.skip || options?.take) {
    const skip = +(options?.skip ?? 0);
    const take = +(options?.take ?? 0);
    result = result.slice(skip, skip + take);
  }

  // Apply sorting
  if (options?.sortColumn) {
    result = sortData(result, {
      active: options.sortColumn as any,
      direction: options.sortAscending === 'true' ? 'asc' : 'desc',
    });
  }

  return { resultList: result, total };
}

/**
 * Get branch detail by ID
 */
export function getBranchDetail(id: string): BranchDetail | undefined {
  const branchId = +id;
  return mockBranchesDetails.find((value) => value.id === branchId);
}
