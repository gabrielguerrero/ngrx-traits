import { StatusState } from './load-entities.model';

export function isLoading<S extends StatusState>(state: S) {
  return state.status === 'loading';
}
export function isSuccess<S extends StatusState>(state: S) {
  return state.status === 'success';
}
export function isFail<S extends StatusState>(state: S) {
  return state.status === 'fail';
}
