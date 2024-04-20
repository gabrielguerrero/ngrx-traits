import {
  createEvent,
  props,
} from '../with-event-handler/with-event-handler.util';
import { Sort } from './with-entities-local-sort.model';

export function getWithEntitiesRemoteSortEvents(config?: {
  collection?: string;
}) {
  const collection = config?.collection;
  return {
    entitiesRemoteSortChanged: createEvent(
      `${collection}.entitiesRemoteSortChanged`,
      props<{ sort: Sort<any> }>(),
    ),
  };
}
