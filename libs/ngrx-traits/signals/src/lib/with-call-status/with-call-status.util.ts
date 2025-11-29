import { capitalize } from '../util';
import {
  createEvent,
  props,
} from '../with-event-handler/with-event-handler.util';

export function getWithCallStatusKeys(config?: {
  prop?: string;
  collection?: string;
  supportPrivate?: boolean;
}) {
  const isCollection = config?.collection !== undefined;
  let prop = config?.prop ?? config?.collection;
  let prefix = '';

  if (config?.supportPrivate && prop?.startsWith('_')) {
    prop = prop.slice(1);
    prefix = '_';
  }

  const capitalizedProp = prop && capitalize(prop);

  return {
    callStatusKey: prop ? `${prefix}${prop}CallStatus` : `${prefix}callStatus`,
    loadingKey: prop && isCollection
      ? `${prefix}is${capitalizedProp}EntitiesLoading`
      : prop ? `${prefix}is${capitalizedProp}Loading` : `${prefix}isLoading`,
    loadedKey: prop && isCollection
      ? `${prefix}is${capitalizedProp}EntitiesLoaded`
      : prop ? `${prefix}is${capitalizedProp}Loaded` : `${prefix}isLoaded`,
    errorKey: prop && isCollection
      ? `${prefix}${prop}EntitiesError`
      : prop ? `${prefix}${prop}Error` : `${prefix}error`,
    setLoadingKey: prop && isCollection
      ? `${prefix}set${capitalizedProp}EntitiesLoading`
      : prop ? `${prefix}set${capitalizedProp}Loading` : `${prefix}setLoading`,
    setLoadedKey: prop && isCollection
      ? `${prefix}set${capitalizedProp}EntitiesLoaded`
      : prop ? `${prefix}set${capitalizedProp}Loaded` : `${prefix}setLoaded`,
    setErrorKey: prop && isCollection
      ? `${prefix}set${capitalizedProp}EntitiesError`
      : prop ? `${prefix}set${capitalizedProp}Error` : `${prefix}setError`,
  };
}

export function getWithCallStatusEvents(config?: { prop?: string }) {
  const collection = config?.prop;
  return {
    callLoading: createEvent(`${collection}.callLoading`),
    callLoaded: createEvent(`${collection}.callLoaded`),
    callError: createEvent(
      `${collection}.callError`,
      props<{ error: unknown }>(),
    ),
  };
}
