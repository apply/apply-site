# Apply.io

Create your apps, manage your data and display it in a beatiful way.

## Schema

### Blobs

    id
    name
    itemName
    types [
      {type, name[, options]}
    ]
    createdAt
    updatedAt
    availableViews

### Items

    id
    fields [
      {type, name, value}
    ]
    blob {
      id
      name
      itemName
    }
    createdAt
    updatedAt

## Tests

Tests are under `tests` folders.

``` bash
make
```
