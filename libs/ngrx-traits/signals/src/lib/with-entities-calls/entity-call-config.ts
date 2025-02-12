import { EntityCallConfig } from './with-entities-calls.model';

/**
 * Call configuration object for withEntitiesCalls
 * @param config - the call configuration
 * @param config.call - required, the function that will be called
 * @param config.mapResult - required, a function to transform the result of the call to the entity
 * @param config.entityId - required, a function that returns the entity id in the params
 * @param config.onSuccess - optional, a function that will be called when the call is successful
 * @param config.mapError - optional, a function that will be called to transform the error before storing it
 * @param config.onError - optional, a function that will be called when the call fails
 * @param config.skipWhen - optional, a function that will be called to determine if the call should be skipped
 * @param config.callWith - optional, reactively execute the call with the provided params return by a function or signal or observable
 * @param config.defaultResult - optional, A default value for the result before the call is executed
 */

export function entityCallConfig<
  Entity,
  Param,
  Result = Partial<Entity> | undefined,
  Error = unknown,
  C extends EntityCallConfig<Param, Result, Error> = EntityCallConfig<
    Param,
    Result,
    Error
  >,
>(
  config: Omit<
    EntityCallConfig<Entity, Param, Result, Error>,
    'storeResult' | 'paramsSelectId'
  > & { paramsSelectId: (param: NoInfer<Param>) => string },
): EntityCallConfig<Entity, Param, Result, Error>;
export function entityCallConfig<
  Param,
  Result,
  Error = unknown,
  C extends EntityCallConfig<any, Param, Result, Error> = EntityCallConfig<
    any,
    Param,
    Result,
    Error
  >,
>(
  config: Omit<
    EntityCallConfig<any, Param, Result, Error>,
    'storeResult' | 'paramsSelectId'
  > & { paramsSelectId: (param: NoInfer<Param>) => string; storeResult: false },
): EntityCallConfig<any, Param, Result, Error>;
export function entityCallConfig<
  Entity,
  Param extends
    | string
    | number
    | Entity
    | ({ entity: Entity } & Record<string, any>),
  Result = Partial<Entity> | undefined,
  Error = unknown,
  C extends EntityCallConfig<Entity, Param, Result, Error> = EntityCallConfig<
    Entity,
    Param,
    Result,
    Error
  >,
>(
  config: Omit<
    EntityCallConfig<Entity, Param, Result, Error>,
    'storeResult' | 'paramsSelectId'
  >,
): EntityCallConfig<Entity, Param, Result, Error>;
export function entityCallConfig(config: any): any {
  return config;
}
