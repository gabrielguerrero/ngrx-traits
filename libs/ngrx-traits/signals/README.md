# @ngrx-traits/signals

Set of prebuilt Custom Store Features that solve common problems that normally need to be solved while creating apps, such as adding pagination, sorting, filtering
# Features

- ✅ Reduce boilerplate with generated strongly typed signals and methods.
- ✅ Store Feature to load entities list
- ✅ Store Feature to create a status for backend operations
- ✅ Store Feature to filter remote and locally entities list
- ✅ Store Feature to sort remote and locally entities list
- ✅ Store Feature to paginate entities list locally or remotely
- ✅ Store Feature to create a infinite scroll pagination
- ✅ Store Feature to add single or multi selection entities list
- ✅ Store Feature to reduce boilerplate needed when calling backend apis
- ✅ Store Feature to sync the state to local or session storage
- ✅ Store Feature to sync the route params and query params

# Installation and Usage

`npm i @ngrx-traits/signals --save`

For more documentation go to our [GitHub page](https://github.com/gabrielguerrero/ngrx-traits/blob/main/docs/signals.md)

## Migration Guide (v20.0.0)

Version 20.0.0 introduces a new naming convention for trait-generated properties. All properties now include the `Entities` suffix for consistency:
- `productFilter` → `productEntitiesFilter`
- `isProductsLoading` → `isProductsEntitiesLoading`

**Automatic migration:**
```bash
ng update @ngrx-traits/signals --migrate-only
```

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for details.
