import { capitalize } from '../util';

export function getWithCallStatusKeys(config?: { prop?: string }) {
  const prop = config?.prop;
  const capitalizedProp = prop && capitalize(prop);
  return {
    callStatusKey: prop ? `${config.prop}CallStatus` : 'callStatus',
    loadingKey: prop ? `${config.prop}Loading` : 'loading',
    loadedKey: prop ? `${config.prop}Loaded` : 'loaded',
    errorKey: prop ? `${config.prop}Error` : 'error',
    setLoadingKey: prop ? `set${capitalizedProp}Loading` : 'setLoading',
    setLoadedKey: prop ? `set${capitalizedProp}Loaded` : 'setLoaded',
    setErrorKey: prop ? `set${capitalizedProp}Error` : 'setError',
  };
}
