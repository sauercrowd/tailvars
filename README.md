# tailvars

A tailwind inspired syntax, letting you directly assign css variables to dom elements through attributes

## Example
```<div x-css-vars="p--1 hover:bg--gray-500 pl-[8px] @sm:pr--8">...</div>
```

Generates a class such as

```
{
  padding: var(--1);
  padding-left: 8px;
}

:hover {
   background: var(--gray-500);
}

@media (min-width: 360px) {
  padding-right: var(--8);
}
```

The syntax is the following
```
@maybeMediaQuery:maybePrefix:propertyNameOrAlias--varName
```

Or for literal values
```
@maybeMediaQuery:maybePrefix:propertyNameOrAlias-[literalValue]
```

Media Queries are optional and can be configured or extended by assigning additional values to the object `window.VARWIND_DEFAULT_MEDIA_QUERIES



### Advantages
- no build step
- browser native css variable
- predictable syntax
- extensible through regular additional stylesheets
