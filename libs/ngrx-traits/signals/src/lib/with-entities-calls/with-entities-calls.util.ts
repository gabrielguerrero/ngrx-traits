import { capitalize } from '../util';

export function getWithEntitiesCallKeys({ callName }: { callName: string }) {
  const capitalizedName = callName && capitalize(callName);
  return {
    callNameKey: callName,
    areAllLoadedKey: `areAll${capitalizedName}Loaded`,
    isAnyLoadingKey: `isAny${capitalizedName}Loading`,
    isLoadingKey: `is${capitalizedName}Loading`,
    isLoadedKey: `is${capitalizedName}Loaded`,
    errorKey: `${callName}Error`,
    errorsKey: `${callName}Errors`,
    callStatusKey: `${callName}CallStatus`,
  };
}
