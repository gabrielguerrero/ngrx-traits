import { capitalize } from '../util';

export function getWithCallStatusKeys(config?: { prop?: string }) {
  const prop = config?.prop;
  const capitalizedProp = prop && capitalize(prop);
  return {
    callStatusKey: prop ? `${config.prop}CallStatus` : 'callStatus',
    loadingKey: prop ? `is${capitalizedProp}Loading` : 'isLoading',
    loadedKey: prop ? `is${capitalizedProp}Loaded` : 'isLoaded',
    errorKey: prop ? `${config.prop}Error` : 'error',
    setLoadingKey: prop ? `set${capitalizedProp}Loading` : 'setLoading',
    setLoadedKey: prop ? `set${capitalizedProp}Loaded` : 'setLoaded',
    setErrorKey: prop ? `set${capitalizedProp}Error` : 'setError',
  };
}
