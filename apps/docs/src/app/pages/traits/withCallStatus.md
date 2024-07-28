---
name: withCallStatus
order: 1
---

# withCallStatus

Generates necessary state, computed and methods for call progress status to the store

**Kind**: global function

## Import

Import the Slider primitives from `@ngrx-traits/signals`.

```ts
import { withCallStatus } from '@ngrx-traits/signals';
```

## Usage

```typescript
const store = signalStore(
  withCallStatus()
);
```

## Examples

```typescript
const store = signalStore(
  withCallStatus()
);
```

```typescript
const store = signalStore(
  withCallStatus({ prop: 'users' })
);
```

```typescript
const store = signalStore(
  withCallStatus({ collection: 'users', initialValue: 'loading', errorType: type<string>() })
);
```

## API Reference

## Configuration

This trait receives and object to allow specific configurations:

| Property        | Description                                                                                    | Value                           |
|-----------------|------------------------------------------------------------------------------------------------|---------------------------------|
| `prop`          | The name of the property for which this represents the call status.                            | string                          |
| `initialValue ` | The initial value of the call status.                                                          | `init` \| `loading` \| `loaded` |
| `collection `   | The name of the collection for which this represents the call status is an alias to prop param | string                          |                                 
| `errorType `    | The type of the error                                                                          | `T`                             |

## State

Generates the following signals

```typescript
callStatus: 'init' | 'loading' | 'loaded' | { error: unknown }
```

## Computed

generates the following computed signals

```typescript
isLoading: boolean
isLoaded: boolean
error: unknown | null
```

## Methods

generates the following computed signals

```typescript 
setLoading: () => void;
setLoaded:() => void;
setError:(error?: unknown) => void;
```


