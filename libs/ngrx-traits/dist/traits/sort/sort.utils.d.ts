import { Sort } from './sort.model';
/**
 * Gets a sorted copy of the data array based on the state of the Sort.
 * @param data The array of data that should be sorted.
 * @param sort The connected MatSort that holds the current sort state.
 */
export declare function sortData<T>(data: T[], sort: Sort<T>): T[];
