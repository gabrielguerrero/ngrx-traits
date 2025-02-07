import { capitalize } from '../util';
import {
  createEvent,
  props,
} from '../with-event-handler/with-event-handler.util';

export function getWithCallStatusKeys(config?: {
  prop?: string;
  supportPrivate?: boolean;
}) {
  let prop = config?.prop;
  let prefix = '';

  if (config?.supportPrivate && prop?.startsWith('_')) {
    prop = prop.slice(1);
    prefix = '_';
  }

  const capitalizedProp = prop && capitalize(prop);
  return {
    callStatusKey: prop ? `${prefix}${prop}CallStatus` : `${prefix}callStatus`,
    loadingKey: prop
      ? `${prefix}is${capitalizedProp}Loading`
      : `${prefix}isLoading`,
    loadedKey: prop
      ? `${prefix}is${capitalizedProp}Loaded`
      : `${prefix}isLoaded`,
    errorKey: prop ? `${prefix}${prop}Error` : `${prefix}error`,
    setLoadingKey: prop
      ? `${prefix}set${capitalizedProp}Loading`
      : `${prefix}setLoading`,
    setLoadedKey: prop
      ? `${prefix}set${capitalizedProp}Loaded`
      : `${prefix}setLoaded`,
    setErrorKey: prop
      ? `${prefix}set${capitalizedProp}Error`
      : `${prefix}setError`,
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
