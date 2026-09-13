import { CallTypeError, IsAny } from '../with-calls/with-calls.model';
import { EntityCallConfig } from './with-entities-calls.model';

/**
 * Rejects a call whose parameter is `any` where the config is written, so the
 * message lands on the offending call rather than on every use of the
 * generated method. A trailing parameter rather than an intersection on the
 * config, which would keep `Entity` from being inferred from the contextual
 * return type, and with it the check on `paramsSelectId`.
 */
type RejectAnyParam<Param> =
  IsAny<Param> extends true
    ? [
        error: CallTypeError<'withEntitiesCalls: a call parameter of type `any` is not supported, give the call an explicit parameter type'>,
      ]
    : [];

/**
 * A parameter withEntitiesCalls can take the entity id from on its own: the
 * id, the entity, or an object holding the entity.
 */
type EntityParam<Entity> =
  | string
  | number
  | Entity
  | ({ entity: Entity } & Record<string, any>);

type EntityCallConfigOptions<Entity, Param, Result, Error> = Omit<
  EntityCallConfig<Entity, Param, Result, Error>,
  'paramsSelectId'
>;

/**
 * Call configuration object for withEntitiesCalls
 * @param config - the call configuration
 * @param config.call - required, the function that will be called
 * @param config.paramsSelectId - a function that returns the entity id from the params, required when the param is not the entity, its id, or an object with an entity prop
 * @param config.storeResult - optional, default true, if false, the result will not be stored in the entity
 * @param config.onSuccess - optional, a function that will be called when the call is successful
 * @param config.mapError - optional, a function that will be called to transform the error before storing it
 * @param config.onError - optional, a function that will be called when the call fails
 * @param config.skipWhen - optional, a function that will be called to determine if the call should be skipped
 * @param config.callWith - optional, reactively execute the call with the provided params return by a function or observable
 */
// withEntitiesCalls gives the config a contextual type of
// EntityCallConfig<Entity, any, any, any>: Entity is inferred from it, which
// is what lets the Param constraint check the call parameter, and NoInfer
// keeps the `any`s out of the generics the argument does not mention
export function entityCallConfig<
  Entity,
  Param extends EntityParam<Entity>,
  Result = Partial<Entity> | undefined,
  Error = unknown,
>(
  config: EntityCallConfigOptions<Entity, Param, Result, Error> & {
    paramsSelectId?: (param: NoInfer<Param>) => string;
  },
  ...reject: RejectAnyParam<Param>
): EntityCallConfig<Entity, NoInfer<Param>, NoInfer<Result>, NoInfer<Error>>;
export function entityCallConfig<Param, Result, Error = unknown>(
  config: EntityCallConfigOptions<any, Param, Result, Error> & {
    paramsSelectId: (param: NoInfer<Param>) => string;
  },
  ...reject: RejectAnyParam<Param>
): EntityCallConfig<any, NoInfer<Param>, NoInfer<Result>, NoInfer<Error>>;
export function entityCallConfig(config: any, ..._reject: unknown[]): any {
  return config;
}
