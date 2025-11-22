import { mockProducts } from './mock-data';
import { OrderDetail, OrderStatus, OrderSummary, Product } from './models';
import { sortData } from './sort-entities.utils';
import { getRandomInteger } from './utils';

export interface SearchOrdersOptions {
  search?: string | null;
  sortColumn?: string | null;
  sortAscending?: string | null;
  skip?: string | null;
  take?: string | null;
}

export interface OrdersResponse {
  resultList: OrderSummary[];
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

const orderStatusArray = ['Pending', 'Cancelled', 'Delivered'] as const;

function getRandomProducts(count: number): Product[] {
  const shuffled = [...mockProducts].sort(() => 0.5 - Math.random());
  return shuffled
    .slice(0, count)
    .map((product) => ({ ...product, quantity: getRandomInteger(1, 2) }));
}

function setDays(days: number, date = new Date()) {
  const newDate = new Date(date);
  newDate.setDate(days);
  return newDate.toISOString();
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
    status: orderStatusArray[getRandomInteger(0, 2)] as OrderStatus,
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

/**
 * Search and filter orders based on provided options
 */
export function searchOrders(options: SearchOrdersOptions): OrdersResponse {
  let result = [...mockOrders];

  // Filter by search term
  if (options?.search) {
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

  const orders = result.map(({ items, ...entity }) => {
    return entity;
  }) as OrderSummary[];

  return { resultList: orders, total };
}

/**
 * Get order detail by ID
 */
export function getOrderDetail(id: string): OrderDetail | undefined {
  return mockOrders.find((value) => value.id === id);
}

/**
 * Update order status
 */
export function updateOrder(params: {
  id: string;
  changes: { status: OrderSummary['status'] };
}): OrderDetail | undefined {
  const storeDetail = mockOrders.find((value) => value.id === params.id);
  if (storeDetail) {
    storeDetail.status = params.changes.status;
  }
  return storeDetail;
}

/**
 * Delete order by ID
 */
export function deleteOrder(params: { id: string }): boolean {
  const index = mockOrders.findIndex((value) => value.id === params.id);
  mockOrders.splice(index, 1);
  return index > 0;
}
