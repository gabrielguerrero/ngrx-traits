import {
  getBranchDetail,
  searchBranches,
} from '@example-api/shared/branches.service';
import { http, HttpResponse } from 'msw';

export const branchesHandlers = [
  http.get('/branches', ({ request }) => {
    const url = new URL(request.url);
    const options = {
      search: url.searchParams.get('search'),
      sortColumn: url.searchParams.get('sortColumn'),
      sortAscending: url.searchParams.get('sortAscending'),
      skip: url.searchParams.get('skip'),
      take: url.searchParams.get('take'),
    };
    const response = searchBranches(options);
    return HttpResponse.json(response);
  }),
  http.get('/branches/:id', ({ params }) => {
    const id = params.id as string;
    const branchDetail = getBranchDetail(id);
    return HttpResponse.json(branchDetail);
  }),
];
