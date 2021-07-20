import { StatusState } from './load-entities.model';
export declare function isLoading<S extends StatusState>(state: S): boolean;
export declare function isSuccess<S extends StatusState>(state: S): boolean;
export declare function isFail<S extends StatusState>(state: S): boolean;
