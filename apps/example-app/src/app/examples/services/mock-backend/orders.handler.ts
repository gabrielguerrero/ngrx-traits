import { sortData } from '@ngrx-traits/common';
import { rest } from 'msw';

import { mockProducts } from '../../../../../../../libs/ngrx-traits/signals/src/lib/test.mocks';
import {
  Branch,
  BranchDetail,
  BranchQuery,
  BranchResponse,
  OrderDetail,
  OrderQuery,
  OrderResponse,
  orderStatusArray,
  OrderSummary,
  Product,
} from '../../models';
import { getRandomInteger } from '../../utils/form-utils';

export const ordersHandlers = [
  rest.get<never, OrderQuery, OrderResponse>('/orders', (req, res, ctx) => {
    let result = [...mockOrders];
    const options = {
      search: req.url.searchParams.get('search'),
      sortColumn: req.url.searchParams.get('sortColumn'),
      sortAscending: req.url.searchParams.get('sortAscending'),
      skip: req.url.searchParams.get('skip'),
      take: req.url.searchParams.get('take'),
    };
    if (options?.search)
      result = mockOrders.filter((entity) => {
        return options?.search
          ? entity.userEmail
              .toLowerCase()
              .includes(options?.search.toLowerCase()) ||
              entity.userName
                .toLowerCase()
                .includes(options?.search.toLowerCase()) ||
              entity.status
                .toLowerCase()
                .includes(options?.search.toLowerCase()) ||
              entity.id.toLowerCase().includes(options?.search.toLowerCase())
          : false;
      });
    const total = result.length;
    if (options?.skip || options?.take) {
      const skip = +(options?.skip ?? 0);
      const take = +(options?.take ?? 0);
      result = result.slice(skip, skip + take);
    }
    if (options?.sortColumn) {
      result = sortData(result, {
        active: options.sortColumn as any,
        direction: options.sortAscending === 'true' ? 'asc' : 'desc',
      });
    }
    const orders = result.map(({ items, ...entity }) => {
      return entity;
    }) as OrderSummary[];
    return res(ctx.status(200), ctx.json({ resultList: orders, total }));
  }),
  rest.get<never, { id: string }, OrderDetail | undefined>(
    '/orders/:id',
    (req, res, context) => {
      const id = req.params.id;
      const storeDetail = mockOrders.find((value) => value.id === id);
      return res(context.status(200), context.json(storeDetail));
    },
  ),
  rest.put<
    { status: OrderSummary['status'] },
    { id: string },
    OrderDetail | undefined
  >('/orders/:id', (req, res, context) => {
    const id = req.params.id;
    req.body.status;
    const storeDetail = mockOrders.find((value) => value.id === id);
    if (storeDetail) {
      storeDetail.status = req.body.status;
    }
    return res(context.status(200), context.json(storeDetail));
  }),
  rest.delete<never, { id: string }, boolean>(
    '/orders/:id',
    (req, res, context) => {
      const id = req.params.id;
      const index = mockOrders.findIndex((value) => value.id === id);
      mockOrders.splice(index, 1);
      return res(context.status(200), context.json(index > 0));
    },
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
const users = [
  { userName: 'Alice Johnson', userEmail: 'alice@example.com' },
  { userName: 'Bob Smith', userEmail: 'bob@example.com' },
  { userName: 'Carol White', userEmail: 'carol@example.com' },
  { userName: 'David Brown', userEmail: 'david@example.com' },
  { userName: 'Eve Green', userEmail: 'eve@example.com' },
  { userName: 'Frank Black', userEmail: 'frank@example.com' },
  { userName: 'Grace Lee', userEmail: 'grace@example.com' },
  { userName: 'Hank Adams', userEmail: 'hank@example.com' },
];

function getRandomProducts(count: number): Product[] {
  const shuffled = [...mockProducts].sort(() => 0.5 - Math.random());
  return shuffled
    .slice(0, count)
    .map((product) => ({ ...product, quantity: getRandomInteger(1, 2) }));
}

const mockOrders: OrderDetail[] = users.map((user, index) => {
  const items = getRandomProducts(5);
  const quantity = items.length;
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return {
    id: `${index + 1}`,
    userName: user.userName,
    userEmail: user.userEmail,
    items,
    quantity,
    total,
    status: orderStatusArray[getRandomInteger(0, 2)].id,
    date: setDays(getRandomInteger(0, 28)),
    deliveryAddress: {
      line1:
        getRandomInteger(1, 99) +
        ' ' +
        streets[getRandomInteger(0, streets.length - 1)],
      postCode: postCodes[getRandomInteger(0, postCodes.length - 1)],
      country: 'UK',
      town: locations[getRandomInteger(0, locations.length - 1)],
    },
  };
});

function setDays(days: number, date = new Date()) {
  const newDate = new Date(date);
  newDate.setDate(days);
  return newDate.toISOString();
}
