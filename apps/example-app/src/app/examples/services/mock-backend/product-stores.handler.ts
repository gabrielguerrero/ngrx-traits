import { Department, ProductsStore, ProductsStoreDetail } from '../../models';
import { getRandomInteger } from '../../utils/form-utils';
import { rest } from 'msw';

export const storeHandlers = [
  rest.get<never, never, ProductsStore[]>('/stores', (req, res, context) => {
    return res(context.status(200), context.json(mockStores));
  }),
  rest.get<never, { id: string }, ProductsStoreDetail | undefined>(
    '/stores/:id',
    (req, res, context) => {
      const id = +req.params.id;
      const storeDetail = mockStoresDetails.find((value) => value.id === id);
      return res(context.status(200), context.json(storeDetail));
    }
  ),
];

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
  'St. John’s Road',
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

const mockStoresDetails: ProductsStoreDetail[] = new Array(200)
  .fill(null)
  .map((_, index) => {
    return {
      id: index,
      name: 'SuperStore ' + index,
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
        name: 'Departament ' + i + ' of SuperStore ' + index,
      })),
    };
  });
const mockStores: ProductsStore[] = mockStoresDetails.map(
  ({ id, name, address }) => ({
    id,
    name,
    address: address.line1 + ', ' + address.town + ', ' + address.postCode,
  })
);

const mockDepartaments: Department[] = new Array(200)
  .fill(null)
  .map((value, index) => ({
    id: index,
    name: 'Departament ' + index,
  }));
