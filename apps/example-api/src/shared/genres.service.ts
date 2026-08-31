import { Genre, genreOptionsArray, GenreResponse } from './models';
import { sortData } from './sort-entities.utils';

export interface SearchGenresOptions {
  search?: string | null;
  sortColumn?: string | null;
  sortAscending?: string | null;
  skip?: string | null;
  take?: string | null;
}

/**
 * Search and filter genres based on provided options
 */
export function searchGenres(options: SearchGenresOptions): GenreResponse {
  let result = [...genreOptionsArray];

  // Filter by search term (label substring, case-insensitive)
  if (options?.search) {
    result = result.filter((entity) =>
      entity.label.toLowerCase().includes(options.search!.toLowerCase()),
    );
  }

  const total = result.length;

  // Apply sorting — default to label ascending when no sortColumn given
  if (options?.sortColumn) {
    result = sortData(result, {
      active: options.sortColumn as keyof { id: Genre; label: string },
      direction: options.sortAscending === 'true' ? 'asc' : 'desc',
    });
  } else {
    result = sortData(result, { active: 'label', direction: 'asc' });
  }

  // Apply pagination
  if (options?.skip || options?.take) {
    const skip = +(options?.skip ?? 0);
    const take = +(options?.take ?? 0);
    result = result.slice(skip, skip + take);
  }

  return { resultList: result, total };
}
