export declare type SortDirection = 'asc' | 'desc' | '';
export interface Sort<T> {
  /** The id of the column being sorted. */
  active: keyof T;
  /** The sort direction. */
  direction: SortDirection;
}
const MAX_SAFE_INTEGER = 9007199254740991;

export function _isNumberValue(value: any): boolean {
  // parseFloat(value) handles most of the cases we're interested in (it treats null, empty string,
  // and other non-number values as NaN, where Number just uses 0) but it considers the string
  // '123hello' to be a valid number. Therefore we also check if Number(value) is NaN.
  return !isNaN(parseFloat(value as any)) && !isNaN(Number(value));
}

function sortingDataAccessor<T>(
  data: T,
  sortHeaderId: string,
): string | number {
  const value = (data as { [key: string]: any })[sortHeaderId];

  if (_isNumberValue(value)) {
    const numberValue = Number(value);

    // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
    // leave them as strings. For more info: https://goo.gl/y5vbSg
    return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
  }

  return value;
}

/**
 * @internal
 * @ignore
 * Gets a sorted copy of the data array based on the state of the Sort.
 * @param data The array of data that should be sorted.
 * @param sort The connected MatSort that holds the current sort state.
 */
export function sortData<T>(data: T[], sort: Sort<T>): T[] {
  const active = sort.active;
  const direction = sort.direction;
  if (!active || direction === '') {
    return data;
  }

  return data.sort((a, b) => {
    const valueA = sortingDataAccessor(a, active as string);
    const valueB = sortingDataAccessor(b, active as string);

    // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
    // one value exists while the other doesn't. In this case, existing value should come last.
    // This avoids inconsistent results when comparing values to undefined/null.
    // If neither value exists, return 0 (equal).
    let comparatorResult = 0;
    if (valueA != null && valueB != null) {
      // Check if one value is greater than the other; if equal, comparatorResult should remain 0.

      if (typeof valueA === 'string' || typeof valueB === 'string') {
        // if either values are a string, then force both to be strings before localCompare
        comparatorResult = valueA.toString().localeCompare(valueB.toString());
      } else {
        if (valueA > valueB) {
          comparatorResult = 1;
        } else if (valueA < valueB) {
          comparatorResult = -1;
        }
      }
    } else if (valueA != null) {
      comparatorResult = 1;
    } else if (valueB != null) {
      comparatorResult = -1;
    }

    return comparatorResult * (direction === 'asc' ? 1 : -1);
  });
}
