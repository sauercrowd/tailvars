# tailvars

A tailwind inspired syntax, letting you directly assign css variables to dom elements through attributes

## Example
```html
<div x-css-vars="p--1 hover:bg--gray-500 pl-[8px] @sm:pr--8">...</div>
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

Aliases are both available for prefixes (pseudo elements or classes) and properties, and are preset per default (e.g. `p` --> `padding` and `hover` --> `:hover`), but can be overriden or removed easily.


### Advantages
- no build step
- browser native css variable
- predictable syntax
- extensible through regular additional stylesheets

### Configuration

*Media Queries*

Are defined on the object `window.VARWIND_DEFAULT_MEDIA_QUERIES` and can be extended through `window.VARWIND_EXTRA_MEDIA_QUERIES`.
To disable the preset media queries simply override the default configuration.

Current defaults:
```
window.VARWIND_DEFAULT_MEDIA_QUERIES = {
    'sm': '(min-width: 640px)',
    'md': '(min-width: 768px)',
    'lg': '(min-width: 1024px)',
    'xl': '(min-width: 1280px)',
}
```


*Properties*
Are defined on the object `window.VARWIND_DEFAULT_PROPERTY_ALIASES` and can be extended through `window.VARWIND_EXTRA_PROPERTY_ALIASES`.
If no alias is found, the literal value will be used (so any css property is availabe with the default config).
They can map to either a string or an array. If it's an array, all properties will be set to the value used.

To disable the preset prefixes simply override the default configuration

Current defaults
```
window.VARWIND_DEFAULT_PROPERTY_ALIASES = {
    'p': 'padding',
    'pl': 'padding-left',
    'pr': 'padding-right',
    'pt': 'padding-top',
    'pb': 'padding-bottom',
    'px':['padding-left', 'padding-right'],
    'py': ['padding-top', 'padding-bottom'],
    'm': 'margin',
    'ml': 'margin-left',
    'mr': 'margin-right',
    'mt': 'margin-top',
    'mb': 'margin-bottom',
    'mx': ['margin-left', 'margin-right'],
    'my': ['margin-top', 'margin-bottom'],
    'd': 'display',
    'bg': 'background',
}
```


*Prefixes*

Are defined on the object `window.VARWIND_DEFAULT_PREFIXES` and can be extended through `window.VARWIND_EXTRA_PREFIXES`.
To disable the preset prefixes simply override the default configuration

Current defaults
```
window.VARWIND_DEFAULT_PREFIXES= {
    'hover': ':hover',
    'focus': ':focus',
    'active': ':active',
    'disabled': ':disabled',
    'after': '::after',
    'before': '::before',
    'first-child': ':first-child',
    'last-child': ':last-child',
    'odd': ':nth-child(odd)',
    'even': ':nth-child(even)',
    'enabled': ':enabled',
    'checked': ':checked',
    'valid': ':valid',
    'invalid': ':invalid',
    'required': ':required',
    'indeterminate': ':indeterminate',
    'visited': ':visited',
    'empty': ':empty',
    'default': ':default',
    'fullscreen': ':fullscreen',
    'autofill': ':autofill',
}
```
