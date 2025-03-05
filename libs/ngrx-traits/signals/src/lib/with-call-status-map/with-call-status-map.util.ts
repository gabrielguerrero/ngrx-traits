import { capitalize } from '../util';
import {
  createEvent,
  props,
} from '../with-event-handler/with-event-handler.util';

export function getWithCallStatusMapKeys(config: {
  prop: string;
  supportPrivate?: boolean;
}) {
  let prop = config.prop;
  let prefix = '';

  if (config?.supportPrivate && prop.startsWith('_')) {
    prop = prop.slice(1);
    prefix = '_';
  }

  const capitalizedProp = capitalize(prop);
  return {
    callStatusKey: `${prefix}${prop}CallStatus`,
    loadingKey: `${prefix}is${capitalizedProp}Loading`,
    loadedKey: `${prefix}is${capitalizedProp}Loaded`,
    errorKey: `${prefix}${prop}Error`,
    areAllLoadedKey: `areAll${capitalizedProp}Loaded`,
    isAnyLoadingKey: `isAny${capitalizedProp}Loading`,
    errorsKey: `${prop}Errors`,
    setLoadingKey: `${prefix}set${capitalizedProp}Loading`,
    setLoadedKey: `${prefix}set${capitalizedProp}Loaded`,
    setErrorKey: `${prefix}set${capitalizedProp}Error`,
  };
}

export function getWithCallStatusMapEvents(config?: { prop: string }) {
  const collection = config?.prop;
  return {
    callLoading: createEvent(
      `${collection}.callLoading`,
      props<{ id: string }>(),
    ),
    callLoaded: createEvent(
      `${collection}.callLoaded`,
      props<{ id: string }>(),
    ),
    callError: createEvent(
      `${collection}.callError`,
      props<{ id: string; error: unknown }>(),
    ),
  };
}
